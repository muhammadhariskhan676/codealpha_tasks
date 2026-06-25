// pages/MeetingRoom.jsx
// The full meeting room — video grid, controls, sidebar panels (chat/files).
// Connects to Socket.io, starts WebRTC, and manages all in-room state.

import { useState, useEffect, useRef } from "react";
import { useWebRTC } from "../hooks/useWebRTC";
import VideoGrid from "../components/Video/VideoGrid";
import Controls from "../components/Video/Controls";
import ChatPanel from "../components/Chat/ChatPanel";
import FilesPanel from "../components/Files/FilesPanel";
import Whiteboard from "../components/Whiteboard/Whiteboard";
import "./MeetingRoom.css";

const MeetingRoom = ({ roomId, currentUser, socket, onLeave }) => {
  const [sideTab, setSideTab] = useState("chat"); // "chat" | "files" | "people"
  const [showSide, setShowSide] = useState(true);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [screenStream, setScreenStreamState] = useState(null);

  const {
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
  } = useWebRTC(socket, currentUser);

  // Start camera + join room on mount
  useEffect(() => {
    const init = async () => {
      await startLocalStream();

      if (socket && roomId) {
        socket.emit("join-room", {
          roomId,
          userId: currentUser?.id,
          userName: currentUser?.name,
        });
      }
    };

    init();

    // Listen for screen share events from others
    socket?.on("screen-share-started", ({ socketId, userName }) => {
      console.log(`${userName} started screen sharing`);
    });

    return () => {
      cleanup();
      socket?.off("screen-share-started");
      socket?.off("screen-share-stopped");
    };
  }, [roomId, socket]);

  // Track participants from remoteStreams
  useEffect(() => {
    const names = Object.values(remoteStreams).map((r) => r.userName);
    setParticipants(names);
  }, [remoteStreams]);

  const handleToggleScreen = async () => {
    if (isScreenSharing) {
      await stopScreenShare(roomId);
      setScreenStreamState(null);
    } else {
      await startScreenShare(roomId);
    }
  };

  const handleLeave = () => {
    cleanup();
    onLeave();
  };

  return (
    <div className="meeting-room">
      {/* Top bar */}
      <div className="meeting-topbar">
        <div className="meeting-topbar-left">
          <div className="meeting-logo-mark">VX</div>
          <div className="meeting-live-badge">
            <span className="meeting-live-dot" />
            LIVE
          </div>
          <span className="meeting-enc-note">🔒 E2E Encrypted</span>
        </div>

        <div className="meeting-topbar-center">
          <span className="meeting-title">
            {participants.length + 1} participant{participants.length !== 0 ? "s" : ""}
          </span>
        </div>

        <div className="meeting-topbar-right">
          <div className="meeting-tab-switcher">
            {[["chat", "💬"], ["files", "📁"], ["people", "👥"]].map(([tab, icon]) => (
              <button
                key={tab}
                className={`meeting-tab-btn ${sideTab === tab && showSide ? "active" : ""}`}
                onClick={() => { setSideTab(tab); setShowSide(true); }}
              >
                {icon}
              </button>
            ))}
            <button
              className={`meeting-tab-btn ${!showSide ? "active" : ""}`}
              onClick={() => setShowSide((v) => !v)}
              title="Toggle side panel"
            >
              ◧
            </button>
          </div>
        </div>
      </div>

      {/* Body: video + side panel */}
      <div className="meeting-body">
        {/* Video area */}
        <div className="meeting-video-area">
          <VideoGrid
            localStream={localStream}
            remoteStreams={remoteStreams}
            localUser={currentUser}
            isScreenSharing={isScreenSharing}
            screenStream={screenStream}
          />

          <Controls
            isAudioOn={isAudioOn}
            isVideoOn={isVideoOn}
            isScreenSharing={isScreenSharing}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onToggleScreen={handleToggleScreen}
            onOpenWhiteboard={() => setShowWhiteboard(true)}
            onLeave={handleLeave}
            roomId={roomId}
          />
        </div>

        {/* Side panel */}
        {showSide && (
          <div className="meeting-side">
            {sideTab === "chat" && (
              <ChatPanel socket={socket} roomId={roomId} currentUser={currentUser} />
            )}
            {sideTab === "files" && (
              <FilesPanel roomId={roomId} />
            )}
            {sideTab === "people" && (
              <div className="meeting-people-panel">
                <div className="chat-header">
                  <span>👥</span>
                  <span className="chat-header-title">
                    Participants ({participants.length + 1})
                  </span>
                </div>
                <div className="meeting-people-list">
                  {/* Current user */}
                  <div className="meeting-person-row">
                    <div className="meeting-person-avatar">
                      {currentUser?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="meeting-person-name">
                      {currentUser?.name}
                      <span className="meeting-you-badge">You</span>
                    </span>
                    <span className="meeting-person-online" />
                  </div>
                  {/* Remote participants */}
                  {Object.values(remoteStreams).map(({ userName }, i) => (
                    <div key={i} className="meeting-person-row">
                      <div className="meeting-person-avatar">
                        {userName?.[0]?.toUpperCase()}
                      </div>
                      <span className="meeting-person-name">{userName}</span>
                      <span className="meeting-person-online" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Whiteboard overlay */}
      {showWhiteboard && (
        <Whiteboard
          socket={socket}
          roomId={roomId}
          onClose={() => setShowWhiteboard(false)}
        />
      )}
    </div>
  );
};

export default MeetingRoom;
