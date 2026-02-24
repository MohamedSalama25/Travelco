const Transfer = require("../models/Transfer.model");
const Notification = require("../models/Notification.model");

/**
 * Check for tickets departing in ~24 hours and create notifications.
 * This is now an API-callable function instead of a cron job,
 * since Vercel serverless does not support persistent cron jobs.
 *
 * Can be triggered via:
 * - Vercel Cron (vercel.json crons config)
 * - Manual API call
 * - Frontend polling
 */
const checkTicketReminders = async (req, res) => {
  try {
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

    let created = 0;

    for (const transfer of upcomingTransfers) {
      // Check if we already created a reminder for this transfer
      const existingNotification = await Notification.findOne({
        relatedId: transfer._id,
        type: "ticket_reminder",
      });

      if (!existingNotification && transfer.createdBy) {
        await Notification.create({
          companyId: transfer.companyId,
          user: transfer.createdBy,
          title: "تنبيه موعد إقلاع تذكرة",
          message: `التذكرة رقم ${transfer.booking_number} للعميل ${transfer.customer?.name} موعد إقلاعها خلال 24 ساعة.`,
          type: "ticket_reminder",
          link: `/customers/${transfer.customer?._id || transfer.customer}`,
          relatedId: transfer._id,
          relatedModel: "Transfer",
        });
        created++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Checked ${upcomingTransfers.length} transfers, created ${created} reminders`,
    });
  } catch (error) {
    console.error("Error in ticket reminders check:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { checkTicketReminders };
