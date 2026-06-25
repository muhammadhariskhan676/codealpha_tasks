// socket/socketHandler.js
// Central Socket.io event hub.
// Handles: WebRTC signaling, room chat, whiteboard sync, screen sharing events.

// Track which socket IDs are in which rooms
const roomParticipants = new Map(); // roomId => Set of socketIds

const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ─── Room Management ──────────────────────────────────────────────────
    socket.on("join-room", ({ roomId, userId, userName }) => {
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.userId = userId;
      socket.data.userName = userName;

      // Track participants in memory
      if (!roomParticipants.has(roomId)) {
        roomParticipants.set(roomId, new Map());
      }
      roomParticipants.get(roomId).set(socket.id, { userId, userName });

      // Tell everyone else in the room about the new user
      socket.to(roomId).emit("user-joined", {
        socketId: socket.id,
        userId,
        userName,
      });

      // Send the new user the current participant list
      const existing = [...(roomParticipants.get(roomId) || [])].filter(
        ([sid]) => sid !== socket.id
      );
      socket.emit("room-participants", existing.map(([sid, info]) => ({ socketId: sid, ...info })));

      console.log(`👥 ${userName} joined room ${roomId}`);
    });

    // ─── WebRTC Signaling ─────────────────────────────────────────────────
    // Relay WebRTC offer from one peer to another
    socket.on("offer", ({ offer, to }) => {
      socket.to(to).emit("offer", {
        offer,
        from: socket.id,
        userName: socket.data.userName,
      });
    });

    // Relay WebRTC answer
    socket.on("answer", ({ answer, to }) => {
      socket.to(to).emit("answer", { answer, from: socket.id });
    });

    // Relay ICE candidates
    socket.on("ice-candidate", ({ candidate, to }) => {
      socket.to(to).emit("ice-candidate", { candidate, from: socket.id });
    });

    // ─── Screen Sharing ───────────────────────────────────────────────────
    socket.on("screen-share-started", ({ roomId }) => {
      socket.to(roomId).emit("screen-share-started", {
        socketId: socket.id,
        userName: socket.data.userName,
      });
    });

    socket.on("screen-share-stopped", ({ roomId }) => {
      socket.to(roomId).emit("screen-share-stopped", { socketId: socket.id });
    });

    // ─── Room Chat ────────────────────────────────────────────────────────
    socket.on("chat-message", ({ roomId, message }) => {
      // Broadcast to everyone in the room including the sender
      io.to(roomId).emit("chat-message", {
        id: `${socket.id}-${Date.now()}`,
        text: message.text,
        senderName: socket.data.userName,
        senderId: socket.data.userId,
        socketId: socket.id,
        timestamp: new Date().toISOString(),
      });
    });

    // ─── Whiteboard ───────────────────────────────────────────────────────
    // Forward draw events to everyone else in the room in real time
    socket.on("draw", ({ roomId, drawData }) => {
      socket.to(roomId).emit("draw", drawData);
    });

    socket.on("clear-board", ({ roomId }) => {
      socket.to(roomId).emit("clear-board");
    });

    // ─── Disconnect ───────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      const { roomId, userId, userName } = socket.data;

      if (roomId && roomParticipants.has(roomId)) {
        roomParticipants.get(roomId).delete(socket.id);

        // Clean up empty rooms
        if (roomParticipants.get(roomId).size === 0) {
          roomParticipants.delete(roomId);
        }

        // Notify remaining peers
        socket.to(roomId).emit("user-left", {
          socketId: socket.id,
          userId,
          userName,
        });
      }

      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocket;
