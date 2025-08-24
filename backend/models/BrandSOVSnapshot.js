const mongoose = require('mongoose');

const BrandSOVSnapshotSchema = new mongoose.Schema({
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
  snapshotDate: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  // Share of Voice data - brand names as keys, percentages as values
  sovData: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  // Mention counts - brand names as keys, counts as values  
  mentionCounts: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  totalMentions: { 
    type: Number, 
    required: true,
    default: 0 
  },
  brandShare: { 
    type: Number, 
    required: true,
    default: 0 
  },
  aiVisibilityScore: { 
    type: Number, 
    default: 0 
  },
  // List of competitors at time of snapshot
  competitors: [{ 
    type: String 
  }],
  // What triggered this SOV calculation
  triggerType: { 
    type: String, 
    enum: ['custom_prompt', 'custom_competitor', 'competitor_deleted', 'manual_rerun', 'initial_analysis'],
    required: true 
  },
  // Analysis session ID for reference
  analysisSessionId: { 
    type: String,
    index: true 
  },
  // Additional metadata
  metadata: {
    totalPrompts: { type: Number, default: 0 },
    totalCategories: { type: Number, default: 0 },
    customPromptsCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
BrandSOVSnapshotSchema.index({ brandId: 1, snapshotDate: -1 });
BrandSOVSnapshotSchema.index({ userId: 1, snapshotDate: -1 });
BrandSOVSnapshotSchema.index({ brandId: 1, triggerType: 1 });

module.exports = mongoose.model('BrandSOVSnapshot', BrandSOVSnapshotSchema);