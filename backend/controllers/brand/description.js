const PerplexityService = require("../../utils/perplexityService");
const TokenCostLogger = require("../../utils/tokenCostLogger");

// Initialize token logger
const tokenLogger = new TokenCostLogger();

exports.generateBrandDescription = async (openai, brand) => {
  try {
    console.log(`🔍 Checking for pre-extracted brand description for: ${brand.brandName} (${brand.domain})`);
    
    // Check if we already have a description from the first Perplexity call
    if (global.extractedBrandDescription) {
      console.log(`✅ Using pre-extracted brand description from first Perplexity call`);
      const description = global.extractedBrandDescription;
      
      // Clean up the global variable
      delete global.extractedBrandDescription;
      
      console.log(`✅ Brand description retrieved:`, description);
      return description;
    }
    
    // Fallback: If no pre-extracted description, use OpenAI
    console.log(`⚠️ No pre-extracted description found, using OpenAI fallback`);
    return await generateDescriptionWithOpenAI(openai, brand);
    
  } catch (error) {
    console.error(`❌ Error retrieving brand description:`, error.message);
    console.log(`🔄 Falling back to OpenAI for brand description`);
    return await generateDescriptionWithOpenAI(openai, brand);
  }
};

async function generateDescriptionWithOpenAI(openai, brand) {
  const descPrompt = `Write a concise 1-2 sentence description for the brand "${brand.brandName}" (${brand.domain}).`;
  
  const descResp = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: descPrompt }],
    max_tokens: 100,
  });
  
  const responseContent = descResp.choices[0].message.content.trim();
  
  // Log token usage and cost for OpenAI fallback
  tokenLogger.logOpenAICall(
    'Brand Description (OpenAI Fallback)',
    descPrompt,
    responseContent,
    'gpt-3.5-turbo'
  );
  
  return responseContent;
}