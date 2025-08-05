const PerplexityService = require("../../utils/perplexityService");

exports.generateBrandDescription = async (openai, brand) => {
  try {
    console.log(`🔍 Generating brand description using Perplexity for: ${brand.brandName} (${brand.domain})`);
    
    const perplexityService = new PerplexityService();
    
    if (!perplexityService.apiKey) {
      console.warn('⚠️ Perplexity API key not found, using OpenAI fallback');
      return await generateDescriptionWithOpenAI(openai, brand);
    }

    const response = await perplexityService.getDomainInfo(brand.domain);
    
    // Clean up the response to make it more concise
    let description = response.trim();
    
    // If the response is too long, truncate it
    if (description.length > 200) {
      const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
      if (sentences.length >= 2) {
        description = sentences.slice(0, 2).join('. ') + '.';
      } else {
        description = description.substring(0, 200).trim();
        if (!description.endsWith('.')) {
          description += '...';
        }
      }
    }
    
    console.log(`✅ Brand description generated with Perplexity:`, description);
    return description;
    
  } catch (error) {
    console.error(`❌ Perplexity API error for brand description:`, error.message);
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
  return descResp.choices[0].message.content.trim();
}