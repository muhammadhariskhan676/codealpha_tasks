// routes/fileRoutes.js
// Multer is configured here to temporarily store files before encryption.

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { uploadFile, getRoomFiles, downloadFile } = require("../controllers/fileController");
const { protect } = require("../middleware/auth");

// Store uploads in a temp folder — the controller moves them after encryption
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/temp"));
  },
  filename: (req, file, cb) => {
    // Keep original name temporarily; it gets replaced after encryption
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 50) * 1024 * 1024,
  },
});

router.use(protect);

router.post("/upload", upload.single("file"), uploadFile);
router.get("/room/:roomId", getRoomFiles);
router.get("/download/:id", downloadFile);

module.exports = router;
