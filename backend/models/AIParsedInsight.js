const mongoose = require("mongoose");

const AIParsedInsightSchema = new mongoose.Schema({
  aiResponseId: { type: mongoose.Schema.Types.ObjectId, ref: "PromptAIResponse", required: true },
  mentionedBrands: [{ type: String }],
  citedDomains: [{ type: String }],
  sentiment: { type: String }
});

module.exports = mongoose.model("AIParsedInsight", AIParsedInsightSchema);