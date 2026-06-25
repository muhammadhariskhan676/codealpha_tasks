// middleware/auth.js
// JWT guard that protects private API routes.
// Attach it to any route that requires a logged-in user.

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // JWT is sent in the Authorization header as "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized — no token provided" });
  }

  try {
    // Verify and decode the token using our secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user to the request object (without password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found — token invalid" });
    }

    next();
  } catch (err) {
    // Covers expired tokens, tampered tokens, etc.
    return res.status(401).json({ message: "Not authorized — token failed" });
  }
};

module.exports = { protect };
