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