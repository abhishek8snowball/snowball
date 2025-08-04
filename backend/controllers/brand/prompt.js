const CategorySearchPrompt = require("../../models/CategorySearchPrompt");
const { getCompetitorsFromGoogle } = require("../../utils/competitorDiscovery");

// Helper function for location-specific competitor fallbacks
function getLocationSpecificFallback(location, domain) {
  const domainLower = domain.toLowerCase();
  
  const locationCompetitors = {
    'India': {
      'seo': ['SEMrush India', 'Ahrefs India', 'DigiVogue', 'iProspect India', 'WATConsult'],
      'tech': ['Infosys', 'TCS', 'Wipro', 'HCL Technologies', 'Tech Mahindra'],
      'default': ['Local Leader India', 'Regional Player India', 'Market Competitor India', 'Indian Brand', 'Domestic Rival']
    },
    'United Kingdom': {
      'seo': ['Moz UK', 'DeepCrawl', 'Screaming Frog', 'BrightLocal', 'SearchMetrics'],
      'tech': ['Arm Holdings', 'Sage Group', 'Aveva Group', 'Micro Focus', 'Auto Trader'],
      'default': ['UK Market Leader', 'British Competitor', 'Regional Player UK', 'Industry Rival UK', 'Local Brand UK']
    },
    'Canada': {
      'seo': ['Search Engine People', 'NetGain SEO', 'SEO.ca', 'Boostability Canada', 'Straight North Canada'],
      'tech': ['Shopify', 'BlackBerry', 'CGI Group', 'Open Text', 'Constellation Software'],
      'default': ['Canadian Leader', 'Maple Competitor', 'Regional Player Canada', 'Industry Rival CA', 'Local Brand Canada']
    },
    'Australia': {
      'seo': ['WebFX Australia', 'SEO Shark', 'Platinum SEO', 'Online Marketing Gurus', 'King Kong'],
      'tech': ['Atlassian', 'Canva', 'WiseTech Global', 'Afterpay', 'REA Group'],
      'default': ['Aussie Leader', 'Australian Competitor', 'Regional Player AU', 'Industry Rival AU', 'Local Brand Australia']
    },
    'Germany': {
      'seo': ['SISTRIX', 'XOVI', 'OnPage.org', 'Ryte', 'Searchmetrics'],
      'tech': ['SAP', 'Software AG', 'TeamViewer', 'Delivery Hero', 'Rocket Internet'],
      'default': ['German Leader', 'Deutsche Competitor', 'Regional Player DE', 'Industry Rival DE', 'Local Brand Germany']
    },
    'Singapore': {
      'seo': ['Impossible Marketing', 'MediaOne', 'OOm Singapore', 'First Page Digital', 'Sketch Corp'],
      'tech': ['Sea Limited', 'Grab', 'PropertyGuru', 'Razer', 'Circles.Life'],
      'default': ['Singapore Leader', 'Regional Competitor SG', 'ASEAN Player', 'Industry Rival SG', 'Local Brand Singapore']
    }
  };
  
  const countryData = locationCompetitors[location];
  if (!countryData) {
    return ['Global Leader', 'International Competitor', 'Market Player', 'Industry Rival', 'Regional Brand'];
  }
  
  // Match domain to industry
  if (domainLower.includes('seo') || domainLower.includes('marketing') || domainLower.includes('digital')) {
    return countryData.seo || countryData.default;
  } else if (domainLower.includes('tech') || domainLower.includes('software') || domainLower.includes('ai')) {
    return countryData.tech || countryData.default;
  }
  
  return countryData.default;
}

exports.generateAndSavePrompts = async (openai, catDocs, brand) => {
  console.log(`🔄 Starting prompt generation for ${catDocs.length} categories`);
  const prompts = [];
  for (const catDoc of catDocs) {
    console.log(`📝 Generating prompts for category: ${catDoc.categoryName} (${catDoc._id})`);

    // Try to fetch location-aware competitors dynamically
    let knownBrands = [];
    let brandLocation = 'global';
    
    try {
      // Detect brand location (simple version for prompt generation)
      const domain = brand.domain.toLowerCase();
      if (domain.endsWith('.in')) brandLocation = 'India';
      else if (domain.endsWith('.uk')) brandLocation = 'United Kingdom';  
      else if (domain.endsWith('.ca')) brandLocation = 'Canada';
      else if (domain.endsWith('.au')) brandLocation = 'Australia';
      else if (domain.endsWith('.de')) brandLocation = 'Germany';
      else if (domain.endsWith('.sg')) brandLocation = 'Singapore';
      
      // First try with location-specific brand search
      const locationQuery = brandLocation !== 'global' ? `${brand.brandName} competitors in ${brandLocation}` : brand.brandName;
      knownBrands = await getCompetitorsFromGoogle(locationQuery);
      
      if (!knownBrands || knownBrands.length === 0) {
        // Fallback to location-specific category search
        const categoryQuery = brandLocation !== 'global' ? `${catDoc.categoryName} companies in ${brandLocation}` : catDoc.categoryName;
        knownBrands = await getCompetitorsFromGoogle(categoryQuery);
      }
      
      if (!knownBrands || knownBrands.length === 0) {
        // Last resort: Use location and domain-specific fallback
        knownBrands = getLocationSpecificFallback(brandLocation, brand.domain);
      }
    } catch (err) {
      console.error('Error fetching location-aware competitors, using fallback:', err.message);
      knownBrands = getLocationSpecificFallback(brandLocation, brand.domain);
    }

    // Ensure we have at least 3 competitors
    if (knownBrands.length < 3) {
      console.log(`⚠️ Only ${knownBrands.length} competitors found, adding more fallback competitors`);
      const additionalCompetitors = getAdditionalFallbackCompetitors(brand.domain, catDoc.categoryName);
      knownBrands = [...new Set([...knownBrands, ...additionalCompetitors])].slice(0, 8);
    }

    console.log(`✅ Using ${knownBrands.length} competitors for prompts:`, knownBrands);
    const promptGen = `You are helping a digital marketing researcher generate realistic, user-like questions related to the brand domain ${brand.domain}, brand name ${brand.brandName}, and the category: ${catDoc.categoryName}.

Generate 5 natural, topical user questions that could realistically be asked to ChatGPT. These questions should be framed so that responses would naturally mention ${brand.brandName} alongside its popular competitors.

Popular competitors include: ${knownBrands.join(', ')}.

Guidelines:
- Use natural, conversational phrasing reflecting genuine user curiosity (e.g., "What are the best…", "Which platforms…").
- Cover themes like comparisons, alternatives, recommendations, trending tools, and value-for-money.
- Do NOT mention the brand name in the questions themselves.
- Structure questions in the style commonly found in topic-based research or FAQs.
- Create questions that lead naturally to mentioning these brands in answers.

Format: Output only a JSON array of 5 strings.`;


    try {
      const promptResp = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: promptGen }],
        max_tokens: 300,
      });
      console.log("OpenAI promptResp:", promptResp.choices[0].message.content);
      let promptArr = [];
      try {
        promptArr = JSON.parse(promptResp.choices[0].message.content);
      } catch (e) {
        console.error("Failed to parse prompts JSON:", promptResp.choices[0].message.content);
        promptArr = promptResp.choices[0].message.content.match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, "")) || [];
      }
      promptArr = promptArr.slice(0, 5);
      console.log(`📋 Generated ${promptArr.length} prompts for category ${catDoc.categoryName}`);
      for (const p of promptArr) {
        const promptText = typeof p === "string" ? p : p.query;
        console.log(`💾 Saving prompt: ${promptText.substring(0, 50)}...`);
        const promptDoc = await CategorySearchPrompt.create({ categoryId: catDoc._id, promptText });
        prompts.push({ promptDoc, catDoc });
        console.log("✅ CategorySearchPrompt created:", promptDoc._id);
      }
    } catch (error) {
      console.error(`❌ Error generating prompts for category ${catDoc.categoryName}:`, error);
    }
  }
  console.log(`🎉 Prompt generation complete. Created ${prompts.length} prompts total.`);
  return prompts;
};

// Add function to get additional fallback competitors
function getAdditionalFallbackCompetitors(domain, categoryName) {
  const domainLower = domain.toLowerCase();
  const categoryLower = categoryName.toLowerCase();
  
  // Industry-specific additional competitors
  const additionalCompetitors = {
    'seo': ['Yoast SEO', 'RankMath', 'All in One SEO', 'SEOPress', 'The SEO Framework'],
    'marketing': ['Klaviyo', 'Brevo', 'Drip', 'ConvertKit', 'ActiveCampaign'],
    'analytics': ['Google Analytics', 'Mixpanel', 'Amplitude', 'Hotjar', 'Crazy Egg'],
    'social': ['Buffer', 'Hootsuite', 'Sprout Social', 'Later', 'Planoly'],
    'email': ['Mailchimp', 'Constant Contact', 'GetResponse', 'AWeber', 'ConvertKit'],
    'crm': ['HubSpot', 'Salesforce', 'Pipedrive', 'Zoho CRM', 'Freshsales'],
    'project': ['Asana', 'Trello', 'Monday.com', 'ClickUp', 'Notion'],
    'design': ['Canva', 'Figma', 'Adobe Creative Cloud', 'Sketch', 'InVision']
  };
  
  // Determine industry based on domain and category
  let industry = 'general';
  for (const [key, competitors] of Object.entries(additionalCompetitors)) {
    if (domainLower.includes(key) || categoryLower.includes(key)) {
      industry = key;
      break;
    }
  }
  
  return additionalCompetitors[industry] || additionalCompetitors['seo'];
}