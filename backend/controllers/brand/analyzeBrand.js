const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const TokenCostLogger = require("../../utils/tokenCostLogger");

// Import legacy models
const BrandShareOfVoice = require("../../models/BrandShareOfVoice");
const BrandCategory = require("../../models/BrandCategory");
const CategorySearchPrompt = require("../../models/CategorySearchPrompt");
const PromptAIResponse = require("../../models/PromptAIResponse");

const { findOrCreateBrandProfile } = require("./brandProfile");
const { extractCategories, saveCategories } = require("./category");
const { generateAndSavePrompts } = require("./prompt");
const { runPromptsAndSaveResponses } = require("./aiResponse");
const { parseInsightsAndCompetitors } = require("./insight");
const { calculateMetrics } = require("./metrics");
const { generateBrandDescription } = require("./description");
const { extractCompetitorsWithOpenAI } = require("./extractCompetitors");
const { calculateShareOfVoice } = require("./shareOfVoice");
const BrandMatcher = require('./brandMatcher');
const EntityRecognizer = require('./entityRecognizer');

// Initialize token logger for cost tracking
const tokenLogger = new TokenCostLogger();

exports.analyzeBrand = async (req, res) => {
  console.log("=== 🚀 Starting Brand Analysis ===");
  console.log("📋 Request body:", req.body);
  const { domain, brandName } = req.body;
  const userId = req.user.id;

  if (!domain) return res.status(400).json({ msg: "Domain is required" });

  // Log analysis session start
  tokenLogger.logAnalysisStart(domain, brandName || domain);
  const analysisStartTime = Date.now();

  try {
    // 1. Create or find brand profile
    console.log("📝 Step 1: Creating/finding brand profile...");
    const brand = await findOrCreateBrandProfile({ domain, brandName, userId });
    console.log("✅ Brand profile ready:", brand.brandName);
    
    // Log brand voice information if available
    if (brand.brandTonality || brand.brandInformation) {
      console.log("🎭 Brand voice information:", {
        tonality: brand.brandTonality || "Not analyzed",
        info: brand.brandInformation || "Not analyzed"
      });
    }

    // 2. Extract categories
    console.log("🏷️ Step 2: Extracting categories...");
    const categories = await extractCategories(domain);
    console.log("✅ Categories extracted:", categories);

    // 3. Save categories
    console.log("💾 Step 3: Saving categories...");
    const catDocs = await saveCategories(brand, categories);
    console.log("✅ Categories saved:", catDocs.length, "categories");

    // 4. Generate prompts
    console.log("📝 Step 4: Generating prompts...");
    const categoryPrompts = await generateAndSavePrompts(openai, catDocs, brand, []);
    console.log("✅ Prompts generated:", categoryPrompts.length, "prompts");

    // 5. Run prompts and save responses
    console.log("🤖 Step 5: Running prompts...");
    const aiResponses = await runPromptsAndSaveResponses(openai, categoryPrompts);
    console.log("✅ AI responses generated:", aiResponses.length, "responses");

    // 6. Extract competitors
    console.log("🏆 Step 6: Extracting competitors...");
    const competitors = await extractCompetitorsWithOpenAI(openai, brand);
    console.log("✅ Competitors extracted:", competitors);

    // 7. Calculate share of voice
    console.log("📊 Step 7: Calculating share of voice...");
    const sovResult = await calculateShareOfVoice(brand, competitors, aiResponses, catDocs[0]?._id);
    console.log("✅ Share of voice calculated");

    // 8. Generate brand description
    console.log("📝 Step 8: Generating brand description...");
    const brandDescription = await generateBrandDescription(openai, { domain, brandName });
    console.log("✅ Brand description generated");

    // 9. Update brand profile with description and analyze voice
    console.log("🎭 Step 9: Updating brand profile with voice analysis...");
    try {
      const { updateBrandProfileWithDescriptionAndVoice } = require("./brandProfile");
      await updateBrandProfileWithDescriptionAndVoice(brand, brandDescription, domain, brandName);
      console.log("✅ Brand profile updated with description and voice analysis");
    } catch (voiceError) {
      console.error("⚠️ Brand voice analysis failed:", voiceError.message);
      // Continue without voice analysis - profile is still updated with description
    }

    // 10. Save all data to BrandShareOfVoice
    console.log("💾 Step 10: Saving analysis results...");
    const analysisData = {
      brandId: brand._id,
      userId,
      domain,
      brandName: brand.brandName,
      description: brandDescription,
      categories: catDocs.map(cat => cat._id), // Save only ObjectIds
      categoryPrompts: categoryPrompts.map(prompt => prompt._id), // Save only ObjectIds
      aiResponses: aiResponses.map(response => response.aiDoc._id), // Save only ObjectIds
      competitors,
      shareOfVoice: sovResult.shareOfVoice,
      mentionCounts: sovResult.mentionCounts,
      totalMentions: sovResult.totalMentions,
      brandShare: sovResult.brandShare,
      aiVisibilityScore: sovResult.aiVisibilityScore,
      analysisDate: new Date(),
      duration: Math.round((Date.now() - analysisStartTime) / 1000),
      // Add missing fields for schema compatibility
      categoryId: catDocs[0]?._id, // Use first category ID if available
      calculatedAt: new Date()
    };

    const brandAnalysis = new BrandShareOfVoice(analysisData);
    await brandAnalysis.save();
    console.log("✅ Analysis results saved to database");

    // 10. Log token usage and complete
    const analysisEndTime = Date.now();
    const totalDuration = Math.round((analysisEndTime - analysisStartTime) / 1000);
    
    tokenLogger.logAnalysisEnd();
    
    console.log("=== 🎉 Brand Analysis Complete ===");
    console.log("⏱️ Total duration:", totalDuration, "seconds");
    console.log("📊 Results:", {
      categories: catDocs.length,
      competitors: competitors.length,
      shareOfVoice: Object.keys(sovResult.shareOfVoice).length,
      totalMentions: sovResult.totalMentions
    });

    // Return success response
    res.json({
      success: true,
      msg: "Brand analysis completed successfully",
      brand: brand.brandName,
      domain: brand.domain,
      description: brandDescription,
      brandId: brand._id,
      analysisId: brandAnalysis._id,
      categories: catDocs, // Send full category objects to frontend
      competitors,
      shareOfVoice: sovResult.shareOfVoice,
      mentionCounts: sovResult.mentionCounts,
      totalMentions: sovResult.totalMentions,
      brandShare: sovResult.brandShare,
      aiVisibilityScore: sovResult.aiVisibilityScore,
      analysisDate: brandAnalysis.analysisDate,
      duration: totalDuration
    });

  } catch (error) {
    console.error("=== 💥 Analysis Error ===");
    console.error("❌ Error details:", error);
    
    // Log token usage on error
    console.error("Token usage logging skipped due to error");
    
    res.status(500).json({ 
      success: false,
      msg: "Analysis failed", 
      error: error.message 
    });
  }
};

// Get existing brand analysis data
exports.getBrandAnalysis = async (req, res) => {
  console.log("=== 🔍 Retrieving Brand Analysis ===");
  const { brandId } = req.params;
  const userId = req.user.id;

  if (!brandId) return res.status(400).json({ msg: "Brand ID is required" });

  try {
    // Validate brand ownership using utility function
    const { validateBrandOwnership } = require("../../utils/brandValidation");
    const brand = await validateBrandOwnership(userId, brandId);

    if (!brand) {
      return res.status(403).json({ msg: "Access denied: You don't have permission to access this brand" });
    }

    console.log("✅ Brand ownership validated:", brand.brandName);

    // Get the most recent analysis for this brand
    const latestAnalysis = await BrandShareOfVoice.findOne({ brandId: brand._id, userId })
      .sort({ analysisDate: -1 });

    if (!latestAnalysis) {
      return res.status(404).json({ 
        success: false,
        msg: "No analysis found for this brand. Please run a new analysis first." 
      });
    }

    // Since we changed from Map to Object types, no conversion needed
    const shareOfVoice = latestAnalysis.shareOfVoice || {};
    const mentionCounts = latestAnalysis.mentionCounts || {};

    console.log("✅ Brand analysis retrieved:", {
      categories: latestAnalysis.categories?.length || 0,
      competitors: latestAnalysis.competitors?.length || 0,
      shareOfVoice: Object.keys(shareOfVoice).length,
      analysisDate: latestAnalysis.analysisDate
    });

    res.json({
      success: true,
      brand: latestAnalysis.brandName,
      domain: latestAnalysis.domain,
      description: latestAnalysis.description || `${latestAnalysis.brandName} provides an AI-powered platform designed for sales teams and sales development representatives (SDRs).`,
      brandId: latestAnalysis.brandId,
      categories: latestAnalysis.categories || [],
      competitors: latestAnalysis.competitors || [],
      shareOfVoice: shareOfVoice,
      mentionCounts: mentionCounts,
      totalMentions: latestAnalysis.totalMentions || 0,
      brandShare: latestAnalysis.brandShare || 0,
      aiVisibilityScore: latestAnalysis.aiVisibilityScore || 0,
      status: "Analysis retrieved from database."
    });

  } catch (err) {
    console.error("=== 💥 Brand Analysis Retrieval Error ===");
    console.error("❌ Error details:", err);
    res.status(500).json({ 
      success: false,
      msg: "Failed to retrieve brand analysis", 
      error: err.message
    });
  }
};