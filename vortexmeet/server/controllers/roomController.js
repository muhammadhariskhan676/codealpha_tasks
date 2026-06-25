// controllers/roomController.js
// Creates and retrieves meeting rooms.

const { v4: uuidv4 } = require("uuid");
const Room = require("../models/Room");

// ─── POST /api/rooms/create ───────────────────────────────────────────────────
const createRoom = async (req, res) => {
  try {
    const { name } = req.body;

    // Generate a short, readable room ID (first 8 chars of a UUID)
    const roomId = uuidv4().split("-")[0];

    const room = await Room.create({
      roomId,
      name: name || "Meeting Room",
      createdBy: req.user._id,
      participants: [req.user._id],
    });

    res.status(201).json({ message: "Room created", room });
  } catch (err) {
    console.error("CreateRoom error:", err.message);
    res.status(500).json({ message: "Could not create room" });
  }
};

// ─── GET /api/rooms/:id ───────────────────────────────────────────────────────
const getRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.id })
      .populate("createdBy", "name profileImage")
      .populate("participants", "name profileImage");

    if (!room) return res.status(404).json({ message: "Room not found" });

    res.status(200).json({ room });
  } catch (err) {
    console.error("GetRoom error:", err.message);
    res.status(500).json({ message: "Could not fetch room" });
  }
};

module.exports = { createRoom, getRoom };
