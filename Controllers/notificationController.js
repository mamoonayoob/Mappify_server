const Notification= require("../models/Notification.js");
const sendEmail  = require("../utils/sendEmail.js");
const User  =require("../Models/Users.js");

const createNotification = async (userId, type, message, io) => {
  try {
    // Save to database
    const notification = await Notification.create({
      user: userId,
      message,
      type,
    });

    // Emit real-time notification
    io.emit("newNotification", notification);

    // Send Email
    const user = await User.findById(userId);
    if (user && user.email) {
      await sendEmail(user.email, "Smart Property Update", message);
    }

    console.log("✅ Notification created:", message);
    return notification;
  } catch (error) {
    console.error("❌ Notification error:", error.message);
  }
};

// Fetch notifications for logged-in user
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports={createNotification,getUserNotifications};
