const mongoose = require("mongoose");

const UserBrandSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
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
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field whenever the document is modified
UserBrandSettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("UserBrandSettings", UserBrandSettingsSchema);
