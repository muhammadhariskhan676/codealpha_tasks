// App.jsx
// Root component. Handles top-level routing:
//   - Unauthenticated → AuthPage
//   - In a meeting → MeetingRoom (fullscreen, no sidebar)
//   - Dashboard → Sidebar + page content

import { useState } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { useSocket } from "./hooks/useSocket";
import AuthPage from "./components/Auth/AuthPage";
import Sidebar from "./components/Layout/Sidebar";
import LobbyPage from "./pages/LobbyPage";
import MeetingRoom from "./pages/MeetingRoom";
import Feed from "./components/Social/Feed";
import PeoplePage from "./components/Social/PeoplePage";
import ProfilePage from "./pages/ProfilePage";
import "./styles/global.css";

// Inner app — only rendered when user is authenticated
const AppInner = () => {
  const { user } = useAuth();
  const socket = useSocket(user);

  const [page, setPage] = useState("lobby");   // Current sidebar page
  const [roomId, setRoomId] = useState(null);   // Active meeting room (null = not in meeting)

  // Enter a room — switches to fullscreen meeting view
  const joinRoom = (id) => {
    setRoomId(id);
  };

  // Leave room — return to dashboard
  const leaveRoom = () => {
    setRoomId(null);
    setPage("lobby");
  };

  // ── Full-screen meeting mode ──────────────────────────────────────────────
  if (roomId) {
    return (
      <MeetingRoom
        roomId={roomId}
        currentUser={user}
        socket={socket}
        onLeave={leaveRoom}
      />
    );
  }

  // ── Dashboard mode ────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar activePage={page} onNavigate={setPage} />

      <main style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
        {page === "lobby"   && <LobbyPage onJoinRoom={joinRoom} />}
        {page === "social"  && <Feed currentUser={user} />}
        {page === "people"  && <PeoplePage currentUser={user} />}
        {page === "profile" && <ProfilePage />}
      </main>
    </div>
  );
};

// Root wrapper — provides AuthContext to all children
export default function App() {
  return (
    <AuthProvider>
      <AppRoot />
    </AuthProvider>
  );
}

// Reads auth state and decides whether to show the auth page or the app
const AppRoot = () => {
  const { user } = useAuth();
  return user ? <AppInner /> : <AuthPage />;
};
