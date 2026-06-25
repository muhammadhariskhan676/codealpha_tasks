// controllers/postController.js
// CRUD for posts, like/unlike, and comments.

const Post = require("../models/Post");

// ─── GET /api/posts ──────────────────────────────────────────────────────────
// Return all posts, newest first, with author info populated.
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name profileImage")
      .populate("comments.userId", "name profileImage")
      .limit(50); // Reasonable default limit

    res.status(200).json({ posts });
  } catch (err) {
    console.error("GetPosts error:", err.message);
    res.status(500).json({ message: "Could not fetch posts" });
  }
};

// ─── POST /api/posts ─────────────────────────────────────────────────────────
const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Post content cannot be empty" });
    }

    const post = await Post.create({
      userId: req.user._id,
      content: content.trim(),
    });

    // Populate author info before returning
    await post.populate("userId", "name profileImage");

    res.status(201).json({ message: "Post created", post });
  } catch (err) {
    console.error("CreatePost error:", err.message);
    res.status(500).json({ message: "Could not create post" });
  }
};

// ─── POST /api/posts/:id/like ────────────────────────────────────────────────
// Toggle like — if already liked, remove the like (unlike).
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.map(String).includes(userId);

    if (alreadyLiked) {
      // Remove like
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    res.status(200).json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      likesCount: post.likes.length,
    });
  } catch (err) {
    console.error("LikePost error:", err.message);
    res.status(500).json({ message: "Could not update like" });
  }
};

// ─── POST /api/posts/:id/comment ─────────────────────────────────────────────
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ userId: req.user._id, text: text.trim() });
    await post.save();

    // Return the newly added comment with user info
    await post.populate("comments.userId", "name profileImage");
    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({ message: "Comment added", comment: newComment });
  } catch (err) {
    console.error("AddComment error:", err.message);
    res.status(500).json({ message: "Could not add comment" });
  }
};

// ─── DELETE /api/posts/:id ────────────────────────────────────────────────────
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Only the author can delete their post
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.error("DeletePost error:", err.message);
    res.status(500).json({ message: "Could not delete post" });
  }
};

module.exports = { getPosts, createPost, likePost, addComment, deletePost };
