const express = require("express");
const router = express.Router();
const { authToken, authorizeRoles } = require("../Middleware/authMiddleware");
const { getDashboardStats, getAllUsers, updateUser, deleteUser } = require("../Controllers/adminController");

// Only admins can access dashboard stats
router.get("/dashboard", authToken, authorizeRoles("admin"), getDashboardStats);

// Get all users (Admin only)
router.get("/users", authToken, authorizeRoles("admin"), getAllUsers);

// Update user (Admin only)
router.put("/users/:id", authToken, authorizeRoles("admin"), updateUser);

// Delete user (Admin only)
router.delete("/users/:id", authToken, authorizeRoles("admin"), deleteUser);

module.exports = router;
