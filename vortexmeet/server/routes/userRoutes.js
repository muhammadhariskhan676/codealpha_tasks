// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { getUserProfile, followUser, getUsers, updateProfile } = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", getUsers);
router.get("/:id", getUserProfile);
router.post("/:id/follow", followUser);
router.put("/profile/update", updateProfile);

module.exports = router;
