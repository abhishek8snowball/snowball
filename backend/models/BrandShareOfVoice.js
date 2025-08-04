const mongoose = require("mongoose");

const BrandShareOfVoiceSchema = new mongoose.Schema({
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: "BrandProfile", required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "BrandCategory", required: true },
  totalMentions: { type: Number },
  targetMentions: { type: Number },
  shareOfVoicePct: { type: Number }, // Legacy field for backward compatibility
  aiVisibilityScore: { type: Number }, // New field: AI-based visibility score
  trueSOV: { type: Number }, // Future field for multi-source SOV
  sourceBreakdown: {
    openai: { type: Number, default: 0 },
    googleSearch: { type: Number, default: 0 },
    seoData: { type: Number, default: 0 },
    socialMedia: { type: Number, default: 0 },
    newsBlogs: { type: Number, default: 0 }
  },
  channelBreakdown: {
    openai: { type: Map, of: Number, default: new Map() },
    google: { type: Map, of: Number, default: new Map() },
    reddit: { type: Map, of: Number, default: new Map() },
    twitter: { type: Map, of: Number, default: new Map() },
    news: { type: Map, of: Number, default: new Map() }
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

module.exports = mongoose.model("BrandShareOfVoice", BrandShareOfVoiceSchema);