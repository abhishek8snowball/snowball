const BrandCategory = require("../../models/BrandCategory");
const PerplexityService = require("../../utils/perplexityService");

// Initialize Perplexity service
const perplexityService = new PerplexityService();

exports.extractCategories = async (domain) => {
  // Get domain information from Perplexity API
  let domainInfo = '';
  
  try {
    console.log(`🔍 Getting domain information from Perplexity for: ${domain}`);
    domainInfo = await perplexityService.getDomainInfo(domain);
    console.log(`Successfully retrieved domain info from Perplexity`);
    console.log("Domain info:", domainInfo);
  } catch (error) {
    console.error(`Failed to get domain info from Perplexity for ${domain}:`, error.message);
    domainInfo = `Information about ${domain} - a business website offering various services and solutions.`;
  }

  const catPrompt = `You are a data extraction engine that identifies a company's main customer-facing business categories based on the text provided.

Website: ${domain}
Domain Information: ${domainInfo}

Instructions:
- From the domain information, identify the main business categories the company offers (products, services, or solutions).
- Use terms from the domain info when useful, or generalize slightly for clarity.
- Avoid vague, internal, or technical terms that are not customer-facing.

Output:
Return a JSON array of 4–6 category names with no explanation or extra formatting.`;
  // Use OpenAI API for category extraction
  const OpenAI = require('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  console.log("🔑 Checking OpenAI API key...");
  console.log("🔑 API Key exists:", !!process.env.OPENAI_API_KEY);
  
  if (!process.env.OPENAI_API_KEY) {
    console.log("⚠️ OpenAI API key not found, using fallback categories");
    return [
      "Business Solutions",
      "Digital Services", 
      "Technology Platform",
      "Professional Services"
    ];
  }
  
  try {
    console.log("🔍 Making OpenAI API request...");
    const catResp = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: 'user', content: catPrompt }],
      max_tokens: 200,
      temperature: 0.1
    });
    
    console.log("✅ OpenAI API response received");
    console.log("OpenAI catResp:", catResp.choices[0].message.content);
    
    let categories = [];
    try {
      categories = JSON.parse(catResp.choices[0].message.content);
    } catch (e) {
      console.error("Failed to parse categories JSON:", catResp.choices[0].message.content);
      categories = catResp.choices[0].message.content.match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, "")) || [];
    }
    return categories.slice(0, 4);
    
  } catch (error) {
    console.error("❌ OpenAI API error:", error.message);
    
    // Fallback to default categories based on domain
    console.log("🔄 Using fallback categories...");
    const fallbackCategories = [
      "Business Solutions",
      "Digital Services", 
      "Technology Platform",
      "Professional Services"
    ];
    
    return fallbackCategories;
  }
};

exports.saveCategories = async (brand, categories) => {
  const BrandCategory = require("../../models/BrandCategory");
  const catDocs = [];
  for (const cat of categories) {
    let catDoc = await BrandCategory.create({ brandId: brand._id, categoryName: cat });
    catDocs.push(catDoc);
    console.log("BrandCategory created:", catDoc);
  }
  return catDocs;
};