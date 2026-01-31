const Notification = require("../models/Notification.model");
const { getCompanyFilter } = require("../utils/companyFilter");

/**
 * Get notifications for the logged-in user
 */
const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const companyId = req.user.companyId;

    // Filter by user and company
    const filter = { user: req.user.id, companyId };

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: "relatedId",
        populate: { path: "customer" },
      })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      ...filter,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Mark a notification as read
 */
const markRead = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id, companyId },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "الإشعار غير موجود",
      });
    }

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Mark all notifications as read for the current user
 */
const markAllRead = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    
    await Notification.updateMany(
      { user: req.user.id, companyId, isRead: false },
      { isRead: true },
    );

    return res.status(200).json({
      success: true,
      message: "تم تحديد جميع الإشعارات كمقروءة",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getNotifications,
  markRead,
  markAllRead,
};
