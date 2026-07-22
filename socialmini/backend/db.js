const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

function loadCollection(name) {
  const file = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify([]));
    return [];
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveCollection(name, data) {
  const file = path.join(DATA_DIR, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Generic CRUD helpers
const db = {
  // Users
  getUsers: () => loadCollection('users'),
  saveUsers: (d) => saveCollection('users', d),
  getUserById: (id) => loadCollection('users').find(u => u.id === id) || null,
  getUserByUsername: (username) => loadCollection('users').find(u => u.username === username) || null,
  getUserByEmail: (email) => loadCollection('users').find(u => u.email === email) || null,
  createUser: (user) => {
    const users = loadCollection('users');
    users.push(user);
    saveCollection('users', users);
    return user;
  },
  updateUser: (id, updates) => {
    const users = loadCollection('users');
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    saveCollection('users', users);
    return users[idx];
  },

  // Posts
  getPosts: () => loadCollection('posts'),
  getPostById: (id) => loadCollection('posts').find(p => p.id === id) || null,
  createPost: (post) => {
    const posts = loadCollection('posts');
    posts.unshift(post);
    saveCollection('posts', posts);
    return post;
  },
  updatePost: (id, updates) => {
    const posts = loadCollection('posts');
    const idx = posts.findIndex(p => p.id === id);
    if (idx === -1) return null;
    posts[idx] = { ...posts[idx], ...updates };
    saveCollection('posts', posts);
    return posts[idx];
  },
  deletePost: (id) => {
    const posts = loadCollection('posts');
    const filtered = posts.filter(p => p.id !== id);
    saveCollection('posts', filtered);
  },

  // Comments
  getComments: () => loadCollection('comments'),
  getCommentsByPost: (postId) => loadCollection('comments').filter(c => c.postId === postId),
  createComment: (comment) => {
    const comments = loadCollection('comments');
    comments.push(comment);
    saveCollection('comments', comments);
    return comment;
  },
  deleteComment: (id) => {
    const comments = loadCollection('comments');
    saveCollection('comments', comments.filter(c => c.id !== id));
  },

  // Likes (postId + userId pairs)
  getLikes: () => loadCollection('likes'),
  hasLiked: (postId, userId) => loadCollection('likes').some(l => l.postId === postId && l.userId === userId),
  addLike: (postId, userId) => {
    const likes = loadCollection('likes');
    likes.push({ postId, userId });
    saveCollection('likes', likes);
  },
  removeLike: (postId, userId) => {
    const likes = loadCollection('likes').filter(l => !(l.postId === postId && l.userId === userId));
    saveCollection('likes', likes);
  },
  getLikeCount: (postId) => loadCollection('likes').filter(l => l.postId === postId).length,

  // Follows (followerId + followingId pairs)
  getFollows: () => loadCollection('follows'),
  isFollowing: (followerId, followingId) => loadCollection('follows').some(f => f.followerId === followerId && f.followingId === followingId),
  follow: (followerId, followingId) => {
    const follows = loadCollection('follows');
    follows.push({ followerId, followingId });
    saveCollection('follows', follows);
  },
  unfollow: (followerId, followingId) => {
    const follows = loadCollection('follows').filter(f => !(f.followerId === followerId && f.followingId === followingId));
    saveCollection('follows', follows);
  },
  getFollowerCount: (userId) => loadCollection('follows').filter(f => f.followingId === userId).length,
  getFollowingCount: (userId) => loadCollection('follows').filter(f => f.followerId === userId).length,
  getFollowingIds: (userId) => loadCollection('follows').filter(f => f.followerId === userId).map(f => f.followingId),
};

module.exports = db;
