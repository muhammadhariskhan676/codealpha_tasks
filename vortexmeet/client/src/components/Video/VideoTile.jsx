// components/Video/VideoTile.jsx
// Renders one participant's video stream inside the grid.
// Shows an avatar fallback when no stream is available.

import { useEffect, useRef } from "react";
import "./VideoTile.css";

const VideoTile = ({ stream, userName, isLocal = false, isScreenShare = false, isMuted = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const initials = userName
    ? userName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className={`video-tile ${isScreenShare ? "screen-share-tile" : ""}`}>
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal || isMuted} // Always mute local to avoid echo
          className="video-tile-video"
        />
      ) : (
        // Avatar shown when camera is off or stream not yet available
        <div className="video-tile-avatar">
          <div className="video-avatar-circle">{initials}</div>
        </div>
      )}

      {/* Name label */}
      <div className="video-tile-label">
        {isLocal && <span className="video-tile-you">You</span>}
        {isScreenShare && <span className="video-tile-screen">Screen</span>}
        <span className="video-tile-name">{userName}</span>
      </div>

      {/* Encryption badge */}
      <div className="video-enc-badge">🔒 E2E</div>

      {/* Live pulse for remote users */}
      {!isLocal && stream && <div className="video-live-dot" />}
    </div>
  );
};

export default VideoTile;
