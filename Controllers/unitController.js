const Unit = require("../Models/Unit");
const Building = require("../Models/Building");

// ➕ Add new unit (Manager or Admin)
const addUnit = async (req, res) => {
  try {
    const { building, unitNumber, size, price, status, assignedTo } = req.body;

    const existingBuilding = await Building.findById(building);
    if (!existingBuilding)
      return res.status(404).json({ message: "Building not found" });

    const newUnit = await Unit.create({
      building,
      unitNumber,
      size,
      price,
      status,
      assignedTo,
    });

    res.status(201).json({ message: "Unit created successfully", unit: newUnit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📄 Get all units (Admin/Manager)
const getAllUnits = async (req, res) => {
  try {
    const units = await Unit.find().populate("building").populate("assignedTo", "name email");
    res.status(200).json(units);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📦 Get units by building
const getUnitsByBuilding = async (req, res) => {
  try {
    const { buildingId } = req.params;
    const units = await Unit.find({ building: buildingId });
    res.status(200).json(units);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update unit (Manager/Admin)
const updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Unit.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Unit not found" });
    res.status(200).json({ message: "Unit updated", unit: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ Delete unit (Admin only)
const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Unit.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Unit not found" });
    res.status(200).json({ message: "Unit deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addUnit,
  getAllUnits,
  getUnitsByBuilding,
  updateUnit,
  deleteUnit,
};
