const mongoose = require("mongoose");

const BrandProfileSchema = new mongoose.Schema({
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  brandName: { type: String, required: true },
  domain: { type: String, required: true },
  brandTonality: { 
    type: String, 
    required: false, 
    default: "", 
    trim: true, 
    maxlength: 500 
  },
  brandInformation: { 
    type: String, 
    required: false, 
    default: "", 
    trim: true, 
    maxlength: 2000 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field whenever the document is modified
BrandProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("BrandProfile", BrandProfileSchema);