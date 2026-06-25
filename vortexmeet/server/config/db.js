// config/db.js
// Handles MongoDB connection with clean logging and error recovery.

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options keep the connection stable and avoid deprecation warnings
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    // Exit the process so the issue is immediately visible during startup
    process.exit(1);
  }
};

module.exports = connectDB;
