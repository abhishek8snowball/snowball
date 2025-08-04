const mongoose = require("mongoose");

const BrandStrengthScoreSchema = new mongoose.Schema({
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: "BrandProfile", required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "BrandCategory", required: true },
  avgDomainAuthority: { type: Number },
  citationCount: { type: Number },
  avgSentiment: { type: Number },
  finalScore: { type: Number },
  calculatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BrandStrengthScore", BrandStrengthScoreSchema);