// models/Post.js
// Post schema supporting content, likes, and embedded comments.

const mongoose = require("mongoose");

// ─── Comment Sub-Schema ─────────────────────────────────────────────────────
// Embedded inside Post documents — avoids extra collection lookups for reads
const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
  },
  { timestamps: true }
);

// ─── Post Schema ────────────────────────────────────────────────────────────
const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: [true, "Post content is required"],
      trim: true,
      maxlength: [1000, "Post cannot exceed 1000 characters"],
    },

    // Array of user IDs who liked this post
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Embedded comments — fine for typical social volumes
    comments: [commentSchema],

    // Optional image attachment
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
