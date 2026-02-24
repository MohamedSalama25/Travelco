const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());

// Dynamic CORS: reads from env var ALLOWED_ORIGINS (comma-separated) or defaults to localhost
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Import routes
const airCompRoutes = require("./routes/airCompRoutes");
const usersRoutes = require("./routes/usersRoutes");
const authRoutes = require("./routes/authRoutes");
const transferRoutes = require("./routes/transferRoutes");
const customerRoutes = require("./routes/customerRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const treasuryRoutes = require("./routes/treasuryRoutes");
const advanceRoutes = require("./routes/advanceRoutes");

// Import middleware
const auth = require("./middlewares/auth");

// Public routes (no auth required)
app.use("/api/auth", authRoutes);

// Protected routes (auth required)
app.use("/api/airComp", auth, airCompRoutes);
app.use("/api/users", auth, usersRoutes);
app.use("/api/transfers", auth, transferRoutes);
app.use("/api/customers", auth, customerRoutes);
app.use("/api/payments", auth, paymentRoutes);
app.use("/api/dashboard", auth, dashboardRoutes);
app.use("/api/treasury", auth, treasuryRoutes);
app.use("/api/advances", auth, advanceRoutes);
app.use("/api/expenses", auth, require("./routes/expenseRoutes"));
app.use("/api/settings", auth, require("./routes/settingsRoutes"));
app.use("/api/notifications", require("./routes/notification.routes"));

// Cron endpoint (replaces node-cron, protected by secret)
const { checkTicketReminders } = require("./cron/ticketReminders");
app.get("/api/cron/ticket-reminders", (req, res, next) => {
  // Verify cron secret to prevent unauthorized access
  const cronSecret = req.headers["x-cron-secret"];
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  return checkTicketReminders(req, res, next);
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: !err.status ? "خطأ داخلي في الخادم" : err.message,
  });
});

module.exports = app;
