const mongoose = require("mongoose");

const CategorySearchPromptSchema = new mongoose.Schema({
  categoryId: { type: String, required: true }, // Changed from ObjectId to String for Google OAuth compatibility
  brandId: { type: String, required: false }, // Changed from ObjectId to String for Google OAuth compatibility
  promptText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CategorySearchPrompt", CategorySearchPromptSchema);