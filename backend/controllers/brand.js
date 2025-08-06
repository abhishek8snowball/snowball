const OpenAI = require("openai");
const CategorySearchPrompt = require("../models/CategorySearchPrompt");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.analyzeBrand = require("./brand/analyzeBrand").analyzeBrand;
exports.generatePrompts = (req, res) => res.json({ message: "Prompts generated (mock)" });
exports.getCompetitors = (req, res) => res.json({ message: "Competitor insights (mock)" });
exports.getShareOfVoice = (req, res) => res.json({ message: "Share of Voice (mock)" });
exports.getBrandRank = (req, res) => res.json({ message: "Brand rank (mock)" });

// Blog analysis endpoints
exports.getBlogAnalysis = require("./brand/blogAnalysis").getBlogAnalysis;
exports.scoreSingleBlog = require("./brand/blogAnalysis").scoreSingleBlog;
exports.getBlogScores = require("./brand/blogAnalysis").getBlogScores;

// Blog extraction endpoint (separate from main analysis)
exports.extractBlogs = require("./brand/blogExtraction").extractBlogs;

// Blog analysis trigger for domain analysis
exports.triggerBlogAnalysis = require("./brand/blogAnalysis").triggerBlogAnalysis;

// Get user's brands with proper ownership validation
exports.getUserBrands = async (req, res) => {
  try {
    const userId = req.user.id;
    const { getUserBrands } = require("../utils/brandValidation");
    
    const brands = await getUserBrands(userId);
    
    res.json({
      success: true,
      brands: brands.map(brand => ({
        id: brand._id,
        name: brand.brandName,
        domain: brand.domain,
        createdAt: brand.createdAt
      }))
    });
  } catch (error) {
    console.error("❌ Error fetching user brands:", error);
    res.status(500).json({ msg: "Failed to fetch user brands", error: error.message });
  }
};

// Get user's categories with proper ownership validation
exports.getUserCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    const { getUserCategories } = require("../utils/brandValidation");
    
    const categories = await getUserCategories(userId);
    
    res.json({
      success: true,
      categories: categories.map(category => ({
        id: category._id,
        name: category.categoryName,
        brandId: category.brandId._id,
        brandName: category.brandId.brandName,
        domain: category.brandId.domain,
        createdAt: category.createdAt
      }))
    });
  } catch (error) {
    console.error("❌ Error fetching user categories:", error);
    res.status(500).json({ msg: "Failed to fetch user categories", error: error.message });
  }
};

// Get prompts for a specific category
exports.getCategoryPrompts = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const userId = req.user.id;
    
    console.log(`🔍 Fetching prompts for categoryId: ${categoryId} for user: ${userId}`);
    
    if (!categoryId) {
      console.log('❌ Category ID is missing');
      return res.status(400).json({ msg: "Category ID is required" });
    }

    // Check if categoryId is a valid ObjectId
    if (!require('mongoose').Types.ObjectId.isValid(categoryId)) {
      console.log('❌ Invalid ObjectId format:', categoryId);
      return res.status(400).json({ msg: "Invalid category ID format" });
    }

    // Validate category ownership using utility function
    const { validateCategoryOwnership } = require("../utils/brandValidation");
    const category = await validateCategoryOwnership(userId, categoryId);

    if (!category) {
      return res.status(403).json({ msg: "Access denied: You don't have permission to access this category" });
    }

    // Now fetch prompts for the verified category
    const CategorySearchPrompt = require("../models/CategorySearchPrompt");
    const prompts = await CategorySearchPrompt.find({ categoryId })
      .sort({ createdAt: 1 })
      .limit(5);

    console.log(`✅ Found ${prompts.length} prompts for category ${categoryId}`);
    console.log('Prompts:', prompts.map(p => ({ id: p._id, text: p.promptText.substring(0, 50) + '...' })));
    
    res.json({
      prompts,
      category: {
        id: category._id,
        name: category.categoryName,
        brandName: category.brandId.brandName,
        domain: category.brandId.domain
      }
    });
  } catch (error) {
    console.error("❌ Error fetching category prompts:", error);
    res.status(500).json({ msg: "Failed to fetch category prompts", error: error.message });
  }
};

// Get AI response for a specific prompt
exports.getPromptResponse = async (req, res) => {
  try {
    const { promptId } = req.params;
    const userId = req.user.id;
    
    console.log(`🔍 Fetching AI response for promptId: ${promptId} for user: ${userId}`);
    
    if (!promptId) {
      console.log('❌ Prompt ID is missing');
      return res.status(400).json({ msg: "Prompt ID is required" });
    }

    // Check if promptId is a valid ObjectId
    if (!require('mongoose').Types.ObjectId.isValid(promptId)) {
      console.log('❌ Invalid ObjectId format:', promptId);
      return res.status(400).json({ msg: "Invalid prompt ID format" });
    }

    // First, get the prompt to validate ownership
    const CategorySearchPrompt = require("../models/CategorySearchPrompt");
    const prompt = await CategorySearchPrompt.findById(promptId);
    
    if (!prompt) {
      return res.status(404).json({ msg: "Prompt not found" });
    }

    // Validate category ownership using utility function
    const { validateCategoryOwnership } = require("../utils/brandValidation");
    const category = await validateCategoryOwnership(userId, prompt.categoryId);

    if (!category) {
      return res.status(403).json({ msg: "Access denied: You don't have permission to access this prompt" });
    }

    // Now fetch the AI response for the prompt
    const PromptAIResponse = require("../models/PromptAIResponse");
    const response = await PromptAIResponse.findOne({ promptId })
      .sort({ runAt: -1 }); // Get the most recent response

    console.log(`🔍 AI response query result for prompt ${promptId}:`, response ? 'Found' : 'Not found');
    if (response) {
      console.log(`📝 Response text preview: "${response.responseText.substring(0, 100)}..."`);
    }
    
    res.json({
      prompt: {
        id: prompt._id,
        text: prompt.promptText,
        categoryId: prompt.categoryId
      },
      response: response ? {
        id: response._id,
        text: response.responseText,
        runAt: response.runAt
      } : null
    });
  } catch (error) {
    console.error("❌ Error fetching prompt response:", error);
    res.status(500).json({ msg: "Failed to fetch prompt response", error: error.message });
  }
};

// Debug endpoint to check AI responses in database
exports.debugAIResponses = async (req, res) => {
  try {
    const PromptAIResponse = require("../models/PromptAIResponse");
    const CategorySearchPrompt = require("../models/CategorySearchPrompt");
    
    const totalResponses = await PromptAIResponse.countDocuments();
    const totalPrompts = await CategorySearchPrompt.countDocuments();
    
    console.log(`🔍 Debug: ${totalResponses} AI responses, ${totalPrompts} prompts in database`);
    
    // Get a sample of recent responses
    const recentResponses = await PromptAIResponse.find()
      .sort({ runAt: -1 })
      .limit(5)
      .populate('promptId', 'promptText');
    
    res.json({
      totalResponses,
      totalPrompts,
      recentResponses: recentResponses.map(r => ({
        id: r._id,
        promptId: r.promptId,
        promptText: r.promptId?.promptText || 'Unknown',
        responsePreview: r.responseText.substring(0, 100) + '...',
        runAt: r.runAt
      }))
    });
  } catch (error) {
    console.error("❌ Error in debug endpoint:", error);
    res.status(500).json({ msg: "Debug failed", error: error.message });
  }
};