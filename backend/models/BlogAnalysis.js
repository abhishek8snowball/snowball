const mongoose = require("mongoose");

const BlogAnalysisSchema = new mongoose.Schema({
  brandId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "BrandProfile", 
    required: true 
  },
  domain: { 
    type: String, 
    required: true 
  },
  blogs: [{
    url: { 
      type: String, 
      required: true 
    },
    title: { 
      type: String, 
      default: '' 
    },
    recommendations: [{
      type: String,
      default: []
    }],
    geoScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    geoReadiness: {
      type: String,
      enum: ['Excellent', 'Strong', 'Moderate', 'Poor', 'Critical', 'Unknown'],
      default: 'Unknown'
    },
    factorScores: {
      'Content Structure & Answer Format': {
        score: Number,
        weight: String
      },
      'Schema Markup & Technical Foundation': {
        score: Number,
        weight: String
      },
      'Semantic Clarity & Topic Authority': {
        score: Number,
        weight: String
      },
      'Content Freshness & Conversational Optimization': {
        score: Number,
        weight: String
      },
      'Citation Worthiness & Multimedia Integration': {
        score: Number,
        weight: String
      }
    },
    geoRecommendations: [{
      type: String
    }],
    summary: {
      type: String
    },
    limitations: [{
      type: String
    }],
    blogScoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlogScore'
    },
    extractedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("BlogAnalysis", BlogAnalysisSchema); 