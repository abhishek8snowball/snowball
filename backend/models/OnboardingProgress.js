const mongoose = require("mongoose");

const onboardingProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  currentStep: { type: Number, default: 1, min: 1, max: 4 },
  completedSteps: [{ type: Number }],
  stepData: {
    step1: { 
      domain: String, 
      brandName: String, 
      description: String, 
      completed: { type: Boolean, default: false } 
    },
    step2: { 
      categories: [String], 
      completed: { type: Boolean, default: false } 
    },
    step3: { 
      competitors: [String], 
      completed: { type: Boolean, default: false } 
    },
    step4: { 
      promptsGenerated: { type: Boolean, default: false }, 
      completed: { type: Boolean, default: false } 
    }
  },
  lastUpdated: { type: Date, default: Date.now },
  isCompleted: { type: Boolean, default: false }
});

// Update lastUpdated on save
onboardingProgressSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model("OnboardingProgress", onboardingProgressSchema);
