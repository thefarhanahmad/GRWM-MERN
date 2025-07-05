const Notification = require("../models/Notification");

// ✅ Get all notifications for a specific user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch all notifications
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });

    // Count unread notifications
    const unreadCount = await Notification.countDocuments({
      userId,
      read: false,
    });

    res.status(200).json({
      success: true,
      message: "Notifications fetched successfully.",
      data: notifications,
      unreadNotifications: unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
      error: error.message,
    });
  }
};

// ✅ Mark all notifications as read for the current user
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read.",
      error: error.message,
    });
  }
};
