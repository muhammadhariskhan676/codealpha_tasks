// models/File.js
// Stores metadata for encrypted files uploaded in rooms.
// The actual encrypted bytes sit on disk; this document tracks the reference.

const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
    },

    // The name used to store the file on disk (uuid-based, no collision risk)
    storedName: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    // File size in bytes — useful for display without reading the file
    size: {
      type: Number,
      required: true,
    },

    // Which room this file belongs to
    roomId: {
      type: String,
      required: true,
    },

    // Who uploaded it
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // AES initialization vector stored alongside the file for decryption
    iv: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);
