// const Booking = require("../Models/Booking");
// const Unit = require("../Models/Unit.js");

// // Create new booking
// const createBooking = async (req, res) => {
//   try {
//     const { unit, startDate, endDate } = req.body;
//     const userId = req.user._id; // from JWT middleware

//     // Check if unit exists
//     const existingUnit = await Unit.findById(unit);
//     if (!existingUnit)
//       return res.status(404).json({ message: "Unit not found" });

//     // Check if unit is already booked
//     if (existingUnit.status === "booked")
//       return res.status(400).json({ message: "Unit already booked" });

//     // Create booking
//     const booking = await Booking.create({
//       user: userId,
//       unit,
//       startDate,
//       endDate,
//       status: "confirmed",
//     });

//     // Mark unit as booked and assign to user
//     existingUnit.status = "booked";
//     existingUnit.assignedTo = userId;
//     await existingUnit.save();

//     res.status(201).json({
//       message: "Booking successful",
//       booking,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get all bookings (Admin / Manager)
// const getAllBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find()
//       .populate("user", "name email")
//       .populate({
//         path: "unit",
//         populate: { path: "building", populate: { path: "property" } },
//       });
//     res.json(bookings);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Cancel booking
// const cancelBooking = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id);
//     if (!booking) return res.status(404).json({ message: "Booking not found" });

//     // Update booking
//     booking.status = "cancelled";
//     await booking.save();

//     // Free unit: mark available and remove assigned user
//     const unit = await Unit.findById(booking.unit);
//     if (unit) {
//       unit.status = "available";
//       unit.assignedTo = null;
//       await unit.save();
//     }

//     res.json({ message: "Booking cancelled successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = { createBooking, getAllBookings, cancelBooking };



const Booking = require("../Models/Booking");
const Unit = require("../Models/Unit.js");
const {createNotification} = require("./notificationController.js");

const createBooking = async (req, res) => {
  try {
    const { unit, startDate, endDate } = req.body;
    const userId = req.user.id; // from JWT middleware
    console.log("✅ Inside createBooking controller");

    // Check if unit exists
    const existingUnit = await Unit.findById(unit);
    if (!existingUnit)
      return res.status(404).json({ message: "Unit not found" });

    //  Check if unit is already booked
    if (existingUnit.status === "booked")
      return res.status(400).json({ message: "Unit already booked" });

    //  Create booking
    const booking = await Booking.create({
      user: userId,
      unit,
      startDate,
      endDate,
      status: "confirmed",
    });

    //  Mark unit as booked and assign to user
    existingUnit.status = "booked";
    existingUnit.assignedTo = userId;
    await existingUnit.save();

    //  Emit real-time socket event
    const io = req.app.get("io");
    io.emit("unitBooked", { unitId: existingUnit._id });
    
    // Emit dashboard update for admin
    const { emitDashboardUpdate } = require("./adminController");
    await emitDashboardUpdate(io);

    //  Create in-app + email notification
    await createNotification(
      req.user.id, // user who booked
      "booking",
      `🎉 Your booking for unit "${existingUnit.unitNumber}" has been confirmed.`,
      io
    );

    //  Send success response
    res.status(201).json({
      message: "Booking successful & notification sent",
      booking,
    });
  } catch (error) {
    console.error("❌ Booking error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get all bookings (Admin / Manager)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate({
        path: "unit",
        select: "unitNumber building", // Select unitNumber and building reference
        populate: { 
          path: "building",
          select: "name property", // Select building name and property reference
          populate: { 
            path: "property",
            select: "name location" // Select property name and location
          } 
        },
      })
      .sort({ createdAt: -1 }); // Sort by newest first
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: error.message });
  }
};


const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("unit")
      .populate("user"); // populate user and unit for full info

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update booking status
    booking.status = "cancelled";
    await booking.save();

    // Free the unit (mark as available)
    const unit = await Unit.findById(booking.unit._id);
    if (unit) {
      unit.status = "available";
      unit.assignedTo = null;
      await unit.save();

      // Emit Socket.IO event for real-time UI update
      const io = req.app.get("io");
      io.emit("unitReleased", { unitId: unit._id });
      
      // Emit dashboard update for admin
      const { emitDashboardUpdate } = require("./adminController");
      await emitDashboardUpdate(io);
    }

    //  Send real-time + email notification
    await createNotification(
      booking.user._id,
      "cancellation",
      `Your booking for unit "${unit?.name || "Unit"}" has been cancelled.`,
      req.app.get("io")
    );

    res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("❌ Cancel Booking Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBooking, getAllBookings, cancelBooking };
