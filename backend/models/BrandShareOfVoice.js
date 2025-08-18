const mongoose = require("mongoose");

const BrandShareOfVoiceSchema = new mongoose.Schema({
  brandId: { type: String, required: true }, // Changed from ObjectId to String for Google OAuth compatibility
  userId: { type: String, required: true }, // Changed from ObjectId to String for Google OAuth compatibility
  categoryId: { type: String, required: false }, // Changed from ObjectId to String for Google OAuth compatibility
  analysisSessionId: { type: String, required: false, index: true }, // Made optional temporarily
  domain: { type: String, required: true },
  brandName: { type: String, required: true },
  description: { type: String, required: false },
  categories: [{ type: String }], // Changed from ObjectId to String for Google OAuth compatibility
  categoryPrompts: [{ type: String }], // Changed from ObjectId to String for Google OAuth compatibility
  aiResponses: [{ type: String }], // Changed from ObjectId to String for Google OAuth compatibility
  competitors: [String],
  analysisDate: { type: Date, default: Date.now },
  duration: { type: Number, default: 0 },
  
  totalMentions: { type: Number, default: 0 },
  targetMentions: { type: Number, default: 0 },
  shareOfVoicePct: { type: Number, default: 0 }, // Legacy field for backward compatibility
  aiVisibilityScore: { type: Number, default: 0 }, // New field: AI-based visibility score
  trueSOV: { type: Number, default: 0 }, // Future field for multi-source SOV
  
  // Frontend-expected fields - Changed from Map to Object to support dot-containing keys
  shareOfVoice: { type: Object, default: {} }, // Brand name -> percentage
  mentionCounts: { type: Object, default: {} }, // Brand name -> mention count
  brandShare: { type: Number, default: 0 }, // Main brand's share percentage
  
  sourceBreakdown: {
    openai: { type: Number, default: 0 },
    googleSearch: { type: Number, default: 0 },
    seoData: { type: Number, default: 0 },
    socialMedia: { type: Number, default: 0 },
    newsBlogs: { type: Number, default: 0 }
  },
  channelBreakdown: {
    openai: { type: Object, default: {} }, // Changed from Map to Object
    google: { type: Object, default: {} }, // Changed from Map to Object
    reddit: { type: Object, default: {} }, // Changed from Map to Object
    twitter: { type: Object, default: {} }, // Changed from Map to Object
    news: { type: Object, default: {} } // Changed from Map to Object
  },
  coMentions: [{ 
    brands: [String],
    context: String,
    score: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  trendData: [{
    date: { type: Date, default: Date.now },
    score: Number,
    mentions: Number
  }],
  calculatedAt: { type: Date, default: Date.now }
});

// Add compound index for efficient querying by analysis session
BrandShareOfVoiceSchema.index({ userId: 1, analysisSessionId: 1 });

module.exports = mongoose.model("BrandShareOfVoice", BrandShareOfVoiceSchema);