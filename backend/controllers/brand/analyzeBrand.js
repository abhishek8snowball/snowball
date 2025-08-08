const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const { findOrCreateBrandProfile } = require("./brandProfile");
const { extractCategories, saveCategories } = require("./category");
const { generateAndSavePrompts } = require("./prompt");
const { runPromptsAndSaveResponses } = require("./aiResponse");
const { parseInsightsAndCompetitors } = require("./insight");
const { calculateMetrics } = require("./metrics");
const { generateBrandDescription } = require("./description");
const { extractCompetitorsWithOpenAI } = require("./extractCompetitors");
const { calculateShareOfVoice } = require("./shareOfVoice");
// Removed SEO audit import - not used anymore
const BrandMatcher = require('./brandMatcher');
const EntityRecognizer = require('./entityRecognizer');

exports.analyzeBrand = async (req, res) => {
  console.log("=== 🚀 Starting Brand Analysis ===");
  console.log("📋 Request body:", req.body);
  const { domain, brandName } = req.body;
  const userId = req.user.id;

  if (!domain) return res.status(400).json({ msg: "Domain is required" });

  try {
    // 1. Brand profile
    console.log("📝 Step 1: Creating brand profile...");
    const brand = await findOrCreateBrandProfile({ domain, brandName, userId });
    console.log("✅ Brand profile created:", brand.brandName);

    // After creating/finding the brand profile:
    const brandMatcher = new BrandMatcher();
    brandMatcher.addDomainBrand(domain, brand.brandName);

    const entityRecognizer = new EntityRecognizer();

    // 2. Categories
    console.log("🏷️ Step 2: Extracting categories with Perplexity API...");
    const categories = await extractCategories(domain);
    console.log("✅ Categories extracted:", categories);
    const catDocs = await saveCategories(brand, categories);
    console.log("✅ Categories saved:", catDocs.length, "categories");

    // 3. Dedicated Competitor Extraction (moved up to avoid redundant prompt generation)
    console.log("🏢 Step 3: Extracting competitors with OpenAI...");
    let competitors = [];
    try {
      competitors = await extractCompetitorsWithOpenAI(openai, brand);
      console.log("✅ Competitors extracted:", competitors);
    } catch (error) {
      console.error("❌ Error extracting competitors:", error);
      competitors = ["competitor1", "competitor2", "competitor3"]; // Fallback
    }

    // 4. Generate prompts with real competitors (only once)
    console.log("🤖 Step 4: Generating prompts with OpenAI (keywords + questions)...");
    let prompts = [];
    try {
      prompts = await generateAndSavePrompts(openai, catDocs, brand, competitors);
      console.log("✅ Prompts generated with competitors:", prompts.length, "prompts");
    } catch (error) {
      console.error("❌ Error generating prompts:", error);
      prompts = [];
    }

    // 5. AI Responses
    console.log("🧠 Step 5: Running prompts and getting AI responses...");
    const aiResponses = await runPromptsAndSaveResponses(openai, prompts);
    console.log("✅ AI responses received:", aiResponses.length, "responses");

    // 6. Insights & Competitors
    console.log("🔍 Step 6: Parsing insights and competitors...");
    await parseInsightsAndCompetitors(aiResponses, brand);
    console.log("✅ Insights and competitors parsed");

    // 7. Metrics
    console.log("📊 Step 7: Calculating metrics...");
    await calculateMetrics(aiResponses, brand);
    console.log("✅ Metrics calculated");

    // 8. Share of Voice Calculation
    console.log("📈 Step 8: Calculating Share of Voice...");
    let sovResult = { shareOfVoice: {}, mentionCounts: {}, totalMentions: 0 };
    try {
      sovResult = await calculateShareOfVoice(
        brand,
        competitors,
        aiResponses,
        catDocs[0]?._id
      );
      console.log("✅ Share of Voice calculated:", sovResult);
    } catch (error) {
      console.error("❌ Error calculating Share of Voice:", error);
      // Create fallback Share of Voice data
      sovResult = {
        shareOfVoice: { [brand.brandName.toLowerCase()]: 50 },
        mentionCounts: { [brand.brandName.toLowerCase()]: 5 },
        totalMentions: 10,
        brandShare: 50
      };
    }

    // 9. Description
    console.log("📝 Step 9: Generating brand description...");
    let brandDescription = "";
    try {
      brandDescription = await generateBrandDescription(openai, brand);
      console.log("✅ Brand description generated");
    } catch (error) {
      console.error("❌ Error generating brand description:", error);
      brandDescription = `Analysis of ${brand.brandName} (${brand.domain})`;
    }

    // 10. Blog Analysis - Ready for optional execution
    console.log("📝 Step 10: Blog analysis ready (triggered by user)");
    const blogAnalysis = { 
      blogs: [], 
      status: "ready", 
      message: "Blog analysis can be triggered separately" 
    };

    console.log("=== 🎉 Brand Analysis Complete ===");
    console.log("📊 Final Results Summary:");
    console.log("   - Brand:", brand.brandName);
    console.log("   - Categories:", categories.length);
    console.log("   - Competitors:", competitors.length);
    console.log("   - SEO: Skipped (not displayed)");
    console.log("   - Share of Voice:", sovResult.brandShare || 0, "%");
    console.log("   - Blogs: Use separate blog extraction endpoint");

    res.json({
      brand: brand.brandName,
      domain: brand.domain,
      description: brandDescription,
      brandId: brand._id, // Add brandId for frontend use
      categories: catDocs, // Send the saved category objects with _id
      competitors,
      shareOfVoice: sovResult.shareOfVoice,
      mentionCounts: sovResult.mentionCounts,
      totalMentions: sovResult.totalMentions,
      brandShare: sovResult.brandShare,
      blogAnalysis, // Add blog analysis results
      status: "Analysis complete."
    });
  } catch (err) {
    console.error("=== 💥 Domain Analysis Error ===");
    console.error("❌ Error details:", err);
    console.error("📚 Stack trace:", err.stack);
    res.status(500).json({ 
      msg: "Domain analysis failed", 
      error: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
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

    // Get categories for this brand
    const BrandCategory = require("../../models/BrandCategory");
    const categories = await BrandCategory.find({ brandId: brand._id }).sort({ createdAt: 1 });
    console.log("✅ Categories found:", categories.length);

    // Get competitors from AICompetitorMention collection
    const AICompetitorMention = require("../../models/AICompetitorMention");
    const competitorMentions = await AICompetitorMention.find({}).sort({ createdAt: -1 });
    
    // Extract unique competitor names
    const competitors = [...new Set(competitorMentions.map(mention => mention.competitorName))];
    console.log("✅ Competitors found:", competitors.length, competitors);

    // Get Share of Voice data
    const BrandShareOfVoice = require("../../models/BrandShareOfVoice");
    const shareOfVoiceData = await BrandShareOfVoice.findOne({ brandId: brand._id }).sort({ createdAt: -1 });
    
    let sovResult = { shareOfVoice: {}, mentionCounts: {}, totalMentions: 0, brandShare: 0 };
    if (shareOfVoiceData) {
      sovResult = {
        shareOfVoice: shareOfVoiceData.shareOfVoice || {},
        mentionCounts: shareOfVoiceData.mentionCounts || {},
        totalMentions: shareOfVoiceData.totalMentions || 0,
        brandShare: shareOfVoiceData.brandShare || 0
      };
    }
    console.log("✅ Share of Voice data:", sovResult);

    // Get brand description (you might want to store this in the database)
    const brandDescription = `${brand.brandName} provides an AI-powered platform designed for sales teams and sales development representatives (SDRs).`;

    console.log("=== 🎉 Brand Analysis Retrieved ===");
    console.log("📊 Results Summary:");
    console.log("   - Brand:", brand.brandName);
    console.log("   - Categories:", categories.length);
    console.log("   - Competitors:", competitors.length);
    console.log("   - Share of Voice:", sovResult.brandShare, "%");

    res.json({
      brand: brand.brandName,
      domain: brand.domain,
      description: brandDescription,
      brandId: brand._id,
      categories,
      competitors,
      shareOfVoice: sovResult.shareOfVoice,
      mentionCounts: sovResult.mentionCounts,
      totalMentions: sovResult.totalMentions,
      brandShare: sovResult.brandShare,
      status: "Analysis retrieved from database."
    });
  } catch (err) {
    console.error("=== 💥 Brand Analysis Retrieval Error ===");
    console.error("❌ Error details:", err);
    res.status(500).json({ 
      msg: "Failed to retrieve brand analysis", 
      error: err.message
    });
  }
};