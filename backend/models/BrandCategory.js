const mongoose = require("mongoose");

const BrandCategorySchema = new mongoose.Schema({
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: "BrandProfile", required: true },
  categoryName: { type: String, required: true },
  aiSummary: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BrandCategory", BrandCategorySchema);