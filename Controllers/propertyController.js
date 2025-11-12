const Property = require("../Models/Property");

// 🧩 Add new property (Admin only)
const addProperty = async (req, res) => {
  try {
    const { name, location, description, image } = req.body;

    const newProperty = await Property.create({
      name,
      location,
      description,
      image,
      createdBy: req.user.id,
    });

    // Emit dashboard update for admin
    const io = req.app.get("io");
    if (io) {
      const { emitDashboardUpdate } = require("./adminController");
      await emitDashboardUpdate(io);
    }

    res.status(201).json({ message: "Property added successfully", property: newProperty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🧩 Get all properties
const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate("createdBy", "name email role");
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🧩 Update property (Admin)
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Property.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Property not found" });

    // Emit dashboard update for admin
    const io = req.app.get("io");
    if (io) {
      const { emitDashboardUpdate } = require("./adminController");
      await emitDashboardUpdate(io);
    }

    res.status(200).json({ message: "Property updated", property: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🧩 Delete property (Admin)
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Property.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Property not found" });

    // Emit dashboard update for admin
    const io = req.app.get("io");
    if (io) {
      const { emitDashboardUpdate } = require("./adminController");
      await emitDashboardUpdate(io);
    }

    res.status(200).json({ message: "Property deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addProperty,
  getAllProperties,
  updateProperty,
  deleteProperty,
};
 