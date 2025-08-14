require("dotenv").config();
const mongoose = require("mongoose");
const CategoryPromptMention = require("./models/CategoryPromptMention");
const PromptAIResponse = require("./models/PromptAIResponse");
const CategorySearchPrompt = require("./models/CategorySearchPrompt");

async function debugMentions() {
  try {
    console.log("🔍 Debugging Mention Extraction Issues...");
    
    // 1. Check if any mentions exist at all
    const totalMentions = await CategoryPromptMention.countDocuments();
    console.log(`📊 Total mentions in database: ${totalMentions}`);
    
    if (totalMentions > 0) {
      const sampleMentions = await CategoryPromptMention.find().limit(3);
      console.log("📝 Sample mentions:", sampleMentions.map(m => ({
        id: m._id,
        companyName: m.companyName,
        brandId: m.brandId,
        userId: m.userId,
        categoryId: m.categoryId,
        promptId: m.promptId,
        responseId: m.responseId,
        createdAt: m.createdAt
      })));
    }
    
    // 2. Check if any AI responses exist
    const totalResponses = await PromptAIResponse.countDocuments();
    console.log(`🤖 Total AI responses in database: ${totalResponses}`);
    
    if (totalResponses > 0) {
      const sampleResponses = await PromptAIResponse.find().limit(3);
      console.log("📝 Sample responses:", sampleResponses.map(r => ({
        id: r._id,
        promptId: r.promptId,
        brandId: r.brandId,
        userId: r.userId,
        mentionsProcessed: r.mentionsProcessed,
        responseText: r.responseText?.substring(0, 100) + '...'
      })));
    }
    
    // 3. Check if any prompts exist
    const totalPrompts = await CategorySearchPrompt.countDocuments();
    console.log(`📝 Total prompts in database: ${totalPrompts}`);
    
    if (totalPrompts > 0) {
      const samplePrompts = await CategorySearchPrompt.find().limit(3);
      console.log("📝 Sample prompts:", samplePrompts.map(p => ({
        id: p._id,
        categoryId: p.categoryId,
        brandId: p.brandId,
        promptText: p.promptText?.substring(0, 100) + '...'
      })));
    }
    
    // 4. Check for specific company mentions
    const salesloftMentions = await CategoryPromptMention.find({
      companyName: { $regex: /salesloft/i }
    });
    console.log(`🔍 SalesLoft mentions found: ${salesloftMentions.length}`);
    
    if (salesloftMentions.length > 0) {
      console.log("📝 SalesLoft mention details:", salesloftMentions.map(m => ({
        companyName: m.companyName,
        brandId: m.brandId,
        userId: m.userId
      })));
    }
    
    // 5. Check for unprocessed responses
    const unprocessedResponses = await PromptAIResponse.find({
      mentionsProcessed: false
    });
    console.log(`⏳ Unprocessed responses: ${unprocessedResponses.length}`);
    
    if (unprocessedResponses.length > 0) {
      console.log("📝 Sample unprocessed response:", {
        id: unprocessedResponses[0]._id,
        promptId: unprocessedResponses[0].promptId,
        brandId: unprocessedResponses[0].brandId,
        userId: unprocessedResponses[0].userId,
        responseText: unprocessedResponses[0].responseText?.substring(0, 200) + '...'
      });
    }
    
    // 6. Check for responses with brandId
    const responsesWithBrandId = await PromptAIResponse.find({
      brandId: { $exists: true, $ne: null }
    });
    console.log(`🏢 Responses with brandId: ${responsesWithBrandId.length}`);
    
    // 7. Check for responses without brandId
    const responsesWithoutBrandId = await PromptAIResponse.find({
      $or: [
        { brandId: { $exists: false } },
        { brandId: null }
      ]
    });
    console.log(`❌ Responses without brandId: ${responsesWithoutBrandId.length}`);
    
    console.log("\n🎯 Debug Summary:");
    console.log(`• Total mentions: ${totalMentions}`);
    console.log(`• Total responses: ${totalResponses}`);
    console.log(`• Total prompts: ${totalPrompts}`);
    console.log(`• SalesLoft mentions: ${salesloftMentions.length}`);
    console.log(`• Unprocessed responses: ${unprocessedResponses.length}`);
    console.log(`• Responses with brandId: ${responsesWithBrandId.length}`);
    console.log(`• Responses without brandId: ${responsesWithoutBrandId.length}`);
    
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
  }
}

if (require.main === module) {
  debugMentions();
}

module.exports = { debugMentions };
