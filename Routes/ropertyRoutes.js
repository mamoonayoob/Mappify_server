const express = require("express");
const router = express.Router();
const {
  addProperty,
  getAllProperties,
  updateProperty,
  deleteProperty,
} = require("../Controllers/propertyController");
const { authToken, authorizeRoles } = require("../Middleware/authMiddleware");

// Add property - admin only
router.post("/add", authToken, authorizeRoles("admin"), addProperty);

// Get all properties - public
router.get("/all", getAllProperties);

// Update property - admin only
router.put("/update/:id", authToken, authorizeRoles("admin"), updateProperty);

// Delete property - admin only
router.delete("/delete/:id", authToken, authorizeRoles("admin"), deleteProperty);

module.exports = router;
