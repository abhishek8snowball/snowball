const mongoose = require("mongoose");

const BrandStrengthScoreSchema = new mongoose.Schema({
  brandId: { type: String, required: true }, // Changed from ObjectId to String for Google OAuth compatibility
  categoryId: { type: String, required: true }, // Changed from ObjectId to String for Google OAuth compatibility
  avgDomainAuthority: { type: Number },
  citationCount: { type: Number },
  avgSentiment: { type: Number },
  finalScore: { type: Number },
  calculatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BrandStrengthScore", BrandStrengthScoreSchema);