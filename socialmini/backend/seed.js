/**
 * seed.js — populate SocialMini with demo users, posts, comments, and follows
 * Run once: node seed.js
 */
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

async function seed() {
  console.log('🌱 Seeding demo data...\n');

  // Clear existing data
  ['users','posts','comments','likes','follows'].forEach(col => {
    const fs = require('fs'), path = require('path');
    const file = path.join(__dirname, 'data', `${col}.json`);
    fs.writeFileSync(file, JSON.stringify([]));
  });

  const password = await bcrypt.hash('password123', 10);

  // Create demo users
  const users = [
    { username: 'haris',   displayName: 'Haris Ali',      bio: 'CS student 🎓 | Java & AI enthusiast | Karachi' },
    { username: 'ayesha',  displayName: 'Ayesha Khan',    bio: 'Designer & developer ✨ | Coffee lover ☕' },
    { username: 'omar',    displayName: 'Omar Farooq',    bio: 'Backend dev 🛠 | Django | Express | Open source' },
    { username: 'sara',    displayName: 'Sara Malik',     bio: 'ML researcher 🤖 | Data is the new oil' },
    { username: 'bilal',   displayName: 'Bilal Ahmed',    bio: 'Full-stack wizard 🧙 | React + Node.js' },
  ].map(u => db.createUser({
    id: uuidv4(),
    username: u.username,
    email: `${u.username}@demo.com`,
    passwordHash: password,
    displayName: u.displayName,
    bio: u.bio,
    avatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${u.username}&backgroundColor=1a1a2e`,
    createdAt: new Date().toISOString(),
  }));

  console.log('✅ Created', users.length, 'users');

  // Create follows
  const followPairs = [[0,1],[0,2],[0,3],[1,0],[1,2],[2,0],[2,3],[3,0],[3,4],[4,0],[4,1]];
  followPairs.forEach(([a,b]) => db.follow(users[a].id, users[b].id));
  console.log('✅ Created', followPairs.length, 'follow relationships');

  // Create posts
  const postData = [
    { author: 0, content: "Just finished my AI assignment using BFS and DFS search algorithms. Mind-blowing how elegant graph traversal can be! 🧠 #AI #CS" },
    { author: 1, content: "Working on a new design system for SocialMini. Dark mode, clean typography, consistent spacing. Design is about solving problems elegantly ✨" },
    { author: 2, content: "Tip of the day: In Express.js, always use try/catch inside async route handlers and pass errors to next(err) for centralized error handling. 🛠" },
    { author: 3, content: "Reading about transformer architectures again. Self-attention is genuinely one of the most elegant ideas in modern ML. The math is beautiful. 📊" },
    { author: 4, content: "React tip: Stop using useEffect for derived state. Just compute it during render. Your code will be cleaner and you'll avoid a whole class of bugs 🪲" },
    { author: 0, content: "Prize bond results are in! Checking my numbers now... 🤞 Anyone else collect prize bonds? Old school but I find them fun." },
    { author: 1, content: "Hot take: The best code is the code you delete. Every line you write is a liability. Solve the problem with the least possible surface area." },
    { author: 2, content: "Just deployed my first solo project to production. Three weeks of evenings and weekends. That first 200 OK in prod hits different 🚀" },
    { author: 3, content: "If you're studying ML, please learn the linear algebra first. Matrices aren't scary — they're just a way to think about transformations in space." },
    { author: 4, content: "SocialMini is live! Built with Express.js + vanilla JS. No frameworks, no build step, just clean code. Sometimes simple is best 🏗" },
  ];

  const posts = postData.map((p, i) => db.createPost({
    id: uuidv4(),
    authorId: users[p.author].id,
    content: p.content,
    image: null,
    createdAt: new Date(Date.now() - (postData.length - i) * 3600000).toISOString(),
  }));

  console.log('✅ Created', posts.length, 'posts');

  // Add some likes
  const likePairs = [
    [posts[0].id, users[1].id],[posts[0].id, users[2].id],[posts[0].id, users[3].id],
    [posts[1].id, users[0].id],[posts[1].id, users[4].id],
    [posts[2].id, users[0].id],[posts[2].id, users[1].id],[posts[2].id, users[3].id],
    [posts[3].id, users[0].id],[posts[3].id, users[2].id],
    [posts[4].id, users[1].id],[posts[4].id, users[2].id],
    [posts[7].id, users[0].id],[posts[7].id, users[1].id],[posts[7].id, users[3].id],[posts[7].id, users[4].id],
  ];
  likePairs.forEach(([postId, userId]) => db.addLike(postId, userId));
  console.log('✅ Created', likePairs.length, 'likes');

  // Add some comments
  const commentData = [
    { post: 0, author: 1, content: "BFS is my favourite — level-order traversal feels so satisfying!" },
    { post: 0, author: 2, content: "Have you tried A*? It's BFS but with a heuristic. Game changer for pathfinding." },
    { post: 1, author: 0, content: "The dark mode looks great! What font are you using for the headings?" },
    { post: 2, author: 4, content: "100% this. Unhandled promise rejections in Express are silent killers in prod." },
    { post: 3, author: 0, content: "The Attention Is All You Need paper is a great starting point if you haven't read it!" },
    { post: 4, author: 1, content: "Yes! Derived state in render is so much simpler. useState for inputs, compute everything else." },
    { post: 7, author: 0, content: "Congratulations! What stack did you use?" },
    { post: 7, author: 3, content: "That first prod deploy feeling never gets old 🎉" },
    { post: 9, author: 0, content: "Really impressed! The UI is clean and snappy. Great work." },
    { post: 9, author: 3, content: "Vanilla JS is underrated. No build step is a genuine superpower for small projects." },
  ];

  commentData.forEach(c => db.createComment({
    id: uuidv4(),
    postId: posts[c.post].id,
    authorId: users[c.author].id,
    content: c.content,
    createdAt: new Date(Date.now() - Math.random() * 7200000).toISOString(),
  }));

  console.log('✅ Created', commentData.length, 'comments');
  console.log('\n🎉 Done! You can now log in with any username (haris, ayesha, omar, sara, bilal) and password: password123\n');
}

seed().catch(console.error);
