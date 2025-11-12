const mongoose = require("mongoose");

const buildingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    floors: {
      type: Number,
      required: true,
    },
    floorPlans: [
      {
        floorNumber: Number,
        planImage: String, // URL or file path
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Building", buildingSchema);
