// components/Video/VideoGrid.jsx
// Lays out all video tiles in a responsive grid that auto-adjusts columns
// based on how many participants are present.

import VideoTile from "./VideoTile";
import "./VideoGrid.css";

const VideoGrid = ({ localStream, remoteStreams, localUser, isScreenSharing, screenStream }) => {
  // remoteStreams is an object: { socketId: { stream, userName } }
  const remoteEntries = Object.entries(remoteStreams);

  // Total visible tiles: local + remotes + optional screen share
  const totalTiles = 1 + remoteEntries.length + (isScreenSharing ? 1 : 0);

  // Pick a column count that fills the space nicely
  const cols = totalTiles === 1 ? 1 : totalTiles <= 4 ? 2 : 3;

  return (
    <div
      className="video-grid"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {/* Screen share tile — shown first and takes extra width */}
      {isScreenSharing && screenStream && (
        <VideoTile
          stream={screenStream}
          userName={localUser?.name}
          isScreenShare
        />
      )}

      {/* Local camera */}
      <VideoTile
        stream={localStream}
        userName={localUser?.name || "You"}
        isLocal
      />

      {/* Remote participants */}
      {remoteEntries.map(([socketId, { stream, userName }]) => (
        <VideoTile
          key={socketId}
          stream={stream}
          userName={userName}
        />
      ))}
    </div>
  );
};

export default VideoGrid;
