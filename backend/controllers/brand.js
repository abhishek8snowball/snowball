const OpenAI = require("openai");
const CategorySearchPrompt = require("../models/CategorySearchPrompt");
const PromptAIResponse = require("../models/PromptAIResponse");
const BrandCategory = require("../models/BrandCategory");
const BrandProfile = require("../models/BrandProfile");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.analyzeBrand = require("./brand/analyzeBrand").analyzeBrand;
exports.getBrandAnalysis = require("./brand/analyzeBrand").getBrandAnalysis;

// Blog analysis endpoints
exports.getBlogAnalysis = require("./brand/blogAnalysis").getBlogAnalysis;
exports.scoreSingleBlog = require("./brand/blogAnalysis").scoreSingleBlog;
exports.getBlogScores = require("./brand/blogAnalysis").getBlogScores;

// Blog extraction endpoint (separate from main analysis)
exports.extractBlogs = require("./brand/blogExtraction").extractBlogs;

// Blog analysis trigger for domain analysis
exports.triggerBlogAnalysis = require("./brand/blogAnalysis").triggerBlogAnalysis;

// Create minimal brand profile for blog analysis (without full analysis)
exports.createMinimalBrand = async (req, res) => {
  try {
    const { domain, brandName } = req.body;
    const userId = req.user.id;

    console.log(`🔧 Creating minimal brand profile for blog analysis: ${domain}`);

    if (!domain) {
      return res.status(400).json({ msg: "Domain is required" });
    }

    // Check if brand already exists
    const { findOrCreateBrandProfile } = require("./brand/brandProfile");
    const brand = await findOrCreateBrandProfile({ domain, brandName, userId });

    console.log(`✅ Minimal brand profile created/retrieved: ${brand.brandName} (${brand._id})`);

    res.json({
      success: true,
      brandId: brand._id,
      brandName: brand.brandName,
      domain: brand.domain,
      message: "Brand profile ready for blog analysis"
    });

  } catch (error) {
    console.error("❌ Error creating minimal brand profile:", error);
    res.status(500).json({ 
      msg: "Failed to create brand profile", 
      error: error.message 
    });
  }
};

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
    const response = await PromptAIResponse.findOne({ promptId })
      .sort({ runAt: -1 }); // Get the most recent response

    console.log(`🔍 AI response query result for prompt ${promptId}:`, response ? 'Found' : 'Not found');
    if (response) {
      console.log(`📝 Response text preview: "${response.responseText.substring(0, 100)}..."`);
    }
    
    // Return just the response text if available, otherwise return null
    if (response) {
      res.json({
        success: true,
        responseText: response.responseText,
        runAt: response.runAt
      });
    } else {
      res.json({
        success: false,
        message: "No AI response found for this prompt",
        responseText: null
      });
    }
  } catch (error) {
    console.error("❌ Error fetching prompt response:", error);
    res.status(500).json({ msg: "Failed to fetch prompt response", error: error.message });
  }
};

// Debug endpoint to check AI responses in database
exports.debugAIResponses = async (req, res) => {
  try {
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

// Add custom prompt
exports.addCustomPrompt = async (req, res) => {
  try {
    const { categoryId, categoryName, promptText } = req.body;
    const userId = req.user.id;
    
    console.log(`🔍 Adding custom prompt for user: ${userId}`);
    console.log(`📝 Category: ${categoryId === 'other' ? `New: ${categoryName}` : categoryId}`);
    console.log(`📝 Prompt: "${promptText.substring(0, 100)}..."`);
    
    if (!promptText || !promptText.trim()) {
      return res.status(400).json({ msg: "Prompt text is required" });
    }

    // Get user's brand
    const brand = await BrandProfile.findOne({ ownerUserId: userId.toString() });
    
    if (!brand) {
      return res.status(404).json({ msg: "Brand profile not found" });
    }

    let finalCategoryId = categoryId;
    
    // Handle "Other" category - create new category
    if (categoryId === 'other') {
      console.log(`🆕 Creating new category: ${categoryName}`);
      const newCategory = await BrandCategory.create({
        brandId: brand._id,
        categoryName: categoryName || 'Other'
      });
      finalCategoryId = newCategory._id;
      console.log(`✅ New category created: ${newCategory._id}`);
    } else {
      // Validate existing category ownership
      const { validateCategoryOwnership } = require("../utils/brandValidation");
      const category = await validateCategoryOwnership(userId, categoryId);
      if (!category) {
        return res.status(403).json({ msg: "Access denied: You don't have permission to access this category" });
      }
    }

    // Create the custom prompt
    const customPrompt = await CategorySearchPrompt.create({
      categoryId: finalCategoryId,
      brandId: brand._id,
      promptText: promptText.trim(),
      isCustom: true,
      createdAt: new Date()
    });

    console.log(`✅ Custom prompt created: ${customPrompt._id}`);

    res.json({
      success: true,
      promptId: customPrompt._id,
      categoryId: finalCategoryId,
      message: 'Custom prompt created successfully'
    });

  } catch (error) {
    console.error("❌ Error adding custom prompt:", error);
    res.status(500).json({ msg: "Failed to add custom prompt" });
  }
};

// Enhance prompt with AI
exports.enhancePrompt = async (req, res) => {
  try {
    const { promptText } = req.body;
    
    console.log(`🤖 Enhancing prompt: "${promptText.substring(0, 100)}..."`);
    
    if (!promptText || !promptText.trim()) {
      return res.status(400).json({ msg: "Prompt text is required" });
    }

    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const enhancementPrompt = `You are a search query optimization expert. Enhance the following search prompt to make it more effective for finding relevant information about brands, competitors, and market insights.

Original prompt: "${promptText}"

Please rewrite this prompt to be:
1. More specific and targeted
2. Better structured for AI analysis
3. Focused on actionable insights
4. Clear and concise

Return only the enhanced prompt, nothing else.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert at writing effective search prompts for brand analysis and competitive intelligence."
        },
        {
          role: "user",
          content: enhancementPrompt
        }
      ],
      max_tokens: 200,
      temperature: 0.3
    });

    const enhancedPrompt = completion.choices[0].message.content.trim();
    console.log(`✅ Prompt enhanced: "${enhancedPrompt.substring(0, 100)}..."`);

    res.json({
      success: true,
      enhancedPrompt: enhancedPrompt
    });

  } catch (error) {
    console.error("❌ Error enhancing prompt:", error);
    res.status(500).json({ msg: "Failed to enhance prompt" });
  }
};

// Extract categories from AI (without saving to database)
exports.extractCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log(`🔍 Extracting categories for user: ${userId}`);
    
    // Get user's brand profile to get domain information
    const brand = await BrandProfile.findOne({ ownerUserId: userId.toString() });
    
    if (!brand || !brand.domain) {
      return res.status(404).json({ msg: "Brand profile with domain not found. Please complete Step 1 first." });
    }

    console.log(`🏢 Extracting categories for domain: ${brand.domain}`);

    // Import the category extraction function
    const { extractCategories } = require('./brand/category');
    
    // Extract categories using AI (this doesn't save to database)
    const categories = await extractCategories(brand.domain);
    
    console.log(`✅ Extracted ${categories.length} categories:`, categories);

    res.json({
      success: true,
      categories: categories,
      domain: brand.domain,
      brandName: brand.brandName
    });

  } catch (error) {
    console.error("❌ Error extracting categories:", error);
    res.status(500).json({ 
      msg: "Failed to extract categories", 
      error: error.message 
    });
  }
};

// Add competitor to brand with safety validation
exports.addCompetitor = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { competitorName } = req.body;
    const userId = req.user.id;
    
    console.log(`🏢 Adding competitor for brand: ${brandId}, user: ${userId}`);
    console.log(`🆔 Competitor name: "${competitorName}"`);
    
    // 1. Validate brand ownership
    const { validateBrandOwnership } = require("../utils/brandValidation");
    const brand = await validateBrandOwnership(userId, brandId);
    
    if (!brand) {
      console.log(`❌ Brand ownership validation failed for user ${userId}, brand ${brandId}`);
      return res.status(403).json({ msg: "Access denied: You don't have permission to modify this brand" });
    }
    
    // 2. Input validation
    if (!competitorName || typeof competitorName !== 'string' || competitorName.trim().length < 2) {
      console.log(`❌ Invalid competitor name: "${competitorName}"`);
      return res.status(400).json({ msg: "Valid competitor name required (minimum 2 characters)" });
    }
    
    const sanitizedName = competitorName.trim();
    console.log(`🧹 Sanitized competitor name: "${sanitizedName}"`);
    
    // 3. Duplicate prevention
    if (brand.competitors && brand.competitors.includes(sanitizedName)) {
      console.log(`❌ Competitor already exists: "${sanitizedName}"`);
      return res.status(400).json({ msg: `Competitor "${sanitizedName}" already exists` });
    }
    
    // 4. Rate limiting (max 15 competitors)
    const currentCompetitorCount = brand.competitors ? brand.competitors.length : 0;
    if (currentCompetitorCount >= 15) {
      console.log(`❌ Maximum competitors reached: ${currentCompetitorCount}/15`);
      return res.status(400).json({ msg: "Maximum 15 competitors allowed per brand" });
    }
    
    // 5. Update brand with new competitor
    console.log(`📝 Adding competitor to brand. Current count: ${currentCompetitorCount}`);
    
    if (!brand.competitors) {
      brand.competitors = [];
    }
    brand.competitors.push(sanitizedName);
    await brand.save();
    
    console.log(`✅ Competitor added to brand. New count: ${brand.competitors.length}`);
    console.log(`📋 Updated competitors list:`, brand.competitors);
    
    // 6. Recalculate SOV with new competitor
    console.log(`🔄 Recalculating Share of Voice with new competitor...`);
    
    try {
      // Get existing data for SOV recalculation
      const BrandCategory = require("../models/BrandCategory");
      const CategorySearchPrompt = require("../models/CategorySearchPrompt");
      const PromptAIResponse = require("../models/PromptAIResponse");
      
      // Get user's categories
      const userCategories = await BrandCategory.find({ brandId: brand._id });
      const userCategoryIds = userCategories.map(cat => cat._id);
      
      // Get user's prompts and responses
      const userPrompts = await CategorySearchPrompt.find({ 
        categoryId: { $in: userCategoryIds } 
      });
      const userPromptIds = userPrompts.map(prompt => prompt._id);
      
      const userAIResponses = await PromptAIResponse.find({ 
        promptId: { $in: userPromptIds } 
      }).populate('promptId');

      // Build responses array for SOV calculation
      const userResponses = [];
      for (const response of userAIResponses) {
        if (response.promptId) {
          const categoryDoc = userCategories.find(cat => 
            cat._id.toString() === response.promptId.categoryId.toString()
          );
          if (categoryDoc) {
            userResponses.push({
              aiDoc: response,
              catDoc: categoryDoc
            });
          }
        }
      }

      console.log(`📊 Recalculating SOV with ${userResponses.length} responses and ${brand.competitors.length} competitors`);

      // Prepare brand object for SOV calculation
      const brandForSOV = {
        _id: brand._id,
        brandName: brand.brandName,
        domain: brand.domain,
        userId: brand.ownerUserId,
        ownerUserId: brand.ownerUserId,
        competitors: brand.competitors // Now includes new competitor
      };

      // Recalculate SOV
      const { calculateShareOfVoice } = require('./brand/shareOfVoice');
      const sovResult = await calculateShareOfVoice(
        brandForSOV,
        brandForSOV.competitors,
        userResponses,
        userCategories[0]?._id, // Use first category as reference
        `competitor_add_${Date.now()}` // New analysis session for this update
      );
      
      console.log(`✅ SOV recalculated successfully`);
      console.log(`📊 SOV results:`, sovResult);

      // Return success response with updated data
      res.json({
        success: true,
        message: `Competitor "${sanitizedName}" added successfully`,
        competitor: sanitizedName,
        totalCompetitors: brand.competitors.length,
        competitors: brand.competitors,
        shareOfVoice: sovResult
      });

    } catch (sovError) {
      console.error(`❌ Error recalculating SOV:`, sovError);
      
      // Rollback competitor addition on SOV calculation failure
      console.log(`🔄 Rolling back competitor addition due to SOV calculation error...`);
      brand.competitors = brand.competitors.filter(comp => comp !== sanitizedName);
      await brand.save();
      
      return res.status(500).json({ 
        msg: "Competitor added but SOV calculation failed. Changes rolled back.", 
        error: sovError.message 
      });
    }
    
  } catch (error) {
    console.error("❌ Error adding competitor:", error);
    res.status(500).json({ 
      msg: "Failed to add competitor", 
      error: error.message 
    });
  }
};

// Delete competitor from brand with safety validation
exports.deleteCompetitor = async (req, res) => {
  try {
    const { brandId, competitorName } = req.params;
    const userId = req.user.id;
    
    console.log(`🗑️ Deleting competitor from brand: ${brandId}, user: ${userId}`);
    console.log(`🆔 Competitor to delete: "${competitorName}"`);
    
    // 1. Validate brand ownership
    const { validateBrandOwnership } = require("../utils/brandValidation");
    const brand = await validateBrandOwnership(userId, brandId);
    
    if (!brand) {
      console.log(`❌ Brand ownership validation failed for user ${userId}, brand ${brandId}`);
      return res.status(403).json({ msg: "Access denied: You don't have permission to modify this brand" });
    }
    
    // 2. Input validation
    if (!competitorName || typeof competitorName !== 'string' || competitorName.trim().length < 1) {
      console.log(`❌ Invalid competitor name: "${competitorName}"`);
      return res.status(400).json({ msg: "Valid competitor name required for deletion" });
    }
    
    const sanitizedName = decodeURIComponent(competitorName.trim());
    console.log(`🧹 Sanitized competitor name to delete: "${sanitizedName}"`);
    
    // 3. Check if competitor exists
    if (!brand.competitors || !brand.competitors.includes(sanitizedName)) {
      console.log(`❌ Competitor not found: "${sanitizedName}"`);
      console.log(`📋 Current competitors:`, brand.competitors);
      return res.status(404).json({ msg: `Competitor "${sanitizedName}" not found` });
    }
    
    // 4. Prevent deletion if it's the last competitor (optional business rule)
    if (brand.competitors.length <= 1) {
      console.log(`❌ Cannot delete last competitor: "${sanitizedName}"`);
      return res.status(400).json({ msg: "Cannot delete the last competitor. At least one competitor is required for SOV analysis." });
    }
    
    // 5. Remove competitor from brand
    console.log(`📝 Removing competitor from brand. Current count: ${brand.competitors.length}`);
    
    brand.competitors = brand.competitors.filter(comp => comp !== sanitizedName);
    await brand.save();
    
    console.log(`✅ Competitor removed from brand. New count: ${brand.competitors.length}`);
    console.log(`📋 Updated competitors list:`, brand.competitors);
    
    // 6. Recalculate SOV without the deleted competitor
    console.log(`🔄 Recalculating Share of Voice without deleted competitor...`);
    
    try {
      // Get existing data for SOV recalculation
      const BrandCategory = require("../models/BrandCategory");
      const CategorySearchPrompt = require("../models/CategorySearchPrompt");
      const PromptAIResponse = require("../models/PromptAIResponse");
      
      // Get user's categories
      const userCategories = await BrandCategory.find({ brandId: brand._id });
      const userCategoryIds = userCategories.map(cat => cat._id);
      
      // Get user's prompts and responses
      const userPrompts = await CategorySearchPrompt.find({ 
        categoryId: { $in: userCategoryIds } 
      });
      const userPromptIds = userPrompts.map(prompt => prompt._id);
      
      const userAIResponses = await PromptAIResponse.find({ 
        promptId: { $in: userPromptIds } 
      }).populate('promptId');

      // Build responses array for SOV calculation
      const userResponses = [];
      for (const response of userAIResponses) {
        if (response.promptId) {
          const categoryDoc = userCategories.find(cat => 
            cat._id.toString() === response.promptId.categoryId.toString()
          );
          if (categoryDoc) {
            userResponses.push({
              aiDoc: response,
              catDoc: categoryDoc
            });
          }
        }
      }

      console.log(`📊 Recalculating SOV with ${userResponses.length} responses and ${brand.competitors.length} competitors`);

      // Prepare brand object for SOV calculation
      const brandForSOV = {
        _id: brand._id,
        brandName: brand.brandName,
        domain: brand.domain,
        userId: brand.ownerUserId,
        ownerUserId: brand.ownerUserId,
        competitors: brand.competitors // Now excludes deleted competitor
      };

      // Recalculate SOV
      const { calculateShareOfVoice } = require('./brand/shareOfVoice');
      const sovResult = await calculateShareOfVoice(
        brandForSOV,
        brandForSOV.competitors,
        userResponses,
        userCategories[0]?._id, // Use first category as reference
        `competitor_delete_${Date.now()}` // New analysis session for this update
      );
      
      console.log(`✅ SOV recalculated successfully after competitor deletion`);
      console.log(`📊 SOV results:`, sovResult);

      // Return success response with updated data
      res.json({
        success: true,
        message: `Competitor "${sanitizedName}" deleted successfully`,
        deletedCompetitor: sanitizedName,
        totalCompetitors: brand.competitors.length,
        competitors: brand.competitors,
        shareOfVoice: sovResult
      });

    } catch (sovError) {
      console.error(`❌ Error recalculating SOV after deletion:`, sovError);
      
      // Rollback competitor deletion on SOV calculation failure
      console.log(`🔄 Rolling back competitor deletion due to SOV calculation error...`);
      brand.competitors.push(sanitizedName);
      await brand.save();
      
      return res.status(500).json({ 
        msg: "Competitor deletion failed during SOV recalculation. Changes rolled back.", 
        error: sovError.message 
      });
    }
    
  } catch (error) {
    console.error("❌ Error deleting competitor:", error);
    res.status(500).json({ 
      msg: "Failed to delete competitor", 
      error: error.message 
    });
  }
};

// Generate custom response - isolated workflow for single prompt
exports.generateCustomResponse = async (req, res) => {
  try {
    const { promptId } = req.params;
    const userId = req.user.id;
    
    console.log(`🚀 Starting isolated response generation for promptId: ${promptId}`);
    
    if (!promptId) {
      return res.status(400).json({ msg: "Prompt ID is required" });
    }

    // Validate prompt ownership
    const prompt = await CategorySearchPrompt.findById(promptId);
    
    if (!prompt) {
      return res.status(404).json({ msg: "Prompt not found" });
    }

    // Validate category ownership
    const { validateCategoryOwnership } = require("../utils/brandValidation");
    const category = await validateCategoryOwnership(userId, prompt.categoryId);
    
    if (!category) {
      return res.status(403).json({ msg: "Access denied: You don't have permission to access this prompt" });
    }

    // Get brand information
    const brand = await BrandProfile.findOne({ ownerUserId: userId.toString() });
    
    if (!brand) {
      return res.status(404).json({ msg: "Brand profile not found" });
    }

    console.log(`📝 Processing custom prompt: "${prompt.promptText.substring(0, 100)}..."`);
    console.log(`🏷️ Category: ${category.categoryName}`);
    console.log(`🏢 Brand: ${brand.brandName}`);

    // Step 1: Generate AI response for this single prompt
    console.log(`🤖 Step 1: Generating AI response...`);
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful research assistant that provides comprehensive, factual information about brands, companies, and market insights."
        },
        {
          role: "user",
          content: prompt.promptText
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const responseText = completion.choices[0].message.content;
    console.log(`✅ AI response generated (${responseText.length} characters)`);

    // Save the AI response
    const aiResponse = await PromptAIResponse.create({
      promptId: prompt._id,
      responseText: responseText,
      runAt: new Date()
    });

    console.log(`✅ AI response saved: ${aiResponse._id}`);

    // Step 2: Extract mentions from this single response
    console.log(`🔍 Step 2: Extracting mentions from response...`);
    const MentionExtractor = require('./brand/mentionExtractor');
    const mentionExtractor = new MentionExtractor();

    // Generate unique analysis session ID for this custom prompt
    const analysisSessionId = `custom_${Date.now()}_${promptId}`;
    
    await mentionExtractor.extractMentionsFromResponse(
      responseText,
      prompt._id,
      category._id,
      brand._id,
      userId,
      aiResponse._id,
      analysisSessionId
    );

    console.log(`✅ Mentions extracted for analysis session: ${analysisSessionId}`);

    // Step 3: Recalculate Share of Voice with all mentions (existing + new)
    console.log(`📊 Step 3: Recalculating Share of Voice...`);
    const { calculateShareOfVoice } = require('./brand/shareOfVoice');
    
    // Prepare brand object for SOV calculation
    const brandForSOV = {
      _id: brand._id,
      brandName: brand.brandName,
      domain: brand.domain,
      userId: brand.ownerUserId,
      ownerUserId: brand.ownerUserId,
      competitors: brand.competitors || []
    };

    // Get user's categories first
    const userCategories = await BrandCategory.find({ brandId: brand._id });
    const userCategoryIds = userCategories.map(cat => cat._id);
    
    console.log(`🔍 Found ${userCategories.length} user categories for SOV calculation`);

    // Get only AI responses that belong to user's categories (much more efficient)
    const userPrompts = await CategorySearchPrompt.find({ 
      categoryId: { $in: userCategoryIds } 
    });
    const userPromptIds = userPrompts.map(prompt => prompt._id);
    
    const userAIResponses = await PromptAIResponse.find({ 
      promptId: { $in: userPromptIds } 
    }).populate('promptId');

    // Build responses array for SOV calculation
    const userResponses = [];
    for (const response of userAIResponses) {
      if (response.promptId) {
        const categoryDoc = userCategories.find(cat => 
          cat._id.toString() === response.promptId.categoryId.toString()
        );
        if (categoryDoc) {
          userResponses.push({
            aiDoc: response,
            catDoc: categoryDoc
          });
        }
      }
    }

    console.log(`📊 Calculating SOV with ${userResponses.length} total responses (including new one)`);

    // Calculate updated SOV
    await calculateShareOfVoice(
      brandForSOV,
      brandForSOV.competitors,
      userResponses,
      category._id,
      analysisSessionId
    );

    console.log(`✅ Share of Voice recalculated successfully`);

    // Step 4: Return the updated data
    console.log(`🎉 Custom response generation completed successfully!`);

    res.json({
      success: true,
      message: 'Custom response generated and analysis updated',
      data: {
        prompt: {
          id: prompt._id,
          text: prompt.promptText,
          category: category.categoryName
        },
        response: {
          id: aiResponse._id,
          text: responseText,
          generatedAt: aiResponse.runAt
        },
        analysisSessionId: analysisSessionId,
        stats: {
          totalUserResponses: userResponses.length,
          newMentionsExtracted: true,
          sovRecalculated: true
        }
      }
    });

  } catch (error) {
    console.error("❌ Error generating custom response:", error);
    res.status(500).json({ 
      msg: "Failed to generate custom response", 
      error: error.message 
    });
  }
};