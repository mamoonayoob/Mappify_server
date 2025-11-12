const express = require("express");
const router = express.Router();
const {
  addBuilding,
  getAllBuildings,
  getBuildingsByProperty,
  updateBuilding,
  deleteBuilding,
} = require("../Controllers/buildingController");
const { authToken, authorizeRoles } = require("../Middleware/authMiddleware");

// router.post("/add", authToken, authorizeRoles("admin"), addBuilding);
router.post("/add", (req, res, next) => {
  console.log("✅ Hit POST /api/buildings/add");
  next();
}, authToken, authorizeRoles("admin"), addBuilding);

router.get("/all", authToken, authorizeRoles("admin", "manager"), getAllBuildings);
router.get("/:propertyId", authToken, authorizeRoles("admin", "manager"), getBuildingsByProperty);
router.put("/update/:id", authToken, authorizeRoles("admin"), updateBuilding);
router.delete("/delete/:id", authToken, authorizeRoles("admin"), deleteBuilding);

module.exports = router;
