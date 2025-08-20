const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { calculateShareOfVoice } = require('../controllers/brand/shareOfVoice');
const { extractCompetitorsWithOpenAI } = require('../controllers/brand/extractCompetitors');
const { runPromptsAndSaveResponses } = require('../controllers/brand/aiResponse');
const BrandProfile = require('../models/BrandProfile');
const BrandCategory = require('../models/BrandCategory');
const CategorySearchPrompt = require('../models/CategorySearchPrompt');
const OpenAI = require("openai");

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Route to regenerate analysis for a specific brand
router.post('/regenerate/:brandId', authMiddleware, async (req, res) => {
  try {
    const { brandId } = req.params;
    const userId = req.user.id;

    console.log(`🔄 Starting regeneration for brandId: ${brandId}, userId: ${userId}`);

    // Get brand details
    const brand = await BrandProfile.findOne({ _id: brandId, ownerUserId: userId });
    if (!brand) {
      return res.status(404).json({ 
        success: false,
        msg: 'Brand not found or you do not have permission to access it' 
      });
    }

    console.log(`✅ Brand found: ${brand.brandName}`);

    // Get categories for this brand
    const categories = await BrandCategory.find({ brandId: brandId });
    if (categories.length === 0) {
      return res.status(400).json({ 
        success: false,
        msg: 'No categories found for this brand. Please complete onboarding first.' 
      });
    }

    console.log(`✅ Found ${categories.length} categories`);

    // Get prompts for each category
    const prompts = await CategorySearchPrompt.find({ 
      brandId: brandId,
      categoryId: { $in: categories.map(c => c._id) }
    });

    if (prompts.length === 0) {
      return res.status(400).json({ 
        success: false,
        msg: 'No prompts found for this brand. Please complete onboarding first.' 
      });
    }

    console.log(`✅ Found ${prompts.length} prompts`);

    // Generate new analysis session ID
    const newAnalysisSessionId = `regenerate_${Date.now()}`;

    // Generate new AI responses using the same function as onboarding
    const aiResponses = await runPromptsAndSaveResponses(
      openai, 
      prompts.map(p => ({ 
        promptDoc: p, 
        catDoc: categories.find(c => c._id.toString() === p.categoryId.toString()) 
      })), 
      brand._id, 
      userId, 
      newAnalysisSessionId
    );

    console.log(`✅ Generated ${aiResponses.length} AI responses`);

    // Extract competitors again
    const competitors = await extractCompetitorsWithOpenAI(brand, aiResponses);

    console.log(`✅ Extracted ${competitors.length} competitors`);

    // Recalculate Share of Voice
    const sovResults = await calculateShareOfVoice(
      brand,
      competitors,
      aiResponses,
      categories[0]._id,
      newAnalysisSessionId
    );

    console.log(`✅ Share of Voice recalculated`);

    res.json({
      success: true,
      msg: 'Analysis regenerated successfully',
      analysisSessionId: newAnalysisSessionId,
      sovResults,
      competitors,
      totalResponses: aiResponses.length
    });

  } catch (error) {
    console.error('❌ Error regenerating analysis:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to regenerate analysis',
      error: error.message
    });
  }
});

module.exports = router;