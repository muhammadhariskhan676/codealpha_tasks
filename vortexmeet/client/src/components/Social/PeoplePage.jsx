// components/Social/PeoplePage.jsx
// Discover and follow other users.

import { useState, useEffect } from "react";
import api from "../../utils/api";
import "./PeoplePage.css";

const PeoplePage = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState(new Set());

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (q = "") => {
    setLoading(true);
    try {
      const res = await api.get(`/users${q ? `?search=${q}` : ""}`);
      setUsers(res.data.users);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => loadUsers(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const handleFollow = async (userId) => {
    try {
      const res = await api.post(`/users/${userId}/follow`);
      setFollowingIds((prev) => {
        const next = new Set(prev);
        if (res.data.following) next.add(userId);
        else next.delete(userId);
        return next;
      });
    } catch { /* ignore */ }
  };

  const isFollowing = (userId) => followingIds.has(userId);

  return (
    <div className="people-page fade-in">
      <h2 className="people-title">Discover People</h2>

      <div className="input-group people-search">
        <input
          className="input"
          placeholder="🔍 Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="people-loading"><div className="spinner" style={{ width: 28, height: 28 }} /></div>
      ) : users.length === 0 ? (
        <p className="people-empty">No users found.</p>
      ) : (
        <div className="people-grid">
          {users.map((user) => (
            <div key={user._id} className="people-card">
              <div className="people-avatar">
                {user.profileImage
                  ? <img src={user.profileImage} alt={user.name} />
                  : user.name?.[0]?.toUpperCase()
                }
              </div>
              <div className="people-info">
                <p className="people-name">{user.name}</p>
                <p className="people-email">{user.email}</p>
                {user.bio && <p className="people-bio">{user.bio}</p>}
                <div className="people-stats">
                  <span>{user.followers?.length ?? 0} followers</span>
                  <span>·</span>
                  <span>{user.following?.length ?? 0} following</span>
                </div>
              </div>
              <button
                className={`btn ${isFollowing(user._id) ? "btn-ghost" : "btn-primary"} people-follow-btn`}
                onClick={() => handleFollow(user._id)}
              >
                {isFollowing(user._id) ? "Unfollow" : "Follow"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PeoplePage;
