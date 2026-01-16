require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const checkIP = require("./security/ipCheck");
const { initSocket } = require("./utils/socket");
const ALLOWED_IPS = ["192.168.1.19", "192.168.1.20", "192.168.1.28"];
const { startTicketReminders } = require("./cron/ticketReminders");

const isProduction =
  process.env.NODE_ENV === "production" ||
  process.env.DISABLE_IP_CHECK === "true";

if (!isProduction && !checkIP(ALLOWED_IPS)) {
  console.error("❌ Unauthorized machine IP or local development environment");
  // process.exit(1); // Consider warning instead of exiting during transition
}

const server = http.createServer(app);
initSocket(server);

connectDB();
startTicketReminders();

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
