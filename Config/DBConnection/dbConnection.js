const mongoose = require("mongoose");
require("dotenv").config();
const dbConnect = async () => {
  try {
    const API_KEY = process.env.API_DB_KEY;
    await mongoose.connect(API_KEY);
    console.log("Database Connected  Successfully");
  } catch (error) {
    console.error("Database  Connection Failed", error.message);
    process.exit(1);
  }
};
module.exports = dbConnect;
