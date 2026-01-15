const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/NotificationController");
const auth = require("../middlewares/auth");

router.use(auth); // All notification routes require authentication

router.get("/", notificationController.getNotifications);
router.patch("/:id/read", notificationController.markRead);
router.post("/read-all", notificationController.markAllRead);

module.exports = router;
