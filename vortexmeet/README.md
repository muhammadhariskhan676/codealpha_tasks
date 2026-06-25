# VortexMeet — Real-Time Communication App

A full-stack video conferencing and collaboration platform built with React, Node.js, MongoDB, WebRTC, and Socket.io.

---

## Features

- **Video Calling** — Multi-user rooms with WebRTC (camera + mic)
- **Screen Sharing** — Share your display in real time
- **Encrypted File Sharing** — AES-encrypted uploads with download support
- **Collaborative Whiteboard** — Real-time drawing sync via Socket.io
- **Room Chat** — Encrypted in-room messaging
- **Social System** — Posts, comments, follow/unfollow
- **JWT Auth** — Secure register/login/logout with bcrypt hashing
- **Responsive Dashboard** — Sidebar nav, video grid, panels

---

## Folder Structure

```
vortexmeet/
├── client/                    # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Auth/          # Login, Register forms
│       │   ├── Video/         # VideoGrid, VideoTile, Controls
│       │   ├── Whiteboard/    # Canvas drawing + Socket sync
│       │   ├── Chat/          # Room chat panel
│       │   ├── Files/         # File upload/download
│       │   ├── Social/        # Posts, Comments, Follow
│       │   └── Layout/        # Sidebar, Navbar, Dashboard
│       ├── pages/             # Route-level pages
│       ├── hooks/             # Custom React hooks
│       ├── utils/             # Helpers: crypto, API calls
│       └── styles/            # Global CSS + component CSS
│
└── server/                    # Node.js backend
    ├── config/                # DB connection, env setup
    ├── models/                # Mongoose schemas
    ├── routes/                # Express API routes
    ├── controllers/           # Business logic
    ├── middleware/            # JWT auth guard
    ├── socket/                # Socket.io event handlers
    └── uploads/               # Encrypted file storage
```

---

## Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn
- A modern browser (Chrome/Firefox for WebRTC)

---

## Installation

### 1. Clone & Install

```bash
# Clone the repo
git clone https://github.com/yourname/vortexmeet.git
cd vortexmeet

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

```bash
# In /server, copy the example file:
cp .env.example .env
```

Edit `/server/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/vortexmeet
JWT_SECRET=your_super_secret_jwt_key_change_this
AES_SECRET=your_32_char_aes_key_change_this_!!
CLIENT_URL=http://localhost:3000
```

### 3. Run MongoDB

```bash
# If running locally:
mongod --dbpath /data/db

# Or use MongoDB Atlas and paste your URI into .env
```

### 4. Start the App

**Terminal 1 — Start the backend:**
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — Start the frontend:**
```bash
cd client
npm start
# Opens http://localhost:3000
```

---

## VS Code Quick Start

1. Open the `vortexmeet` folder in VS Code
2. Open two integrated terminals (`Ctrl+`` then split)
3. Terminal 1: `cd server && npm run dev`
4. Terminal 2: `cd client && npm start`
5. Browser opens automatically at `http://localhost:3000`

**Recommended VS Code Extensions:**
- ESLint
- Prettier
- MongoDB for VS Code
- Thunder Client (API testing)

---

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET  | `/api/auth/me` | Get current user (protected) |
| POST | `/api/auth/logout` | Logout |

### Social
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/posts` | Fetch all posts |
| POST | `/api/posts` | Create a post |
| POST | `/api/posts/:id/like` | Like/unlike post |
| POST | `/api/posts/:id/comment` | Comment on post |
| POST | `/api/users/:id/follow` | Follow/unfollow user |
| GET | `/api/users/:id` | Get user profile |

### Files
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/files/upload` | Upload encrypted file |
| GET | `/api/files/room/:roomId` | Fetch files for a room |
| GET | `/api/files/download/:id` | Download & decrypt file |

### Rooms
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/rooms/create` | Create a room |
| GET | `/api/rooms/:id` | Fetch room info |

---

## WebRTC Flow

1. User A creates/joins a room → emits `join-room` via Socket.io
2. Server notifies existing peers → `user-joined`
3. User A creates RTCPeerConnection, makes an offer → sends via Socket.io
4. User B receives offer, creates answer → sends back
5. ICE candidates exchanged through signaling server
6. Direct peer-to-peer media stream established

---

## Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-room` | Client → Server | Join a meeting room |
| `user-joined` | Server → Client | New peer notification |
| `offer` | Client → Client | WebRTC offer (via server) |
| `answer` | Client → Client | WebRTC answer |
| `ice-candidate` | Client → Client | ICE candidate |
| `user-left` | Server → Client | Peer disconnected |
| `chat-message` | Client → Room | Send chat message |
| `draw` | Client → Room | Whiteboard stroke data |
| `clear-board` | Client → Room | Clear whiteboard |
| `screen-share-started` | Client → Room | Screen share began |
| `screen-share-stopped` | Client → Room | Screen share ended |

---

## Security

- Passwords hashed with **bcrypt** (12 salt rounds)
- Auth guarded with **JWT** (HttpOnly cookies recommended for production)
- Files encrypted with **AES-256-CBC** before disk storage
- All protected routes require `Authorization: Bearer <token>` header
- Environment secrets never committed — use `.env`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, CSS3 |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Real-Time | Socket.io, WebRTC |
| Auth | JWT, bcrypt |
| Encryption | AES-256-CBC (Node crypto) |
| File Upload | Multer |

---

## License

MIT — free to use, modify, and distribute.
