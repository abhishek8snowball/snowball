const mongoose = require("mongoose");

const CategorySearchPromptSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "BrandCategory", required: true },
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: "BrandProfile", required: false }, // Added brandId field
  promptText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CategorySearchPrompt", CategorySearchPromptSchema);