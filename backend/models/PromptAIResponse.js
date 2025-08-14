const mongoose = require("mongoose");

const PromptAIResponseSchema = new mongoose.Schema({
  promptId: { type: mongoose.Schema.Types.ObjectId, ref: "CategorySearchPrompt", required: true },
  responseText: { type: String, required: true },
  runAt: { type: Date, default: Date.now },
  mentionsProcessed: { type: Boolean, default: false, index: true },
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: "BrandProfile", required: false, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, index: true }
});

module.exports = mongoose.model("PromptAIResponse", PromptAIResponseSchema);