const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware');

const router = express.Router();

// helper: build safe user profile
function buildProfile(user, requesterId) {
  const { passwordHash: _, ...safe } = user;
  return {
    ...safe,
    followerCount: db.getFollowerCount(user.id),
    followingCount: db.getFollowingCount(user.id),
    isFollowing: requesterId ? db.isFollowing(requesterId, user.id) : false,
    isMe: requesterId === user.id,
  };
}

// GET /api/users/me  — current user's profile
router.get('/me', authMiddleware, (req, res) => {
  const user = db.getUserById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(buildProfile(user, req.userId));
});

// GET /api/users/search?q=  — search by username or displayName
router.get('/search', authMiddleware, (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q) return res.json([]);
  const results = db.getUsers()
    .filter(u => u.username.includes(q) || u.displayName.toLowerCase().includes(q))
    .slice(0, 10)
    .map(u => buildProfile(u, req.userId));
  res.json(results);
});

// GET /api/users/:username  — any user's profile
router.get('/:username', authMiddleware, (req, res) => {
  const user = db.getUserByUsername(req.params.username.toLowerCase());
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(buildProfile(user, req.userId));
});

// PUT /api/users/me  — update own profile
router.put('/me', authMiddleware, (req, res) => {
  const { displayName, bio } = req.body;
  const updates = {};
  if (displayName !== undefined) updates.displayName = displayName.trim();
  if (bio !== undefined) updates.bio = bio.trim();

  const updated = db.updateUser(req.userId, updates);
  if (!updated) return res.status(404).json({ error: 'User not found' });

  const { passwordHash: _, ...safe } = updated;
  res.json(safe);
});

// POST /api/users/:username/follow
router.post('/:username/follow', authMiddleware, (req, res) => {
  const target = db.getUserByUsername(req.params.username.toLowerCase());
  if (!target) return res.status(404).json({ error: 'User not found' });
  if (target.id === req.userId) return res.status(400).json({ error: "Can't follow yourself" });

  if (db.isFollowing(req.userId, target.id)) {
    db.unfollow(req.userId, target.id);
    return res.json({ following: false, followerCount: db.getFollowerCount(target.id) });
  }

  db.follow(req.userId, target.id);
  res.json({ following: true, followerCount: db.getFollowerCount(target.id) });
});

// GET /api/users/:username/followers
router.get('/:username/followers', authMiddleware, (req, res) => {
  const user = db.getUserByUsername(req.params.username.toLowerCase());
  if (!user) return res.status(404).json({ error: 'User not found' });

  const followers = db.getFollows()
    .filter(f => f.followingId === user.id)
    .map(f => {
      const u = db.getUserById(f.followerId);
      return u ? buildProfile(u, req.userId) : null;
    })
    .filter(Boolean);

  res.json(followers);
});

// GET /api/users/:username/following
router.get('/:username/following', authMiddleware, (req, res) => {
  const user = db.getUserByUsername(req.params.username.toLowerCase());
  if (!user) return res.status(404).json({ error: 'User not found' });

  const following = db.getFollows()
    .filter(f => f.followerId === user.id)
    .map(f => {
      const u = db.getUserById(f.followingId);
      return u ? buildProfile(u, req.userId) : null;
    })
    .filter(Boolean);

  res.json(following);
});

module.exports = router;
