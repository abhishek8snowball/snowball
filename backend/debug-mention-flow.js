require("dotenv").config();
const mongoose = require("mongoose");
const MentionExtractor = require("./controllers/brand/mentionExtractor");

async function debugMentionFlow() {
  try {
    console.log("🔍 Debugging Mention Extraction Flow...");
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to database");
    
    // Test the MentionExtractor
    const mentionExtractor = new MentionExtractor();
    
    // Test 1: Check if we can find any PromptAIResponse documents
    const PromptAIResponse = require("./models/PromptAIResponse");
    const totalResponses = await PromptAIResponse.countDocuments();
    console.log(`📊 Total PromptAIResponse documents: ${totalResponses}`);
    
    if (totalResponses > 0) {
      const sampleResponse = await PromptAIResponse.findOne();
      console.log("📝 Sample response:", {
        id: sampleResponse._id,
        promptId: sampleResponse.promptId,
        brandId: sampleResponse.brandId,
        userId: sampleResponse.userId,
        mentionsProcessed: sampleResponse.mentionsProcessed,
        responseText: sampleResponse.responseText?.substring(0, 100) + '...'
      });
      
      // Test 2: Check if we can find any responses with brandId
      const responsesWithBrandId = await PromptAIResponse.find({
        brandId: { $exists: true, $ne: null }
      });
      console.log(`🏢 Responses with brandId: ${responsesWithBrandId.length}`);
      
      if (responsesWithBrandId.length > 0) {
        const firstResponse = responsesWithBrandId[0];
        console.log("🔍 First response with brandId:", {
          id: firstResponse._id,
          brandId: firstResponse.brandId,
          userId: firstResponse.userId,
          mentionsProcessed: firstResponse.mentionsProcessed
        });
        
        // Test 3: Try to process this specific brand
        console.log("🔄 Testing mention extraction for brand:", firstResponse.brandId);
        const totalMentions = await mentionExtractor.processBrandResponses(
          firstResponse.brandId, 
          firstResponse.userId
        );
        console.log("✅ Mention extraction result:", totalMentions);
        
        // Test 4: Check if mentions were created
        const CategoryPromptMention = require("./models/CategoryPromptMention");
        const totalMentionsAfterExtraction = await CategoryPromptMention.countDocuments();
        console.log(`📊 Total mentions after extraction: ${totalMentionsAfterExtraction}`);
        
        if (totalMentionsAfterExtraction > 0) {
          const sampleMention = await CategoryPromptMention.findOne();
          console.log("📝 Sample mention:", {
            companyName: sampleMention.companyName,
            brandId: sampleMention.brandId,
            userId: sampleMention.userId,
            categoryId: sampleMention.categoryId,
            promptId: sampleMention.promptId
          });
        }
      }
    }
    
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from database");
  }
}

if (require.main === module) {
  debugMentionFlow();
}

module.exports = { debugMentionFlow };
