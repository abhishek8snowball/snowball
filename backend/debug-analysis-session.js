const mongoose = require('mongoose');
const CategoryPromptMention = require('./models/CategoryPromptMention');
const PromptAIResponse = require('./models/PromptAIResponse');
const BrandShareOfVoice = require('./models/BrandShareOfVoice');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/snowball');

async function debugAnalysisSession() {
  try {
    console.log("🔍 Debugging Analysis Session Data Flow...\n");
    
    // 1. Check if any mentions have analysisSessionId
    const mentionsWithSession = await CategoryPromptMention.find({
      analysisSessionId: { $exists: true, $ne: null }
    });
    
    console.log(`📊 Mentions WITH analysisSessionId: ${mentionsWithSession.length}`);
    if (mentionsWithSession.length > 0) {
      console.log("✅ Sample mention with session:", {
        id: mentionsWithSession[0]._id,
        analysisSessionId: mentionsWithSession[0].analysisSessionId,
        companyName: mentionsWithSession[0].companyName,
        createdAt: mentionsWithSession[0].createdAt
      });
    }
    
    // 2. Check mentions WITHOUT analysisSessionId (old data)
    const mentionsWithoutSession = await CategoryPromptMention.find({
      analysisSessionId: { $exists: false }
    });
    
    console.log(`📊 Mentions WITHOUT analysisSessionId: ${mentionsWithoutSession.length}`);
    if (mentionsWithoutSession.length > 0) {
      console.log("⚠️ Sample old mention:", {
        id: mentionsWithoutSession[0]._id,
        companyName: mentionsWithoutSession[0].companyName,
        createdAt: mentionsWithoutSession[0].createdAt
      });
    }
    
    // 3. Check PromptAIResponse documents
    const responsesWithSession = await PromptAIResponse.find({
      analysisSessionId: { $exists: true, $ne: null }
    });
    
    console.log(`📊 AI Responses WITH analysisSessionId: ${responsesWithSession.length}`);
    
    // 4. Check recent mentions (last 24 hours)
    const recentMentions = await CategoryPromptMention.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    console.log(`📊 Recent mentions (last 24h): ${recentMentions.length}`);
    
    // 5. Check if there are any analysisSessionId values
    const uniqueSessionIds = await CategoryPromptMention.distinct('analysisSessionId');
    console.log(`🆔 Unique analysisSessionId values: ${uniqueSessionIds.length}`);
    if (uniqueSessionIds.length > 0) {
      console.log("📝 Session IDs found:", uniqueSessionIds.slice(0, 5));
    }
    
    console.log("\n🔍 Analysis:");
    if (mentionsWithSession.length === 0) {
      console.log("❌ NO mentions have analysisSessionId - mention extraction is not working!");
      console.log("💡 Check if mentionExtractor.js is being called correctly");
    } else {
      console.log("✅ Mentions have analysisSessionId - mention extraction is working");
    }
    
    if (mentionsWithoutSession.length > 0) {
      console.log("⚠️ Old mentions exist without analysisSessionId - this is expected");
    }
    
  } catch (error) {
    console.error("❌ Error debugging:", error.message);
  } finally {
    mongoose.connection.close();
  }
}

// Run the debug
debugAnalysisSession();
