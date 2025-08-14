require("dotenv").config();
const mongoose = require("mongoose");
const CategoryPromptMention = require("./models/CategoryPromptMention");

async function testAPIEndpoint() {
  try {
    console.log("🧪 Testing API Endpoint...");
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to database");
    
    // Test 1: Check if we can find SalesLoft mentions
    const salesloftMentions = await CategoryPromptMention.find({
      companyName: { $regex: /salesloft/i }
    });
    
    console.log(`📊 Found ${salesloftMentions.length} SalesLoft mentions`);
    
    if (salesloftMentions.length > 0) {
      const firstMention = salesloftMentions[0];
      console.log("📝 First SalesLoft mention:", {
        companyName: firstMention.companyName,
        brandId: firstMention.brandId,
        userId: firstMention.userId,
        categoryId: firstMention.categoryId,
        promptId: firstMention.promptId,
        responseId: firstMention.responseId
      });
      
      // Test 2: Test the exact query that the API uses
      const companyName = "SalesLoft";
      const brandId = firstMention.brandId;
      const userId = firstMention.userId;
      
      console.log(`🔍 Testing API query for: ${companyName}, brandId: ${brandId}, userId: ${userId}`);
      
      const apiQueryResult = await CategoryPromptMention.find({
        companyName: { $regex: new RegExp(companyName, 'i') },
        brandId,
        userId
      })
      .populate('categoryId', 'categoryName')
      .populate('promptId', 'promptText')
      .populate('responseId', 'responseText')
      .sort({ createdAt: -1 });
      
      console.log(`✅ API query result: ${apiQueryResult.length} mentions`);
      
      if (apiQueryResult.length > 0) {
        const populatedMention = apiQueryResult[0];
        console.log("📝 Populated mention:", {
          companyName: populatedMention.companyName,
          brandId: populatedMention.brandId,
          userId: populatedMention.userId,
          categoryId: populatedMention.categoryId,
          promptId: populatedMention.promptId,
          responseId: populatedMention.responseId,
          categoryName: populatedMention.categoryId?.categoryName,
          promptText: populatedMention.promptId?.promptText,
          responseText: populatedMention.responseId?.responseText?.substring(0, 100) + '...'
        });
      }
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from database");
  }
}

if (require.main === module) {
  testAPIEndpoint();
}

module.exports = { testAPIEndpoint };
