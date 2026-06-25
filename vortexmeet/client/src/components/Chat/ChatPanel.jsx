// components/Chat/ChatPanel.jsx
// Encrypted room chat panel — messages are AES encrypted before sending
// and decrypted on receipt.

import { useState, useEffect, useRef } from "react";
import { encryptMessage, decryptMessage, formatTime } from "../../utils/crypto";
import "./ChatPanel.css";

const ChatPanel = ({ socket, roomId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const bottomRef = useRef(null);

  // Scroll to latest message automatically
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for incoming messages from other users
  useEffect(() => {
    if (!socket) return;

    socket.on("chat-message", (msg) => {
      // Decrypt the incoming message text
      const decrypted = { ...msg, text: decryptMessage(msg.text) };
      setMessages((prev) => [...prev, decrypted]);
    });

    return () => socket.off("chat-message");
  }, [socket]);

  const sendMessage = () => {
    if (!inputText.trim() || !socket) return;

    // Encrypt before sending over the wire
    const encrypted = encryptMessage(inputText.trim());

    socket.emit("chat-message", {
      roomId,
      message: { text: encrypted },
    });

    setInputText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="chat-header">
        <span className="chat-header-icon">💬</span>
        <span className="chat-header-title">Room Chat</span>
        <span className="chat-enc-badge">🔒 Encrypted</span>
      </div>

      {/* Message list */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <p>No messages yet</p>
            <p>Start the conversation!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser?.id;
          return (
            <div
              key={msg.id}
              className={`chat-message-row ${isMe ? "chat-message-row--me" : ""}`}
            >
              {/* Avatar for others */}
              {!isMe && (
                <div className="chat-avatar">
                  {msg.senderName?.[0]?.toUpperCase()}
                </div>
              )}

              <div className="chat-bubble-wrapper">
                {!isMe && (
                  <span className="chat-sender-name">{msg.senderName}</span>
                )}
                <div className={`chat-bubble ${isMe ? "chat-bubble--me" : "chat-bubble--them"}`}>
                  {msg.text}
                </div>
                <span className={`chat-time ${isMe ? "chat-time--me" : ""}`}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        <input
          className="input chat-input"
          placeholder="Type a message… (Enter to send)"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={500}
        />
        <button
          className="btn btn-primary chat-send-btn"
          onClick={sendMessage}
          disabled={!inputText.trim()}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
