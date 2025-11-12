const express = require("express");
const router = express.Router();
const { authToken, authorizeRoles } = require("../Middleware/authMiddleware.js");
const {
  getManagerDashboard,
  getManagerProperties,
  getManagerUnits,
  getManagerBookings,
  updateUnitStatus,
} = require("../Controllers/ManagerController.js");

router.use(authToken, authorizeRoles("manager", "admin"));

router.get("/dashboard", getManagerDashboard);
router.get("/properties", getManagerProperties);
router.get("/units", getManagerUnits);
router.get("/bookings", getManagerBookings);
router.put("/unit/:id/status", updateUnitStatus);

module.exports = router;

