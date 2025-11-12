const express = require("express");
const router = express.Router();
const {
  addUnit,
  getAllUnits,
  getUnitsByBuilding,
  updateUnit,
  deleteUnit,
} = require("../Controllers/unitController");
const { authToken, authorizeRoles } = require("../Middleware/authMiddleware");

router.post("/add", authToken, authorizeRoles("admin", "manager"), addUnit);
router.get("/all", authToken, authorizeRoles("admin", "manager"), getAllUnits);
router.get("/:buildingId", authToken, authorizeRoles("admin", "manager"), getUnitsByBuilding);
router.put("/update/:id", authToken, authorizeRoles("admin", "manager"), updateUnit);
router.delete("/delete/:id", authToken, authorizeRoles("admin"), deleteUnit);

module.exports = router;
