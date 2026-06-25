// pages/ProfilePage.jsx
// Shows the logged-in user's profile with follower/following counts
// and allows editing bio and profile image.

import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../utils/api";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/users/profile/update", { bio });
      updateUser({ bio: res.data.user.bio });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page fade-in">
      {/* Cover / hero */}
      <div className="profile-cover" />

      <div className="profile-main">
        {/* Avatar */}
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            {user?.profileImage
              ? <img src={user.profileImage} alt={user.name} />
              : <span>{user?.name?.[0]?.toUpperCase()}</span>
            }
          </div>
        </div>

        {/* Info */}
        <div className="profile-info">
          <h2 className="profile-name">{user?.name}</h2>
          <p className="profile-email">{user?.email}</p>

          {/* Bio */}
          {editing ? (
            <div className="profile-bio-edit">
              <textarea
                className="input profile-bio-input"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people about yourself…"
                maxLength={200}
                rows={3}
              />
              <div className="profile-bio-actions">
                <span className="profile-bio-char">{bio.length}/200</span>
                <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <span className="spinner" /> : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <p className="profile-bio">
              {user?.bio || <em style={{ color: "var(--text3)" }}>No bio yet.</em>}
            </p>
          )}

          {saved && <p className="profile-saved">✅ Profile saved!</p>}

          {!editing && (
            <button className="btn btn-ghost profile-edit-btn" onClick={() => setEditing(true)}>
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat-value">{user?.followers?.length ?? 0}</span>
            <span className="profile-stat-label">Followers</span>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <span className="profile-stat-value">{user?.following?.length ?? 0}</span>
            <span className="profile-stat-label">Following</span>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <span className="profile-stat-value">
              {new Date(user?.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
            <span className="profile-stat-label">Joined</span>
          </div>
        </div>

        {/* Security info card */}
        <div className="profile-security-card">
          <h4 className="profile-security-title">🔒 Account Security</h4>
          <ul className="profile-security-list">
            <li>✅ Password hashed with bcrypt (12 rounds)</li>
            <li>✅ Authentication via JWT (7-day expiry)</li>
            <li>✅ Files encrypted with AES-256-CBC</li>
            <li>✅ Chat messages encrypted client-side</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
