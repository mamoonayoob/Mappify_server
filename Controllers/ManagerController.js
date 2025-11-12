const Property = require("../Models/Property");
const Building = require("../Models/Building");
const Unit = require("../Models/Unit");
const Booking = require("../Models/Booking");

// 📊 GET: Manager Dashboard Stats
const getManagerDashboard = async (req, res) => {
  try {
    const managerId = req.user._id;

    // Find all properties managed by this manager
    const properties = await Property.find({ manager: managerId });
    const propertyIds = properties.map((p) => p._id);

    // Get all related data
    const buildings = await Building.find({ property: { $in: propertyIds } });
    const units = await Unit.find({ property: { $in: propertyIds } });
    const bookings = await Booking.find({ property: { $in: propertyIds } });

    const occupiedUnits = bookings.filter((b) => b.status === "Confirmed").length;
    const occupancyRate =
      units.length > 0 ? (occupiedUnits / units.length) * 100 : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalProperties: properties.length,
        totalBuildings: buildings.length,
        totalUnits: units.length,
        totalBookings: bookings.length,
        occupancyRate: occupancyRate.toFixed(2),
      },
      recentBookings: bookings.slice(-5),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🏘 GET: Manager’s Properties
const getManagerProperties = async (req, res) => {
  try {
    const managerId = req.user._id;
    const properties = await Property.find({ manager: managerId });
    res.status(200).json({ success: true, properties });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🧱 GET: Manager’s Units
const getManagerUnits = async (req, res) => {
  try {
    const managerId = req.user._id;
    const properties = await Property.find({ manager: managerId });
    const propertyIds = properties.map((p) => p._id);

    const units = await Unit.find({ property: { $in: propertyIds } });
    res.status(200).json({ success: true, units });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📦 GET: Manager’s Bookings
const getManagerBookings = async (req, res) => {
  try {
    const managerId = req.user._id;
    const properties = await Property.find({ manager: managerId });
    const propertyIds = properties.map((p) => p._id);

    const bookings = await Booking.find({ property: { $in: propertyIds } })
      .populate("user", "name email")
      .populate("unit", "name status");
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🏗 PUT: Update Unit Status (available / occupied / maintenance)
const updateUnitStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["available", "occupied", "maintenance"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status. Choose available, occupied, or maintenance" });
    }

    const unit = await Unit.findById(id);
    if (!unit) return res.status(404).json({ message: "Unit not found" });

    unit.status = status;
    await unit.save();

    res.status(200).json({
      success: true,
      message: `Unit status updated to ${status}`,
      unit,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getManagerDashboard,
  getManagerProperties,
  getManagerUnits,
  getManagerBookings,
  updateUnitStatus,
};
