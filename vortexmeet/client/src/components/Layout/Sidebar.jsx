// components/Layout/Sidebar.jsx
// Persistent left sidebar with navigation links and user profile section.

import { useAuth } from "../../hooks/useAuth";
import "./Sidebar.css";

const NAV_ITEMS = [
  { id: "lobby",    icon: "🏠", label: "Lobby" },
  { id: "social",   icon: "📰", label: "Feed" },
  { id: "people",   icon: "👥", label: "People" },
  { id: "profile",  icon: "👤", label: "Profile" },
];

const Sidebar = ({ activePage, onNavigate }) => {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">VX</div>
        <span className="sidebar-logo-text">VortexMeet</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Spacer */}
      <div className="sidebar-spacer" />

      {/* User card at bottom */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {user?.profileImage
            ? <img src={user.profileImage} alt={user.name} />
            : <span>{user?.name?.[0]?.toUpperCase()}</span>
          }
        </div>
        <div className="sidebar-user-info">
          <p className="sidebar-user-name">{user?.name}</p>
          <p className="sidebar-user-email">{user?.email}</p>
        </div>
        <button
          className="sidebar-logout"
          onClick={logout}
          title="Sign out"
        >
          🚪
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
