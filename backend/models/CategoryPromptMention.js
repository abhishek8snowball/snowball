const mongoose = require('mongoose');

const categoryPromptMentionSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BrandCategory',
    required: true,
    index: true
  },
  promptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CategorySearchPrompt',
    required: true,
    index: true
  },
  companyName: {
    type: String,
    required: true,
    index: true
  },
  responseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PromptAIResponse',
    required: true
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BrandProfile',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
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
