// routes/roomRoutes.js
const express = require("express");
const router = express.Router();
const { createRoom, getRoom } = require("../controllers/roomController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.post("/create", createRoom);
router.get("/:id", getRoom);

module.exports = router;
