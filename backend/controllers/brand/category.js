const BrandCategory = require("../../models/BrandCategory");
const WebsiteScraper = require("./websiteScraper");
const axios = require('axios');
const cheerio = require('cheerio');

// Helper function to extract detailed page content for category analysis
async function extractPageContent(url) {
  try {
    console.log(`📄 Extracting detailed content from: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    
    // Extract navigation menu items (often contain service categories)
    const navItems = [];
    $('nav a, .nav a, .menu a, .navigation a, [class*="nav"] a, [class*="menu"] a').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 2 && text.length < 50) {
        navItems.push(text);
      }
    });
    
    // Extract main headings (h1, h2, h3) that might indicate services
    const headings = [];
    $('h1, h2, h3').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 3 && text.length < 100) {
        headings.push(text);
      }
    });
    
    // Extract service/product related text from common class names
    const serviceTexts = [];
    $('[class*="service"], [class*="product"], [class*="offer"], [class*="solution"], [class*="feature"]').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 10 && text.length < 200) {
        serviceTexts.push(text.substring(0, 100));
      }
    });
    
    // Extract button/link text that might indicate services
    const actionTexts = [];
    $('button, .btn, .cta, [class*="button"]').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 3 && text.length < 50) {
        actionTexts.push(text);
      }
    });
    
    return `
Navigation Items: ${navItems.slice(0, 10).join(', ')}
Main Headings: ${headings.slice(0, 5).join(' | ')}
Service Text Snippets: ${serviceTexts.slice(0, 3).join(' | ')}
Action Buttons: ${actionTexts.slice(0, 5).join(', ')}`;
    
  } catch (error) {
    console.log(`⚠️ Could not extract detailed content: ${error.message}`);
    return 'Detailed content extraction failed.';
  }
}

exports.extractCategories = async (domain) => {
  let websiteContent = '';
  let scrapedData = null;
  
  // First, try to scrape the actual website content
  try {
    console.log(`🌐 Scraping website content for category extraction: ${domain}`);
    const scraper = new WebsiteScraper();
    
    // Try both http and https
    let url = domain.startsWith('http') ? domain : `https://${domain}`;
    
    try {
      scrapedData = await scraper.scrapeWebsite(url);
    } catch (httpsError) {
      console.log(`❌ HTTPS failed, trying HTTP for ${domain}`);
      url = `http://${domain}`;
      scrapedData = await scraper.scrapeWebsite(url);
    }
    
    await scraper.close();
    
    // Extract more detailed content for better category analysis
    const additionalContent = await extractPageContent(url);
    
    websiteContent = `
Title: ${scrapedData.title}
Meta Description: ${scrapedData.metaDescription}
Meta Keywords: ${scrapedData.metaKeywords}
${additionalContent}
Word Count: ${scrapedData.wordCount}
`;
    
    console.log(`✅ Successfully scraped website content: ${scrapedData.title}`);
    
  } catch (error) {
    console.error(`❌ Failed to scrape website ${domain}:`, error.message);
    websiteContent = `Website scraping failed for ${domain}. Using domain name only.`;
  }

  const catPrompt = `You are a structured data extraction engine that identifies a company's key customer-facing business categories from real website content.

Website: ${domain}
Content Analysis: ${websiteContent}

Extraction Rules:

- Focus on tangible products, named services, branded solutions, or clearly marketed offerings.
- Categories should reflect what the company provides to customers — these can include solutions, services, or product types.
- Use wording similar to the website when practical, but generalize moderately if it improves clarity or grouping.
- Avoid vague, overly broad, or purely technological terms unless they represent a named service or offering.
- Do not include internal tools, company values, or backend technologies unless they are part of a marketed offering.

Output:
Return a JSON array of 4–6 business categories (no explanation or extra formatting).`;

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