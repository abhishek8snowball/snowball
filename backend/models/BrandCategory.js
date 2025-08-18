const mongoose = require("mongoose");

const BrandCategorySchema = new mongoose.Schema({
  brandId: { type: String, required: true }, // Changed from ObjectId to String for Google OAuth compatibility
  categoryName: { type: String, required: true },
  aiSummary: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BrandCategory", BrandCategorySchema);