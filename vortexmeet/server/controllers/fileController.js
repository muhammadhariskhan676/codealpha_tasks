// controllers/fileController.js
// Handles file upload (encrypted with AES-256-CBC) and download (decrypted on-the-fly).

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const File = require("../models/File");

// AES-256-CBC requires a 32-byte key — pad or trim the env secret to fit
const getKey = () => {
  const secret = process.env.AES_SECRET || "default_key_change_this_in_prod!";
  return Buffer.from(secret.padEnd(32).slice(0, 32));
};

// ─── Encrypt a file buffer ───────────────────────────────────────────────────
const encryptBuffer = (buffer) => {
  const iv = crypto.randomBytes(16); // Fresh IV for every file
  const cipher = crypto.createCipheriv("aes-256-cbc", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return { encrypted, iv: iv.toString("hex") };
};

// ─── Decrypt a file buffer ───────────────────────────────────────────────────
const decryptBuffer = (encryptedBuffer, ivHex) => {
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", getKey(), iv);
  return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
};

// ─── POST /api/files/upload ───────────────────────────────────────────────────
// Multer puts the raw file in req.file. We encrypt it before saving to disk.
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const { roomId } = req.body;
    if (!roomId) {
      return res.status(400).json({ message: "roomId is required" });
    }

    // Read the temp file multer wrote, encrypt it, then overwrite
    const rawBuffer = fs.readFileSync(req.file.path);
    const { encrypted, iv } = encryptBuffer(rawBuffer);

    // Unique stored name — prevents path collisions and hides original name
    const storedName = `${uuidv4()}.enc`;
    const storedPath = path.join(__dirname, "../uploads", storedName);

    fs.writeFileSync(storedPath, encrypted);
    fs.unlinkSync(req.file.path); // Remove the unencrypted temp file immediately

    // Save metadata to MongoDB
    const file = await File.create({
      originalName: req.file.originalname,
      storedName,
      mimeType: req.file.mimetype,
      size: req.file.size,
      roomId,
      uploadedBy: req.user._id,
      iv,
    });

    await file.populate("uploadedBy", "name profileImage");

    res.status(201).json({
      message: "File uploaded and encrypted",
      file: {
        id: file._id,
        originalName: file.originalName,
        size: file.size,
        mimeType: file.mimeType,
        uploadedBy: file.uploadedBy,
        createdAt: file.createdAt,
      },
    });
  } catch (err) {
    console.error("UploadFile error:", err.message);
    res.status(500).json({ message: "File upload failed" });
  }
};

// ─── GET /api/files/room/:roomId ──────────────────────────────────────────────
// List all files shared in a room (metadata only, no file contents)
const getRoomFiles = async (req, res) => {
  try {
    const files = await File.find({ roomId: req.params.roomId })
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name profileImage");

    const safeFiles = files.map((f) => ({
      id: f._id,
      originalName: f.originalName,
      size: f.size,
      mimeType: f.mimeType,
      uploadedBy: f.uploadedBy,
      createdAt: f.createdAt,
    }));

    res.status(200).json({ files: safeFiles });
  } catch (err) {
    console.error("GetRoomFiles error:", err.message);
    res.status(500).json({ message: "Could not fetch files" });
  }
};

// ─── GET /api/files/download/:id ─────────────────────────────────────────────
// Decrypt the file and stream it to the client for download.
const downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    const filePath = path.join(__dirname, "../uploads", file.storedName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File missing from storage" });
    }

    const encryptedBuffer = fs.readFileSync(filePath);
    const decrypted = decryptBuffer(encryptedBuffer, file.iv);

    // Set headers so the browser treats it as a download
    res.setHeader("Content-Disposition", `attachment; filename="${file.originalName}"`);
    res.setHeader("Content-Type", file.mimeType || "application/octet-stream");
    res.setHeader("Content-Length", decrypted.length);

    res.send(decrypted);
  } catch (err) {
    console.error("DownloadFile error:", err.message);
    res.status(500).json({ message: "File download failed" });
  }
};

module.exports = { uploadFile, getRoomFiles, downloadFile };
