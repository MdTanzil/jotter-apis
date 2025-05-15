const mongoose = require("mongoose");
require("dotenv").config();
async function dbConnect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
  }
}

module.exports = { dbConnect };