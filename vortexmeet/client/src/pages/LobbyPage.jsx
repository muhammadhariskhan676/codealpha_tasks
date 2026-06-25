// pages/LobbyPage.jsx
// Landing page after login. Lets users create a new room or join an existing one.

import { useState } from "react";
import api from "../utils/api";
import "./LobbyPage.css";

const LobbyPage = ({ onJoinRoom }) => {
  const [joinInput, setJoinInput] = useState("");
  const [roomName, setRoomName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // Create a new room via the API, then enter it
  const handleCreate = async () => {
    setCreating(true);
    setError("");
    try {
      const res = await api.post("/rooms/create", { name: roomName || "My Meeting" });
      onJoinRoom(res.data.room.roomId);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create room");
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = () => {
    if (!joinInput.trim()) return setError("Please enter a room ID");
    setError("");
    onJoinRoom(joinInput.trim());
  };

  return (
    <div className="lobby-page fade-in">
      <div className="lobby-hero">
        <h1 className="lobby-title">
          Connect. <span className="lobby-title-accent">Collaborate.</span> Create.
        </h1>
        <p className="lobby-subtitle">
          Encrypted video meetings with whiteboard, file sharing, and live chat — all in one place.
        </p>
      </div>

      <div className="lobby-cards">
        {/* Create room */}
        <div className="lobby-card">
          <div className="lobby-card-icon">🎥</div>
          <h3 className="lobby-card-title">New Meeting</h3>
          <p className="lobby-card-desc">Start an instant meeting and invite others with a room ID.</p>
          <div className="input-group" style={{ marginTop: 20 }}>
            <label className="input-label">Room Name (optional)</label>
            <input
              className="input"
              placeholder="e.g. Weekly Standup"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary w-full"
            style={{ marginTop: 14 }}
            onClick={handleCreate}
            disabled={creating}
          >
            {creating ? <span className="spinner" /> : "➕"}
            {creating ? "Creating..." : "Start Meeting"}
          </button>
        </div>

        {/* Join room */}
        <div className="lobby-card">
          <div className="lobby-card-icon">🔗</div>
          <h3 className="lobby-card-title">Join Meeting</h3>
          <p className="lobby-card-desc">Enter a room ID shared by the host to join their meeting.</p>
          <div className="input-group" style={{ marginTop: 20 }}>
            <label className="input-label">Room ID</label>
            <input
              className="input"
              placeholder="e.g. a1b2c3d4"
              value={joinInput}
              onChange={(e) => { setJoinInput(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
          </div>
          <button
            className="btn btn-accent w-full"
            style={{ marginTop: 14 }}
            onClick={handleJoin}
          >
            🚀 Join Now
          </button>
        </div>
      </div>

      {error && <p className="lobby-error">{error}</p>}

      {/* Feature highlights */}
      <div className="lobby-features">
        {[
          { icon: "🔒", title: "End-to-End Encrypted", desc: "AES-256 for files, JWT for auth, bcrypt for passwords" },
          { icon: "📺", title: "Screen Sharing", desc: "Share your entire screen or a specific window" },
          { icon: "🎨", title: "Live Whiteboard", desc: "Draw and collaborate in real time with Socket.io sync" },
          { icon: "📁", title: "Secure File Sharing", desc: "Upload, encrypt, and share files with your room" },
          { icon: "💬", title: "Room Chat", desc: "Encrypted real-time messaging during your meeting" },
          { icon: "👥", title: "Multi-User Video", desc: "WebRTC peer-to-peer video for up to 50 participants" },
        ].map((f) => (
          <div key={f.title} className="feature-chip">
            <span className="feature-chip-icon">{f.icon}</span>
            <div>
              <p className="feature-chip-title">{f.title}</p>
              <p className="feature-chip-desc">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LobbyPage;
