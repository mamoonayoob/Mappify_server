const express = require("express");
const {
  createBooking,
  getAllBookings,
  cancelBooking,
} = require("../Controllers/bookingController");
const { authToken, authorizeRoles } = require("../Middleware/authMiddleware");

const router = express.Router();

// Customer books unit
router.post("/", authToken, authorizeRoles("customer"), createBooking);

// Admin or Manager can view all bookings
router.get("/", authToken, authorizeRoles("admin", "manager"), getAllBookings);

// Cancel booking
router.put("/:id/cancel", authToken, authorizeRoles("customer", "admin"), cancelBooking);

module.exports= router;
