require("dotenv").config();
const mongoose = require("mongoose");
const MentionExtractor = require("./controllers/brand/mentionExtractor");

// Test data
const testResponse = `Tesla is one of the leading electric vehicle manufacturers, competing with companies like Ford, General Motors, and Volkswagen. Their innovative approach to battery technology and autonomous driving has set them apart from traditional automakers.`;

const testPromptId = new mongoose.Types.ObjectId();
const testCategoryId = new mongoose.Types.ObjectId();
const testBrandId = new mongoose.Types.ObjectId();
const testUserId = new mongoose.Types.ObjectId();

async function testMentionExtraction() {
  try {
    console.log("🧪 Testing Backend-Only Mention Extraction...");
    console.log("📋 This test simulates the automatic mention extraction that happens after domain analysis");
    
    // Initialize mention extractor
    const mentionExtractor = new MentionExtractor();
    
    console.log("📝 Test response:", testResponse);
    console.log("🔍 Extracting mentions...");
    
    // Test the extraction
    const mentions = await mentionExtractor.extractMentionsFromResponse(
      testResponse,
      testPromptId,
      testCategoryId,
      testBrandId,
      testUserId,
      testPromptId // Using promptId as responseId for testing
    );
    
    console.log("✅ Extraction completed!");
    console.log("📊 Extracted mentions:", mentions);
    console.log("🔢 Total mentions found:", mentions.length);
    
    // Test regex fallback
    console.log("\n🔍 Testing regex fallback...");
    const regexCompanies = mentionExtractor.extractCompaniesWithRegex(testResponse);
    console.log("📊 Regex extracted companies:", regexCompanies);
    
    console.log("\n🎯 Integration Notes:");
    console.log("• This functionality runs automatically after domain analysis");
    console.log("• Mentions are stored with prompt ID and category ID for traceability");
    console.log("• When viewing competitors, users can see which prompts led to mentions");
    console.log("• No separate frontend component needed - integrated into existing competitor analysis");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testMentionExtraction();
}

module.exports = { testMentionExtraction };
