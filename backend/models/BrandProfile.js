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

// Add unique compound index to ensure only one brand per user
BrandProfileSchema.index({ ownerUserId: 1 }, { unique: true });

// Add validation to prevent multiple brands per user
BrandProfileSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingBrand = await this.constructor.findOne({ ownerUserId: this.ownerUserId });
    if (existingBrand) {
      return next(new Error('User already has a brand profile. Only one brand per user is allowed.'));
    }
  }
  next();
});

module.exports = mongoose.model("BrandProfile", BrandProfileSchema);