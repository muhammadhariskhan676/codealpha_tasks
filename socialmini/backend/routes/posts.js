const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware } = require('../middleware');

const router = express.Router();

// helper: enrich a post with author, like count, comment count
function enrichPost(post, requesterId) {
  const author = db.getUserById(post.authorId);
  const { passwordHash: _, ...safeAuthor } = author || {};
  return {
    ...post,
    author: safeAuthor,
    likeCount: db.getLikeCount(post.id),
    commentCount: db.getCommentsByPost(post.id).length,
    liked: requesterId ? db.hasLiked(post.id, requesterId) : false,
  };
}

// GET /api/posts/feed  — posts from people you follow + yourself
router.get('/feed', authMiddleware, (req, res) => {
  const followingIds = db.getFollowingIds(req.userId);
  const feedUserIds = [req.userId, ...followingIds];

  const posts = db.getPosts()
    .filter(p => feedUserIds.includes(p.authorId))
    .map(p => enrichPost(p, req.userId));

  res.json(posts);
});

// GET /api/posts/explore  — all posts (discover)
router.get('/explore', authMiddleware, (req, res) => {
  const posts = db.getPosts().map(p => enrichPost(p, req.userId));
  res.json(posts);
});

// GET /api/posts/user/:username  — posts by a specific user
router.get('/user/:username', authMiddleware, (req, res) => {
  const user = db.getUserByUsername(req.params.username.toLowerCase());
  if (!user) return res.status(404).json({ error: 'User not found' });

  const posts = db.getPosts()
    .filter(p => p.authorId === user.id)
    .map(p => enrichPost(p, req.userId));

  res.json(posts);
});

// GET /api/posts/:id  — single post
router.get('/:id', authMiddleware, (req, res) => {
  const post = db.getPostById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(enrichPost(post, req.userId));
});

// POST /api/posts  — create a post
router.post('/', authMiddleware, (req, res) => {
  const { content, image } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Post content cannot be empty' });
  }
  if (content.trim().length > 500) {
    return res.status(400).json({ error: 'Post too long (max 500 chars)' });
  }

  const post = db.createPost({
    id: uuidv4(),
    authorId: req.userId,
    content: content.trim(),
    image: image || null,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json(enrichPost(post, req.userId));
});

// DELETE /api/posts/:id  — delete own post
router.delete('/:id', authMiddleware, (req, res) => {
  const post = db.getPostById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.authorId !== req.userId) return res.status(403).json({ error: 'Not your post' });

  db.deletePost(req.params.id);
  res.json({ success: true });
});

// POST /api/posts/:id/like  — toggle like
router.post('/:id/like', authMiddleware, (req, res) => {
  const post = db.getPostById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  if (db.hasLiked(req.params.id, req.userId)) {
    db.removeLike(req.params.id, req.userId);
    return res.json({ liked: false, likeCount: db.getLikeCount(req.params.id) });
  }

  db.addLike(req.params.id, req.userId);
  res.json({ liked: true, likeCount: db.getLikeCount(req.params.id) });
});

// GET /api/posts/:id/comments  — get comments for a post
router.get('/:id/comments', authMiddleware, (req, res) => {
  const post = db.getPostById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const comments = db.getCommentsByPost(req.params.id).map(c => {
    const author = db.getUserById(c.authorId);
    const { passwordHash: _, ...safeAuthor } = author || {};
    return { ...c, author: safeAuthor };
  });

  res.json(comments);
});

// POST /api/posts/:id/comments  — add a comment
router.post('/:id/comments', authMiddleware, (req, res) => {
  const post = db.getPostById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment cannot be empty' });
  }

  const author = db.getUserById(req.userId);
  const { passwordHash: _, ...safeAuthor } = author || {};

  const comment = db.createComment({
    id: uuidv4(),
    postId: req.params.id,
    authorId: req.userId,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ ...comment, author: safeAuthor });
});

// DELETE /api/posts/:id/comments/:commentId
router.delete('/:id/comments/:commentId', authMiddleware, (req, res) => {
  const comments = db.getComments();
  const comment = comments.find(c => c.id === req.params.commentId);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  if (comment.authorId !== req.userId) return res.status(403).json({ error: 'Not your comment' });

  db.deleteComment(req.params.commentId);
  res.json({ success: true });
});

module.exports = router;
