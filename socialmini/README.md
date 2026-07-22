# ✦ SocialMini — Mini Social Media Platform

A clean, full-stack social media app built with **Express.js** (backend) and **vanilla HTML/CSS/JavaScript** (frontend). No frontend framework needed — just fast, readable code.

---

## Features

| Feature | Details |
|---|---|
| **User Profiles** | Register, login, edit display name & bio, avatar via DiceBear |
| **Posts** | Create (up to 500 chars), delete own posts, view feed |
| **Comments** | Add / view comments on any post |
| **Likes** | Toggle likes, live count updates |
| **Follow System** | Follow/unfollow users, separate follower/following counts |
| **Feed** | "Following" tab (people you follow) + "Explore" tab (all posts) |
| **Search** | Real-time search by username or display name |
| **Auth** | JWT-based authentication, bcrypt password hashing |

---

## Tech Stack

- **Backend**: Node.js + Express.js
- **Auth**: JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`)
- **Storage**: JSON file-based database (zero native dependencies)
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript (no framework)
- **Design**: Dark-mode UI with Sora font, CSS variables, smooth animations

---

## Quick Start

### 1. Install dependencies
```bash
cd socialmini/backend
npm install
```

### 2. (Optional) Seed demo data
```bash
node seed.js
```
This creates 5 demo users with posts, comments, likes, and follows.

**Demo accounts** (password for all: `password123`):
- `haris` — CS student, Karachi
- `ayesha` — Designer & developer
- `omar` — Backend dev
- `sara` — ML researcher
- `bilal` — Full-stack dev

### 3. Start the server
```bash
node server.js
```

### 4. Open in browser
Visit: **http://localhost:3000**

---

## Project Structure

```
socialmini/
├── backend/
│   ├── data/               ← JSON database files (auto-created)
│   │   ├── users.json
│   │   ├── posts.json
│   │   ├── comments.json
│   │   ├── likes.json
│   │   └── follows.json
│   ├── routes/
│   │   ├── auth.js         ← /api/auth/register, /api/auth/login
│   │   ├── users.js        ← /api/users/:username, follow, search
│   │   └── posts.js        ← /api/posts, likes, comments
│   ├── db.js               ← JSON-based data layer
│   ├── middleware.js        ← JWT auth middleware
│   ├── server.js           ← Express app entry point
│   └── seed.js             ← Demo data seeder
└── frontend/
    └── public/
        └── index.html      ← Complete SPA (HTML + CSS + JS)
```

---

## API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |

### Users
| Method | Path | Description |
|---|---|---|
| GET | `/api/users/me` | Current user profile |
| PUT | `/api/users/me` | Update profile |
| GET | `/api/users/:username` | Any user's profile |
| GET | `/api/users/search?q=` | Search users |
| POST | `/api/users/:username/follow` | Toggle follow |
| GET | `/api/users/:username/followers` | Follower list |
| GET | `/api/users/:username/following` | Following list |

### Posts
| Method | Path | Description |
|---|---|---|
| GET | `/api/posts/feed` | Following feed |
| GET | `/api/posts/explore` | All posts |
| GET | `/api/posts/user/:username` | Posts by user |
| POST | `/api/posts` | Create post |
| DELETE | `/api/posts/:id` | Delete own post |
| POST | `/api/posts/:id/like` | Toggle like |
| GET | `/api/posts/:id/comments` | Get comments |
| POST | `/api/posts/:id/comments` | Add comment |
| DELETE | `/api/posts/:id/comments/:cid` | Delete comment |

---

## Upgrading to a Real Database

The `db.js` layer has a clean interface — swap it with any DB:

- **SQLite**: Replace with `better-sqlite3` queries
- **PostgreSQL**: Use `pg` or `prisma`
- **MongoDB**: Use `mongoose`

All route files use `db.*` methods, so only `db.js` needs changing.

---

*Built as Task 2 — Social Network Platform assignment.*
