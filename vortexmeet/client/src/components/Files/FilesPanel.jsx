// components/Files/FilesPanel.jsx
// File sharing panel — uploads are encrypted on the server (AES-256).
// Participants can download and the server decrypts transparently.

import { useState, useEffect, useRef } from "react";
import api from "../../utils/api";
import { formatFileSize, formatTime } from "../../utils/crypto";
import "./FilesPanel.css";

const FilesPanel = ({ roomId }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Load existing files for this room
  useEffect(() => {
    if (!roomId) return;
    fetchFiles();
  }, [roomId]);

  const fetchFiles = async () => {
    try {
      const res = await api.get(`/files/room/${roomId}`);
      setFiles(res.data.files);
    } catch {
      // Silently ignore — not critical
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("roomId", roomId);

    try {
      await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchFiles(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-uploaded
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = (fileId, fileName) => {
    // Navigate to the download endpoint — server decrypts and sends the file
    const token = localStorage.getItem("vx_token");
    const url = `/api/files/download/${fileId}`;

    // Create a temporary link with auth header workaround via fetch
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
      })
      .catch(() => setError("Download failed"));
  };

  // Pick an emoji icon based on file type
  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.startsWith("video/")) return "🎬";
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("zip") || mimeType.includes("rar")) return "🗜️";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
    if (mimeType.includes("sheet") || mimeType.includes("excel")) return "📊";
    return "📁";
  };

  return (
    <div className="files-panel">
      {/* Header */}
      <div className="files-header">
        <span className="files-header-icon">📁</span>
        <span className="files-header-title">Shared Files</span>
        <span className="files-enc-badge">🔒 AES-256</span>
      </div>

      {/* Upload button */}
      <div className="files-upload-area">
        <button
          className="btn btn-ghost w-full files-upload-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <><span className="spinner" /> Encrypting &amp; Uploading...</>
          ) : (
            <>📤 Share a File</>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={handleUpload}
        />
        {error && <p className="files-error">{error}</p>}
      </div>

      {/* File list */}
      <div className="files-list">
        {files.length === 0 && (
          <div className="files-empty">
            <span style={{ fontSize: 32 }}>📂</span>
            <p>No files shared yet</p>
          </div>
        )}

        {files.map((file) => (
          <div key={file.id} className="file-card">
            <div className="file-card-icon">{getFileIcon(file.mimeType)}</div>
            <div className="file-card-info">
              <p className="file-card-name" title={file.originalName}>
                {file.originalName}
              </p>
              <p className="file-card-meta">
                {formatFileSize(file.size)} · {file.uploadedBy?.name} · {formatTime(file.createdAt)}
              </p>
            </div>
            <button
              className="file-card-download"
              onClick={() => handleDownload(file.id, file.originalName)}
              title="Download"
            >
              ⬇️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilesPanel;
