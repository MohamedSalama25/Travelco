const cron = require("node-cron");
const Transfer = require("../models/Transfer.model");
const Notification = require("../models/Notification.model");

/**
 * Check for tickets departing in ~24 hours and create notifications for admins/managers
 */
const startTicketReminders = () => {
  // Run every 5 minutes
  cron.schedule("*/3 * * * * ", async () => {
    try {
      console.log("Running ticket departure reminders check...");

      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Find transfers departing within the next 24 hours
      const upcomingTransfers = await Transfer.find({
        take_off_date: {
          $gte: now,
          $lte: tomorrow,
        },
        status: { $ne: "cancel" },
      }).populate("customer", "name");

      for (const transfer of upcomingTransfers) {
        // Check if we already created a reminder for this transfer
        const existingNotification = await Notification.findOne({
          relatedId: transfer._id,
          type: "ticket_reminder",
        });

        if (!existingNotification) {
          if (transfer.createdBy) {
            const notification = await Notification.create({
              user: transfer.createdBy,
              title: "تنبيه موعد إقلاع تذكرة",
              message: `التذكرة رقم ${transfer.booking_number} للعميل ${transfer.customer?.name} موعد إقلاعها خلال 24 ساعة.`,
              type: "ticket_reminder",
              link: `/customers/${transfer.customer?._id || transfer.customer}`,
              relatedId: transfer._id,
              relatedModel: "Transfer",
            });

            // Trigger real-time notification
            // Populate related data before emitting
            const populatedNotification = await Notification.findById(
              notification._id,
            ).populate({
              path: "relatedId",
              populate: { path: "customer" },
            });

            const { emitToUser } = require("../utils/socket");
            emitToUser(
              transfer.createdBy,
              "newNotification",
              populatedNotification,
            );
          }
        }
      }
    } catch (error) {
      console.error("Error in ticketReminders cron job:", error);
    }
  });
};

module.exports = { startTicketReminders };
