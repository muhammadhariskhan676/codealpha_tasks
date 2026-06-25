// controllers/authController.js
// Handles user registration, login, profile fetch, and logout.

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── Helper: sign a JWT ─────────────────────────────────────────────────────
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token valid for 7 days
  });
};

// ─── POST /api/auth/register ────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    // Create user — password is hashed automatically by the pre-save hook
    const user = await User.create({ name, email, password });

    const token = signToken(user._id);

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// ─── POST /api/auth/login ────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // We need the password field for comparison (it's excluded by default)
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      // Use a vague message to avoid leaking which field is wrong
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        bio: user.bio,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error during login" });
  }
};

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
// Returns the logged-in user's profile. Requires valid JWT.
const getMe = async (req, res) => {
  try {
    // req.user is attached by the protect middleware
    const user = await User.findById(req.user._id)
      .populate("followers", "name profileImage")
      .populate("following", "name profileImage");

    res.status(200).json({ user });
  } catch (err) {
    console.error("GetMe error:", err.message);
    res.status(500).json({ message: "Could not fetch user profile" });
  }
};

// ─── POST /api/auth/logout ───────────────────────────────────────────────────
// Stateless JWT logout — the client just deletes the token.
// In a more complex app you'd maintain a token blacklist in Redis.
const logout = (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = { register, login, getMe, logout };
