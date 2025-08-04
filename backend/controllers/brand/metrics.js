const BrandShareOfVoice = require("../../models/BrandShareOfVoice");
const BrandStrengthScore = require("../../models/BrandStrengthScore");

exports.calculateMetrics = async (aiResponses, brand) => {
  console.log("Calculating metrics for brand:", brand.brandName);
  
  for (const { aiDoc, catDoc } of aiResponses) {
    try {
      // Calculate real metrics from AI responses
      const responseText = aiDoc.responseText.toLowerCase();
      const brandName = brand.brandName.toLowerCase();
      
      // Count brand mentions in this response
      const brandMentions = (responseText.match(new RegExp(brandName, "g")) || []).length;
      
      // Calculate sentiment (simple positive/negative word counting)
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'best', 'top', 'leading', 'popular', 'trusted', 'reliable'];
      const negativeWords = ['bad', 'poor', 'terrible', 'worst', 'unreliable', 'expensive', 'difficult', 'complicated'];
      
      let positiveCount = 0;
      let negativeCount = 0;
      
      positiveWords.forEach(word => {
        positiveCount += (responseText.match(new RegExp(word, "g")) || []).length;
      });
      
      negativeWords.forEach(word => {
        negativeCount += (responseText.match(new RegExp(word, "g")) || []).length;
      });
      
      // Calculate sentiment score (-100 to 100)
      const totalSentimentWords = positiveCount + negativeCount;
      const sentimentScore = totalSentimentWords > 0 
        ? Math.round(((positiveCount - negativeCount) / totalSentimentWords) * 100)
        : 0;
      
      // Estimate domain authority based on mentions and sentiment
      const domainAuthority = Math.min(100, Math.max(0, 
        Math.round((brandMentions * 10) + (sentimentScore * 0.5) + 30)
      ));
      
      // Calculate citation count (mentions across all responses)
      const citationCount = brandMentions;
      
      // Calculate final score (weighted average)
      const finalScore = Math.round(
        (domainAuthority * 0.4) + 
        (citationCount * 5) + 
        (sentimentScore * 0.3)
      );
      
      console.log(`Metrics for ${brand.brandName} in category ${catDoc.categoryName}:`, {
        brandMentions,
        sentimentScore,
        domainAuthority,
        citationCount,
        finalScore
      });
      
      // Save Share of Voice (will be calculated properly in shareOfVoice.js)
      const sov = await BrandShareOfVoice.create({
        brandId: brand._id,
        categoryId: catDoc._id,
        totalMentions: brandMentions,
        targetMentions: brandMentions,
        shareOfVoicePct: brandMentions > 0 ? 100 : 0 // Will be recalculated properly
      });
      console.log("BrandShareOfVoice created:", sov);

      // Save Brand Strength Score
      const score = await BrandStrengthScore.create({
        brandId: brand._id,
        categoryId: catDoc._id,
        avgDomainAuthority: domainAuthority,
        citationCount: citationCount,
        avgSentiment: sentimentScore,
        finalScore: Math.min(100, Math.max(0, finalScore))
      });
      console.log("BrandStrengthScore created:", score);
      
    } catch (error) {
      console.error("Error calculating metrics for category:", catDoc.categoryName, error);
      // Continue with other categories even if one fails
    }
  }
};