const Property =require("../Models/Property.js");
const Unit = require("../Models/Unit.js");

const searchAndFilterProperties = async (req, res) => {
  try {
    const { query, location } = req.query;

    let propertyFilter = {};

    // 🔍 Basic text-based search across multiple fields
    if (query) {
      const numericQuery = Number(query);

      // If query is a number, treat it as price search
      if (!isNaN(numericQuery)) {
        propertyFilter.price = { $lte: numericQuery }; // e.g. all properties ≤ 50000
      } else {
        // Otherwise, text-based search
        propertyFilter.$or = [
          { name: { $regex: query, $options: "i" } }, // match name
          { status: { $regex: query, $options: "i" } }, // match status (e.g. available/booked)
        ];
      }
    }

    // 📍 Optional location filter
    if (location) {
      propertyFilter.location = { $regex: location, $options: "i" };
    }

    // 🧩 Populate building/unit for full context
    const properties = await Property.find(propertyFilter)
      .populate({
        path: "buildings",
        populate: { path: "units" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Filtered property results",
      count: properties.length,
      results: properties,
    });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: error.message });
  }
};
module.exports=searchAndFilterProperties;