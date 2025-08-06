const mongoose = require('mongoose');

const blogScoreSchema = new mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BrandProfile',
    required: true
  },
  blogUrl: {
    type: String,
    required: true
  },
  scrapedData: {
    title: String,
    metaDescription: String,
    contentPreview: String,
    scrapedAt: Date
  },
  geoScore: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  geoReadiness: {
    type: String,
    enum: ['Excellent', 'Strong', 'Moderate', 'Poor', 'Critical', 'Unknown'],
    required: true
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
  recommendations: [{
    type: String
  }],
  limitations: [{
    type: String
  }],
  summary: {
    type: String
  },
  rawAIResponse: {
    type: String
  },
  scoredAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
blogScoreSchema.index({ brandId: 1, scoredAt: -1 });
blogScoreSchema.index({ blogUrl: 1 });

module.exports = mongoose.model('BlogScore', blogScoreSchema); 