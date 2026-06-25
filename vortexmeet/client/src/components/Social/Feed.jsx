// components/Social/Feed.jsx
// Social feed — create posts, like them, and comment.

import { useState, useEffect } from "react";
import api from "../../utils/api";
import { formatTime } from "../../utils/crypto";
import "./Feed.css";

// ─── Single Post Card ─────────────────────────────────────────────────────────
const PostCard = ({ post, currentUser, onLike, onComment }) => {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isLiked = post.likes?.some((id) =>
    typeof id === "object" ? id._id === currentUser?.id : id === currentUser?.id
  );

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    await onComment(post._id, commentText.trim());
    setCommentText("");
    setSubmitting(false);
  };

  return (
    <div className="post-card fade-in">
      {/* Author */}
      <div className="post-author">
        <div className="post-avatar">
          {post.userId?.profileImage
            ? <img src={post.userId.profileImage} alt={post.userId.name} />
            : post.userId?.name?.[0]?.toUpperCase()
          }
        </div>
        <div>
          <p className="post-author-name">{post.userId?.name}</p>
          <p className="post-author-time">{formatTime(post.createdAt)}</p>
        </div>
      </div>

      {/* Content */}
      <p className="post-content">{post.content}</p>

      {/* Actions */}
      <div className="post-actions">
        <button
          className={`post-action-btn ${isLiked ? "post-action-btn--liked" : ""}`}
          onClick={() => onLike(post._id)}
        >
          {isLiked ? "❤️" : "🤍"} {post.likes?.length || 0}
        </button>
        <button
          className="post-action-btn"
          onClick={() => setShowComments((v) => !v)}
        >
          💬 {post.comments?.length || 0}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="post-comments">
          {post.comments?.map((c, i) => (
            <div key={i} className="comment-row">
              <div className="comment-avatar">{c.userId?.name?.[0]?.toUpperCase()}</div>
              <div className="comment-body">
                <span className="comment-author">{c.userId?.name}</span>
                <p className="comment-text">{c.text}</p>
              </div>
            </div>
          ))}

          <div className="comment-input-row">
            <input
              className="input comment-input"
              placeholder="Add a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
            />
            <button
              className="btn btn-primary"
              onClick={handleComment}
              disabled={!commentText.trim() || submitting}
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Feed Page ─────────────────────────────────────────────────────────────────
const Feed = ({ currentUser }) => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/posts");
      setPosts(res.data.posts);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      const res = await api.post("/posts", { content: newPost.trim() });
      setPosts((prev) => [res.data.post, ...prev]);
      setNewPost("");
    } catch {
      // ignore
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`);
      // Optimistic update — toggle the like locally
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p;
          const alreadyLiked = p.likes?.some((id) =>
            typeof id === "object" ? id._id === currentUser?.id : id === currentUser?.id
          );
          return {
            ...p,
            likes: alreadyLiked
              ? p.likes.filter((id) => (typeof id === "object" ? id._id : id) !== currentUser?.id)
              : [...(p.likes || []), currentUser?.id],
          };
        })
      );
    } catch { /* ignore */ }
  };

  const handleComment = async (postId, text) => {
    try {
      const res = await api.post(`/posts/${postId}/comment`, { text });
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: [...(p.comments || []), res.data.comment] }
            : p
        )
      );
    } catch { /* ignore */ }
  };

  return (
    <div className="feed-page fade-in">
      {/* Create post */}
      <div className="create-post-card">
        <div className="create-post-top">
          <div className="post-avatar">
            {currentUser?.name?.[0]?.toUpperCase()}
          </div>
          <textarea
            className="create-post-input"
            placeholder="What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows={3}
            maxLength={1000}
          />
        </div>
        <div className="create-post-bottom">
          <span className="create-post-char">{newPost.length}/1000</span>
          <button
            className="btn btn-primary"
            onClick={handleCreatePost}
            disabled={!newPost.trim() || posting}
          >
            {posting ? <span className="spinner" /> : "📢 Post"}
          </button>
        </div>
      </div>

      {/* Posts list */}
      {loading ? (
        <div className="feed-loading">
          <div className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      ) : posts.length === 0 ? (
        <div className="feed-empty">
          <p>🌱 No posts yet — be the first to share something!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            currentUser={currentUser}
            onLike={handleLike}
            onComment={handleComment}
          />
        ))
      )}
    </div>
  );
};

export default Feed;
