const Building = require("../Models/Building");
const Property = require("../Models/Property");

// 🏗️ Add new building (Admin only)
const addBuilding = async (req, res) => {
    console.log("✅ Inside addBuilding Controller");
  try {
    const { property, name, floors, floorPlans } = req.body;
    console.log("REQ BODY:", req.body);
    // Verify property exists
    const existingProperty = await Property.findById(property);
    if (!existingProperty)
      return res.status(404).json({ message: "Property not found" });

    const newBuilding = await Building.create({
      property,
      name,
      floors,
      floorPlans,
    });

    res.status(201).json({
      message: "Building created successfully",
      building: newBuilding,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🧾 Get all buildings (Admin/Manager)
const getAllBuildings = async (req, res) => {
  try {
    const buildings = await Building.find().populate("property");
    res.status(200).json(buildings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🏢 Get buildings for specific property
const getBuildingsByProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const buildings = await Building.find({ property: propertyId });
    res.status(200).json(buildings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update building (Admin only)
const updateBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Building.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Building not found" });
    res.status(200).json({ message: "Building updated", building: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ Delete building (Admin only)
const deleteBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Building.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Building not found" });
    res.status(200).json({ message: "Building deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addBuilding,
  getAllBuildings,
  getBuildingsByProperty,
  updateBuilding,
  deleteBuilding,
};
