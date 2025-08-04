const mongoose = require("mongoose");

const BrandProfileSchema = new mongoose.Schema({
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  brandName: { type: String, required: true },
  domain: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BrandProfile", BrandProfileSchema);