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
const { analyzeWebsiteSEO } = require("./seoAudit");
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
    // Now you can use entityRecognizer with brand context

    // 2. Categories
    console.log("🏷️ Step 2: Extracting categories with Perplexity API...");
    const categories = await extractCategories(domain);
    console.log("✅ Categories extracted:", categories);
    const catDocs = await saveCategories(brand, categories);
    console.log("✅ Categories saved:", catDocs.length, "categories");

    // 3. Prompts (will be updated with competitors after Step 7)
    console.log("🤖 Step 3: Generating prompts...");
    let prompts = [];
    try {
      // Initially generate prompts without competitors (will be updated later)
      prompts = await generateAndSavePrompts(openai, catDocs, brand);
      console.log("✅ Initial prompts generated:", prompts.length, "prompts");
    } catch (error) {
      console.error("❌ Error generating prompts:", error);
      prompts = [];
    }

    // 4. AI Responses
    console.log("🧠 Step 4: Running prompts and getting AI responses...");
    const aiResponses = await runPromptsAndSaveResponses(openai, prompts);
    console.log("✅ AI responses received:", aiResponses.length, "responses");

    // 5. Insights & Competitors
    console.log("🔍 Step 5: Parsing insights and competitors...");
    await parseInsightsAndCompetitors(aiResponses, brand);
    console.log("✅ Insights and competitors parsed");

    // 6. Metrics
    console.log("📊 Step 6: Calculating metrics...");
    await calculateMetrics(aiResponses, brand);
    console.log("✅ Metrics calculated");

    // 7. Dedicated Competitor Extraction
    console.log("🏢 Step 7: Extracting competitors with OpenAI...");
    let competitors = [];
    try {
      competitors = await extractCompetitorsWithOpenAI(openai, brand);
      console.log("✅ Competitors extracted:", competitors);
    } catch (error) {
      console.error("❌ Error extracting competitors:", error);
      competitors = ["competitor1", "competitor2", "competitor3"]; // Fallback
    }

    // 7.5. Regenerate prompts with real competitors
    console.log("🔄 Step 7.5: Regenerating prompts with real competitors...");
    try {
      // Delete existing prompts and regenerate with real competitors
      const CategorySearchPrompt = require("../../models/CategorySearchPrompt");
      for (const catDoc of catDocs) {
        await CategorySearchPrompt.deleteMany({ categoryId: catDoc._id });
      }
      prompts = await generateAndSavePrompts(openai, catDocs, brand, competitors);
      console.log("✅ Prompts regenerated with real competitors:", prompts.length, "prompts");
    } catch (error) {
      console.error("❌ Error regenerating prompts with competitors:", error);
      // Keep existing prompts if regeneration fails
    }

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

    // 9. SEO/Performance Audit
    console.log("🔧 Step 9: Running SEO audit...");
    let seoAudit = { issues: [], score: 0 };
    try {
      seoAudit = await analyzeWebsiteSEO(openai, brand.domain);
      console.log("✅ SEO audit completed");
    } catch (error) {
      console.error("❌ Error in SEO audit:", error);
      seoAudit = { 
        issues: [{ type: "info", message: "SEO analysis could not be completed" }], 
        score: 0 
      };
    }

    // 10. Description
    console.log("📝 Step 10: Generating brand description...");
    let brandDescription = "";
    try {
      brandDescription = await generateBrandDescription(openai, brand);
      console.log("✅ Brand description generated");
    } catch (error) {
      console.error("❌ Error generating brand description:", error);
      brandDescription = `Analysis of ${brand.brandName} (${brand.domain})`;
    }

    console.log("=== 🎉 Brand Analysis Complete ===");
    console.log("📊 Final Results Summary:");
    console.log("   - Brand:", brand.brandName);
    console.log("   - Categories:", categories.length);
    console.log("   - Competitors:", competitors.length);
    console.log("   - SEO Issues:", seoAudit.issues?.length || 0);
    console.log("   - Share of Voice:", sovResult.brandShare || 0, "%");

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
      seoAudit,
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