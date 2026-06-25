// components/Auth/AuthPage.jsx
// Unified login/register page with smooth tab switching.

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import "./AuthPage.css";

const AuthPage = () => {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { login, register, loading } = useAuth();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(""); // Clear error on input
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    let result;
    if (mode === "register") {
      if (!form.name.trim()) return setError("Name is required");
      result = await register(form.name, form.email, form.password);
    } else {
      result = await login(form.email, form.password);
    }

    if (!result.success) setError(result.message);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setForm({ name: "", email: "", password: "" });
  };

  return (
    <div className="auth-bg">
      {/* Decorative blobs */}
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />

      <div className="auth-card fade-in">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-mark">VX</div>
          <span className="auth-logo-text">VortexMeet</span>
        </div>
        <p className="auth-tagline">Secure · Real-Time · Collaborative</p>

        {/* Mode tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => switchMode("login")}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => switchMode("register")}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input
                className="input"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              className="input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              className="input"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            className="btn btn-primary w-full auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : null}
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        {/* Security note */}
        <div className="auth-security">
          <span className="auth-shield">🔒</span>
          <span>End-to-end encrypted · JWT authentication · bcrypt hashing</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
