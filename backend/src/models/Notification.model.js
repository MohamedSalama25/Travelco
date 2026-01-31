const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "الشركة مطلوبة"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["ticket_reminder", "system", "payment"],
      default: "ticket_reminder",
    },
    link: {
      type: String, // URL to redirect when clicked (e.g., /travelers?search=...)
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId, // Transfer ID or other related ID
      refPath: "relatedModel",
    },
    relatedModel: {
      type: String,
      enum: ["Transfer", "Customer"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
