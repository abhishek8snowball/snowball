const AICompetitorMention = require("../../models/AICompetitorMention");
const TokenCostLogger = require("../../utils/tokenCostLogger");
const axios = require('axios');

// Initialize token logger
const tokenLogger = new TokenCostLogger();

// Helper function to detect location from domain and content
async function detectBrandLocation(domain, websiteContent) {
  const locationIndicators = {
    // Country-specific TLDs
    '.uk': 'United Kingdom',
    '.ca': 'Canada', 
    '.au': 'Australia',
    '.de': 'Germany',
    '.fr': 'France',
    '.in': 'India',
    '.jp': 'Japan',
    '.cn': 'China',
    '.br': 'Brazil',
    '.mx': 'Mexico',
    '.sg': 'Singapore',
    '.ae': 'UAE',
    '.nl': 'Netherlands',
    '.se': 'Sweden',
    '.dk': 'Denmark',
    '.no': 'Norway',
    '.fi': 'Finland',
    '.it': 'Italy',
    '.es': 'Spain',
    '.pl': 'Poland',
    '.ru': 'Russia',
    '.kr': 'South Korea',
    '.za': 'South Africa',
    '.nz': 'New Zealand',
    '.ch': 'Switzerland',
    '.at': 'Austria',
    '.be': 'Belgium',
    '.ie': 'Ireland'
  };

  // Check domain TLD first
  for (const [tld, country] of Object.entries(locationIndicators)) {
    if (domain.endsWith(tld)) {
      console.log(`🌍 Location detected from TLD: ${country}`);
      return country;
    }
  }

  // Check for location keywords in content
  if (websiteContent) {
    const content = websiteContent.toLowerCase();
    const locationKeywords = {
      'india': ['india', 'indian', 'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'pune', 'kolkata', 'gurgaon', 'noida'],
      'united states': ['usa', 'america', 'american', 'new york', 'california', 'texas', 'florida', 'chicago', 'boston', 'seattle', 'san francisco', 'los angeles'],
      'united kingdom': ['uk', 'britain', 'british', 'london', 'manchester', 'birmingham', 'glasgow', 'liverpool', 'leeds'],
      'canada': ['canada', 'canadian', 'toronto', 'vancouver', 'montreal', 'ottawa', 'calgary', 'edmonton'],
      'australia': ['australia', 'australian', 'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide'],
      'germany': ['germany', 'german', 'berlin', 'munich', 'hamburg', 'cologne', 'frankfurt'],
      'france': ['france', 'french', 'paris', 'lyon', 'marseille', 'toulouse', 'nice'],
      'singapore': ['singapore', 'singaporean'],
      'uae': ['uae', 'dubai', 'abu dhabi', 'emirates', 'sharjah'],
      'netherlands': ['netherlands', 'dutch', 'amsterdam', 'rotterdam', 'the hague'],
      'sweden': ['sweden', 'swedish', 'stockholm', 'gothenburg', 'malmö'],
      'denmark': ['denmark', 'danish', 'copenhagen', 'aarhus'],
      'norway': ['norway', 'norwegian', 'oslo', 'bergen'],
      'finland': ['finland', 'finnish', 'helsinki', 'tampere']
    };

    for (const [country, keywords] of Object.entries(locationKeywords)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        console.log(`🌍 Location detected from content: ${country}`);
        return country;
      }
    }
  }

  // Try IP-based geolocation for domain
  try {
    const geoResponse = await axios.get(`http://ip-api.com/json/${domain}`, { timeout: 5000 });
    if (geoResponse.data && geoResponse.data.country) {
      console.log(`🌍 Location detected from IP: ${geoResponse.data.country}`);
      return geoResponse.data.country;
    }
  } catch (error) {
    console.log(`⚠️ IP geolocation failed: ${error.message}`);
  }

  console.log(`🌍 No specific location detected, defaulting to global`);
  return 'global';
}

// Helper function to provide location-based fallback competitors
function getLocationBasedFallback(location, domain) {
  const domainLower = domain.toLowerCase();
  
  // Location-specific competitor databases
  const locationCompetitors = {
    'india': {
      'seo': ['SEMrush India', 'Ahrefs India', 'DigiVogue', 'iProspect India', 'WATConsult'],
      'ecommerce': ['Flipkart', 'Amazon India', 'Myntra', 'Snapdeal', 'BigBasket'],
      'fintech': ['Paytm', 'PhonePe', 'Razorpay', 'ByjusCard', 'CRED'],
      'tech': ['Infosys', 'TCS', 'Wipro', 'HCL Technologies', 'Tech Mahindra'],
      'default': ['Local Competitor India 1', 'Regional Player India 2', 'Market Leader India 3', 'Indian Rival 4', 'Domestic Brand 5']
    },
    'united states': {
      'seo': ['Moz', 'BrightEdge', 'Conductor', 'Screaming Frog', 'DeepCrawl'],
      'ecommerce': ['Amazon', 'eBay', 'Walmart', 'Target', 'Best Buy'],
      'fintech': ['PayPal', 'Square', 'Stripe', 'Intuit', 'Robinhood'],
      'tech': ['Google', 'Microsoft', 'Apple', 'Meta', 'Amazon'],
      'default': ['US Market Leader 1', 'American Competitor 2', 'Regional Player 3', 'Industry Rival 4', 'Domestic Brand 5']
    },
    'united kingdom': {
      'seo': ['Moz UK', 'DeepCrawl', 'Screaming Frog', 'BrightLocal', 'SearchMetrics'],
      'ecommerce': ['Amazon UK', 'ASOS', 'Next', 'John Lewis', 'Argos'],
      'fintech': ['Monzo', 'Revolut', 'Starling Bank', 'Wise', 'GoCardless'],
      'tech': ['Arm Holdings', 'Sage Group', 'Aveva Group', 'Micro Focus', 'Auto Trader'],
      'default': ['UK Market Leader 1', 'British Competitor 2', 'Regional Player 3', 'Industry Rival 4', 'Local Brand 5']
    },
    'canada': {
      'seo': ['Moz Canada', 'BrightLocal Canada', 'Search Engine People', 'NetGain SEO', 'SEO.ca'],
      'ecommerce': ['Amazon Canada', 'Walmart Canada', 'Canadian Tire', 'Hudson Bay', 'Costco Canada'],
      'fintech': ['PayBright', 'Mogo', 'Paymi', 'Interac', 'TD Bank Digital'],
      'tech': ['Shopify', 'BlackBerry', 'CGI Group', 'Open Text', 'Constellation Software'],
      'default': ['Canadian Leader 1', 'Maple Competitor 2', 'Regional Player 3', 'Industry Rival 4', 'Local Brand 5']
    },
    'australia': {
      'seo': ['Moz Australia', 'WebFX Australia', 'SEO Shark', 'Platinum SEO', 'Online Marketing Gurus'],
      'ecommerce': ['Amazon Australia', 'eBay Australia', 'Kogan', 'JB Hi-Fi', 'Harvey Norman'],
      'fintech': ['Afterpay', 'Zip Co', 'Tyro Payments', 'EML Payments', 'Xero'],
      'tech': ['Atlassian', 'Canva', 'WiseTech Global', 'Afterpay', 'REA Group'],
      'default': ['Aussie Leader 1', 'Australian Competitor 2', 'Regional Player 3', 'Industry Rival 4', 'Local Brand 5']
    },
    'germany': {
      'seo': ['SISTRIX', 'XOVI', 'OnPage.org', 'Ryte', 'Searchmetrics'],
      'ecommerce': ['Amazon Germany', 'Otto', 'Zalando', 'MediaMarkt', 'Saturn'],
      'fintech': ['N26', 'Wirecard', 'Klarna Germany', 'PayPal Germany', 'Adyen'],
      'tech': ['SAP', 'Software AG', 'TeamViewer', 'Delivery Hero', 'Rocket Internet'],
      'default': ['German Leader 1', 'Deutsche Competitor 2', 'Regional Player 3', 'Industry Rival 4', 'Local Brand 5']
    },
    'singapore': {
      'seo': ['Impossible Marketing', 'MediaOne', 'OOm Singapore', 'First Page Digital', 'Sketch Corp'],
      'ecommerce': ['Shopee', 'Lazada', 'Qoo10', 'RedMart', 'Carousell'],
      'fintech': ['Grab Financial', 'DBS Bank Digital', 'OCBC Digital', 'Revolut Singapore', 'YouTrip'],
      'tech': ['Sea Limited', 'Grab', 'PropertyGuru', 'Razer', 'Circles.Life'],
      'default': ['Singapore Leader 1', 'Regional Competitor 2', 'ASEAN Player 3', 'Industry Rival 4', 'Local Brand 5']
    }
  };
  
  const countryData = locationCompetitors[location.toLowerCase()];
  if (!countryData) {
    return ['Regional Leader 1', 'Local Competitor 2', 'Market Player 3', 'Industry Rival 4', 'Domestic Brand 5'];
  }
  
  // Try to match domain to industry
  if (domainLower.includes('seo') || domainLower.includes('marketing') || domainLower.includes('digital')) {
    return countryData.seo || countryData.default;
  } else if (domainLower.includes('shop') || domainLower.includes('ecommerce') || domainLower.includes('store')) {
    return countryData.ecommerce || countryData.default;
  } else if (domainLower.includes('pay') || domainLower.includes('finance') || domainLower.includes('fintech')) {
    return countryData.fintech || countryData.default;
  } else if (domainLower.includes('tech') || domainLower.includes('software') || domainLower.includes('ai')) {
    return countryData.tech || countryData.default;
  }
  
  return countryData.default;
}

exports.extractCompetitorsWithOpenAI = async (openai, brand, websiteContent = null) => {
  console.log("Extracting location-based competitors for brand:", brand.brandName);
  
  // Get website content if not provided
  let contentContext = '';
  if (!websiteContent && brand.domain) {
    try {
      const WebsiteScraper = require('./websiteScraper');
      const scraper = new WebsiteScraper();
      const url = brand.domain.startsWith('http') ? brand.domain : `https://${brand.domain}`;
      const scrapedData = await scraper.scrapeWebsite(url);
      await scraper.close();
      
      contentContext = `
Website Title: ${scrapedData.title}
Meta Description: ${scrapedData.metaDescription}
Meta Keywords: ${scrapedData.metaKeywords}`;
    } catch (error) {
      console.log(`⚠️ Could not scrape website for competitor analysis: ${error.message}`);
      contentContext = `Domain: ${brand.domain} (website content unavailable)`;
    }
  } else if (websiteContent) {
    contentContext = websiteContent;
  } else {
    contentContext = `Domain: ${brand.domain}`;
  }

  // Detect brand location
  const brandLocation = await detectBrandLocation(brand.domain, contentContext);
  
  const competitorPrompt = `Based on the following brand information, identify 5 real, direct competitors that operate in the same geographical region:

Brand: ${brand.brandName}
Domain: ${brand.domain}
Location: ${brandLocation}
${contentContext}

Identify competitors that:
- Offer similar products/services based on the website content
- Target the same market/industry in ${brandLocation}
- Are based in or primarily serve ${brandLocation} market
- Are real, existing companies (not generic names)
- Can be found through web search
- Have significant presence in ${brandLocation} region

${brandLocation !== 'global' ? `Focus on local/regional competitors in ${brandLocation} first, then include major international players that compete in this region.` : 'Include major global competitors in this industry.'}

Respond with ONLY a JSON array of competitor brand names. Use exact company names as they appear online:
["Exact Company Name 1", "Exact Company Name 2", "Exact Company Name 3"]

Do not include explanations or additional text, just the JSON array.`;

  try {
    const competitorResp = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: competitorPrompt }],
      max_tokens: 300,
      temperature: 0.5
    });
    
    const responseContent = competitorResp.choices[0].message.content;
    
    // Log token usage and cost for competitor extraction
    tokenLogger.logOpenAICall(
      'Competitor Extraction',
      competitorPrompt,
      responseContent,
      'gpt-3.5-turbo'
    );
    
    console.log("OpenAI competitor response:", responseContent);
    
    let competitors = [];
    try {
      competitors = JSON.parse(responseContent);
      console.log("Parsed competitors JSON:", competitors);
    } catch (e) {
      console.error("Failed to parse competitors JSON:", e);
      // Fallback: extract from text
      const content = responseContent;
      competitors = content.match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, "")) || [];
      console.log("Extracted competitors from text:", competitors);
    }

    // Validate and clean competitors
    competitors = competitors
      .filter(c => c && typeof c === 'string' && c.trim().length > 0)
      .map(c => c.trim())
      .slice(0, 5); // Limit to 5 competitors

    // If no competitors found, try a more intelligent fallback
    if (competitors.length === 0) {
      console.log("No competitors found, trying alternative extraction method");
      
      // Try to use location-aware competitor discovery
      try {
        const { getCompetitorsFromGoogle } = require("../../utils/competitorDiscovery");
        const locationQuery = brandLocation !== 'global' ? `${brand.brandName} competitors in ${brandLocation}` : brand.brandName;
        const categoryCompetitors = await getCompetitorsFromGoogle(locationQuery);
        
        if (categoryCompetitors && categoryCompetitors.length > 0) {
          competitors = categoryCompetitors.slice(0, 5);
          console.log("Found location-based competitors from Google search:", competitors);
        }
      } catch (error) {
        console.log("Failed to get competitors from Google search:", error.message);
      }
      
      // Location-aware final fallback
      if (competitors.length === 0) {
        console.log(`Using location-specific fallback competitors for ${brandLocation}`);
        competitors = getLocationBasedFallback(brandLocation, brand.domain);
      }
    }

    console.log("Final competitors list:", competitors);

    // Save each competitor as an AICompetitorMention
    for (const competitorName of competitors) {
      try {
        await AICompetitorMention.create({
          insightId: null, // Not linked to an insight, just direct competitor extraction
          competitorName,
          competitorDomain: null,
          mentionCount: 1,
          sentiment: "neutral"
        });
        console.log("Saved competitor:", competitorName);
      } catch (error) {
        console.error("Error saving competitor:", competitorName, error);
      }
    }

    return competitors;
  } catch (error) {
    console.error("Error in competitor extraction:", error);
    // Return domain-specific fallback competitors
    const domain = brand.domain.toLowerCase();
    
    if (domain.includes('google') || domain.includes('search')) {
      return ["Bing", "DuckDuckGo", "Yahoo", "Baidu", "Yandex"];
    } else if (domain.includes('amazon') || domain.includes('shop')) {
      return ["eBay", "Walmart", "Target", "Best Buy", "Newegg"];
    } else if (domain.includes('facebook') || domain.includes('social')) {
      return ["Twitter", "Instagram", "LinkedIn", "TikTok", "Snapchat"];
    } else if (domain.includes('netflix') || domain.includes('stream')) {
      return ["Disney+", "Hulu", "Amazon Prime", "HBO Max", "Peacock"];
    } else if (domain.includes('uber') || domain.includes('ride')) {
      return ["Lyft", "Taxi Services", "Public Transit", "Car Rental", "Bike Sharing"];
    } else {
      return ["Competitor A", "Competitor B", "Competitor C", "Competitor D", "Competitor E"];
    }
  }
};