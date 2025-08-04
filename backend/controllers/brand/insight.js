const AIParsedInsight = require("../../models/AIParsedInsight");
const AICompetitorMention = require("../../models/AICompetitorMention");

exports.parseInsightsAndCompetitors = async (aiResponses, brand) => {
  for (const { aiDoc, catDoc } of aiResponses) {
    const text = aiDoc.responseText;

    // Extract domains using regex
    const citedDomains = Array.from(new Set(
      (text.match(/\b(?:[a-z0-9-]+\.)+[a-z]{2,}\b/gi) || [])
        .filter(domain => !domain.includes(brand.domain))
    ));

    // Extract brand names (very basic, improve as needed)
    const mentionedBrands = [];
    const brandRegex = /(?:brand|competitor)[\s:]*([A-Za-z0-9\s]+)/gi;
    let match;
    while ((match = brandRegex.exec(text)) !== null) {
      mentionedBrands.push(match[1].trim());
    }

    const insight = await AIParsedInsight.create({
      aiResponseId: aiDoc._id,
      mentionedBrands,
      citedDomains,
      sentiment: "neutral"
    });
    console.log("AIParsedInsight created:", insight);

    // Extract competitor domains/brands
    for (const [i, competitorDomain] of citedDomains.entries()) {
      const competitorMention = await AICompetitorMention.create({
        insightId: insight._id,
        competitorName: mentionedBrands[i] || competitorDomain,
        competitorDomain,
        mentionCount: 1,
        sentiment: "neutral"
      });
      console.log("AICompetitorMention created:", competitorMention);
    }
  }
};