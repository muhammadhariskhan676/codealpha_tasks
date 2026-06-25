// hooks/useWebRTC.js
// Manages WebRTC peer connections for multi-user video calling.
// Uses a mesh topology — every peer connects to every other peer directly.

import { useRef, useState, useCallback, useEffect } from "react";

// ICE servers — STUN handles NAT traversal for most users.
// Add TURN servers here for production to support restricted networks.
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const useWebRTC = (socket, user) => {
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peerConnectionsRef = useRef({}); // socketId => RTCPeerConnection

  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // socketId => { stream, userName }
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // ─── Start local camera + mic ───────────────────────────────────────────
  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error("Could not access camera/mic:", err.message);
      // Return null — the UI will show a "no camera" state
      return null;
    }
  }, []);

  // ─── Create a peer connection for one remote user ──────────────────────
  const createPeerConnection = useCallback(
    (remoteSocketId, remoteUserName) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      // Add our local tracks to the connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      // When we get a remote track, store the stream for rendering
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        setRemoteStreams((prev) => ({
          ...prev,
          [remoteSocketId]: { stream: remoteStream, userName: remoteUserName },
        }));
      };

      // Forward ICE candidates to the remote peer via Socket.io
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            to: remoteSocketId,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
          removePeer(remoteSocketId);
        }
      };

      peerConnectionsRef.current[remoteSocketId] = pc;
      return pc;
    },
    [socket]
  );

  // ─── Initiate call to a new peer (we are the caller) ──────────────────
  const callPeer = useCallback(
    async (remoteSocketId, remoteUserName) => {
      const pc = createPeerConnection(remoteSocketId, remoteUserName);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket?.emit("offer", { offer, to: remoteSocketId });
    },
    [createPeerConnection, socket]
  );

  // ─── Remove a peer when they disconnect ───────────────────────────────
  const removePeer = useCallback((socketId) => {
    if (peerConnectionsRef.current[socketId]) {
      peerConnectionsRef.current[socketId].close();
      delete peerConnectionsRef.current[socketId];
    }
    setRemoteStreams((prev) => {
      const updated = { ...prev };
      delete updated[socketId];
      return updated;
    });
  }, []);

  // ─── Socket.io signal handlers ─────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // Someone already in the room — call them
    socket.on("room-participants", (participants) => {
      participants.forEach(({ socketId, userName }) => {
        callPeer(socketId, userName);
      });
    });

    // New user joined — they will call us, but we create a pc ready to receive
    socket.on("user-joined", ({ socketId, userName }) => {
      // PC is created when their offer arrives
      console.log(`${userName} joined`);
    });

    // Received an offer from a new peer — answer it
    socket.on("offer", async ({ offer, from, userName }) => {
      const pc = createPeerConnection(from, userName);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { answer, to: from });
    });

    // Received an answer to our offer
    socket.on("answer", async ({ answer, from }) => {
      const pc = peerConnectionsRef.current[from];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    // ICE candidate from a remote peer
    socket.on("ice-candidate", async ({ candidate, from }) => {
      const pc = peerConnectionsRef.current[from];
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("ICE candidate error:", err);
        }
      }
    });

    // A peer disconnected
    socket.on("user-left", ({ socketId }) => {
      removePeer(socketId);
    });

    return () => {
      socket.off("room-participants");
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-left");
    };
  }, [socket, callPeer, createPeerConnection, removePeer]);

  // ─── Controls ─────────────────────────────────────────────────────────
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setIsAudioOn((prev) => !prev);
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setIsVideoOn((prev) => !prev);
    }
  }, []);

  const startScreenShare = useCallback(async (roomId) => {
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = screen;
      setIsScreenSharing(true);

      // Replace video track in all peer connections
      const screenTrack = screen.getVideoTracks()[0];
      Object.values(peerConnectionsRef.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) sender.replaceTrack(screenTrack);
      });

      // When user stops sharing via browser UI
      screenTrack.onended = () => stopScreenShare(roomId);

      socket?.emit("screen-share-started", { roomId });
    } catch (err) {
      console.error("Screen share failed:", err.message);
    }
  }, [socket]);

  const stopScreenShare = useCallback(
    async (roomId) => {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      setIsScreenSharing(false);

      // Restore the camera video track in all peer connections
      const camTrack = localStreamRef.current?.getVideoTracks()[0];
      if (camTrack) {
        Object.values(peerConnectionsRef.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender) sender.replaceTrack(camTrack);
        });
      }

      socket?.emit("screen-share-stopped", { roomId });
    },
    [socket]
  );

  // ─── Cleanup when leaving the room ────────────────────────────────────
  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
    peerConnectionsRef.current = {};
    setLocalStream(null);
    setRemoteStreams({});
    setIsScreenSharing(false);
  }, []);

  return {
    localStream,
    remoteStreams,
    isAudioOn,
    isVideoOn,
    isScreenSharing,
    startLocalStream,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    cleanup,
  };
};
