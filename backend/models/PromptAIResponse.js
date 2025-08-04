const mongoose = require("mongoose");

const PromptAIResponseSchema = new mongoose.Schema({
  promptId: { type: mongoose.Schema.Types.ObjectId, ref: "CategorySearchPrompt", required: true },
  responseText: { type: String, required: true },
  runAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PromptAIResponse", PromptAIResponseSchema);