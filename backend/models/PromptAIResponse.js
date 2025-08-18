const mongoose = require("mongoose");

const PromptAIResponseSchema = new mongoose.Schema({
  promptId: { type: String, required: true }, // Changed from ObjectId to String for Google OAuth compatibility
  responseText: { type: String, required: true },
  runAt: { type: Date, default: Date.now },
  mentionsProcessed: { type: Boolean, default: false, index: true },
  brandId: { type: String, required: false, index: true }, // Changed from ObjectId to String for Google OAuth compatibility
  userId: { type: String, required: false, index: true }, // Changed from ObjectId to String for Google OAuth compatibility
  analysisSessionId: { type: String, required: false, index: true }  // Made optional temporarily
});

module.exports = mongoose.model("PromptAIResponse", PromptAIResponseSchema);