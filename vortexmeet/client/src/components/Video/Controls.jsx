// components/Video/Controls.jsx
// Bottom control bar for the meeting: mic, camera, screen share, whiteboard, leave.

import "./Controls.css";

const Controls = ({
  isAudioOn,
  isVideoOn,
  isScreenSharing,
  onToggleAudio,
  onToggleVideo,
  onToggleScreen,
  onOpenWhiteboard,
  onLeave,
  roomId,
}) => {
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
  };

  return (
    <div className="controls-bar">
      {/* Left: Room ID */}
      <div className="controls-left">
        <div className="room-id-chip" onClick={copyRoomId} title="Click to copy">
          <span className="room-id-label">Room:</span>
          <span className="room-id-value">{roomId}</span>
          <span className="room-id-copy">📋</span>
        </div>
      </div>

      {/* Center: Main controls */}
      <div className="controls-center">
        <button
          className={`ctrl-btn ${!isAudioOn ? "ctrl-btn--off" : ""}`}
          onClick={onToggleAudio}
          title={isAudioOn ? "Mute microphone" : "Unmute microphone"}
        >
          <span className="ctrl-icon">{isAudioOn ? "🎤" : "🔇"}</span>
          <span className="ctrl-label">{isAudioOn ? "Mute" : "Unmute"}</span>
        </button>

        <button
          className={`ctrl-btn ${!isVideoOn ? "ctrl-btn--off" : ""}`}
          onClick={onToggleVideo}
          title={isVideoOn ? "Stop camera" : "Start camera"}
        >
          <span className="ctrl-icon">{isVideoOn ? "📷" : "📷"}</span>
          <span className="ctrl-label">{isVideoOn ? "Stop Video" : "Start Video"}</span>
        </button>

        <button
          className={`ctrl-btn ${isScreenSharing ? "ctrl-btn--active" : ""}`}
          onClick={onToggleScreen}
          title={isScreenSharing ? "Stop screen share" : "Share screen"}
        >
          <span className="ctrl-icon">🖥️</span>
          <span className="ctrl-label">{isScreenSharing ? "Stop Share" : "Share Screen"}</span>
        </button>

        <button
          className="ctrl-btn"
          onClick={onOpenWhiteboard}
          title="Open collaborative whiteboard"
        >
          <span className="ctrl-icon">🎨</span>
          <span className="ctrl-label">Whiteboard</span>
        </button>
      </div>

      {/* Right: Leave button */}
      <div className="controls-right">
        <button className="ctrl-btn ctrl-btn--leave" onClick={onLeave}>
          <span className="ctrl-icon">📵</span>
          <span className="ctrl-label">Leave</span>
        </button>
      </div>
    </div>
  );
};

export default Controls;
