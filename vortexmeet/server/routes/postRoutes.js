// routes/postRoutes.js
const express = require("express");
const router = express.Router();
const { getPosts, createPost, likePost, addComment, deletePost } = require("../controllers/postController");
const { protect } = require("../middleware/auth");

// All post routes require authentication
router.use(protect);

router.get("/", getPosts);
router.post("/", createPost);
router.post("/:id/like", likePost);
router.post("/:id/comment", addComment);
router.delete("/:id", deletePost);

module.exports = router;
