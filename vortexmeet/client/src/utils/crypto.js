// utils/crypto.js
// Client-side AES encryption for chat messages using CryptoJS.
// Files are encrypted server-side; messages are encrypted client-side.

import CryptoJS from "crypto-js";

// This key should ideally come from a secure key exchange in production.
// For this app, we use a shared app-level secret.
const MESSAGE_KEY = "vortexmeet_chat_key_2024";

export const encryptMessage = (plainText) => {
  return CryptoJS.AES.encrypt(plainText, MESSAGE_KEY).toString();
};

export const decryptMessage = (cipherText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, MESSAGE_KEY);
    return bytes.toString(CryptoJS.enc.Utf8) || cipherText;
  } catch {
    // If decryption fails, return as-is (might be an unencrypted legacy message)
    return cipherText;
  }
};

// Utility for formatting file sizes in a readable format
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

// Format a timestamp to a short time string
export const formatTime = (isoString) => {
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};
