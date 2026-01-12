require('dotenv').config();
const app = require("./app");
const connectDB = require("./config/db");
const checkIP = require("./security/ipCheck");
const ALLOWED_IPS = [
    "192.168.1.19",
    "192.168.1.20",
    "192.168.1.51"
];

if (!checkIP(ALLOWED_IPS)) {
    console.error("❌ Unauthorized machine IP");
    process.exit(1); // البرنامج يقفل
}
connectDB();

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
