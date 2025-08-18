const mongoose = require('mongoose');

const categoryPromptMentionSchema = new mongoose.Schema({
  categoryId: {
    type: String,
    required: true,
    index: true
  }, // Changed from ObjectId to String for Google OAuth compatibility
  promptId: {
    type: String,
    required: true,
    index: true
  }, // Changed from ObjectId to String for Google OAuth compatibility
  companyName: {
    type: String,
    required: true,
    index: true
  },
  responseId: {
    type: String,
    required: true
  }, // Changed from ObjectId to String for Google OAuth compatibility
  brandId: {
    type: String,
    required: true,
    index: true
  }, // Changed from ObjectId to String for Google OAuth compatibility
  userId: {
    type: String,
    required: true,
    index: true
  }, // Changed from ObjectId to String for Google OAuth compatibility
  analysisSessionId: {
    type: String,
    required: false,  // Made optional temporarily
    index: true
  },
  mentionContext: {
    type: String,
    required: false,
    default: ''
  },
  confidence: {
    type: Number,
    required: false,
    default: 1.0,
    min: 0,
    max: 1
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound indexes for efficient querying
categoryPromptMentionSchema.index({ companyName: 1, brandId: 1 });
categoryPromptMentionSchema.index({ categoryId: 1, promptId: 1 });
categoryPromptMentionSchema.index({ userId: 1, companyName: 1 });
categoryPromptMentionSchema.index({ userId: 1, analysisSessionId: 1 });

module.exports = mongoose.model('CategoryPromptMention', categoryPromptMentionSchema);
