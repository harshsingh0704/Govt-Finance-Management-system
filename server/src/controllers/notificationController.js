
const Notification = require("../models/Notification");

exports.getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 20)
    );

    const [notifications, unreadCount, total] = await Promise.all([
      Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("actor", "name role")
        .lean(),
      Notification.countDocuments({
        recipient: userId,
        readAt: null,
      }),
      Notification.countDocuments({ recipient: userId }),
    ]);

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user._id,
        readAt: null,
      },
      { $set: { readAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      const exists = await Notification.exists({
        _id: req.params.id,
        recipient: req.user._id,
      });

      if (!exists) {
        return res.status(404).json({
          success: false,
          message: "Notification not found.",
        });
      }

      return res.json({
        success: true,
        message: "Notification was already read.",
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read.",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, readAt: null },
      { $set: { readAt: new Date() } }
    );

    res.json({
      success: true,
      message: "All notifications marked as read.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};
