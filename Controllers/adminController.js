const Property = require("../Models/Property");
const Building = require("../Models/Building");
const Unit = require("../Models/Unit");
const Booking = require("../Models/Booking"); // assuming you have a Booking model
const User = require("../Models/Users");

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update user (Admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, cnic, role } = req.body;

    // Check if email or CNIC already exists for another user
    if (email || cnic) {
      const existingUser = await User.findOne({
        _id: { $ne: id },
        $or: [{ email }, { cnic }].filter(Boolean)
      });
      if (existingUser) {
        return res.status(409).json({ message: "Email or CNIC already exists" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, cnic, role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Emit dashboard update
    const io = req.app?.get("io");
    if (io) {
      await emitDashboardUpdate(io);
    }

    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Emit dashboard update
    const io = req.app?.get("io");
    if (io) {
      await emitDashboardUpdate(io);
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get dashboard stats (reusable for socket emissions)
const getDashboardStatsData = async () => {
  // Total counts
  const totalProperties = await Property.countDocuments();
  const totalBuildings = await Building.countDocuments();
  const totalUnits = await Unit.countDocuments();
  const totalBookings = await Booking.countDocuments();
  const totalUsers = await User.countDocuments();

  // Occupancy rate (based on booked units)
  const bookedUnits = await Unit.countDocuments({ status: "booked" });
  const occupancyRate =
    totalUnits > 0 ? ((bookedUnits / totalUnits) * 100).toFixed(2) : 0;

  // Revenue (if payments exist in booking)
  const totalRevenueData = await Booking.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" }, // use booking.amount if you store payment info
      },
    },
  ]);
  const totalRevenue =
    totalRevenueData.length > 0 ? totalRevenueData[0].total : 0;

  // Recent bookings (for dashboard preview)
  const recentBookings = await Booking.find()
    .populate("user", "name email")
    .populate("unit", "name")
    .sort({ createdAt: -1 })
    .limit(5);

  // Active users (optional)
  const activeUsers = await User.find().sort({ updatedAt: -1 }).limit(5);

  return {
    stats: {
      totalProperties,
      totalBuildings,
      totalUnits,
      totalBookings,
      totalUsers,
      occupancyRate,
      totalRevenue,
    },
    recentBookings,
    activeUsers,
  };
};

// 📊 Admin Dashboard Stats Controller
const getDashboardStats = async (req, res) => {
  try {
    const dashboardData = await getDashboardStatsData();

    res.status(200).json({
      success: true,
      ...dashboardData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Function to emit dashboard update via socket.io
const emitDashboardUpdate = async (io) => {
  try {
    const dashboardData = await getDashboardStatsData();
    io.emit("dashboardUpdate", {
      success: true,
      ...dashboardData,
    });
  } catch (error) {
    console.error("❌ Error emitting dashboard update:", error.message);
  }
};

module.exports = { getDashboardStats, getDashboardStatsData, emitDashboardUpdate, getAllUsers, updateUser, deleteUser };
