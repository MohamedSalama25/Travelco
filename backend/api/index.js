require("dotenv").config();
const app = require("../src/app");
const connectDB = require("../src/config/db");

// Connection helper to ensure DB is connected before handling request
const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error("Database connection failed", err);
  }
};

// Vercel handles the server creation, we just need to export the app.
// However, we want to ensure DB is connected.
// In serverless, we can call connectDB inside the handler or globally.
// Globally cached connection is better.
startServer();

module.exports = app;
