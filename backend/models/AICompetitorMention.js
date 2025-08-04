const mongoose = require("mongoose");

const AICompetitorMentionSchema = new mongoose.Schema({
  insightId: { type: mongoose.Schema.Types.ObjectId, ref: "AIParsedInsight", required: false },
  competitorName: { type: String },
  competitorDomain: { type: String },
  mentionCount: { type: Number },
  sentiment: { type: String }
});

module.exports = mongoose.model("AICompetitorMention", AICompetitorMentionSchema);