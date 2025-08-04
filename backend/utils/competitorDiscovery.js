const axios = require('axios');
const OpenAI = require('openai');

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

/**
 * Fetches a list of competitors for a given brand/category using SerpAPI (Google Search)
 * @param {string} brandName - The brand or category name to search competitors for
 * @returns {Promise<string[]>} - Array of competitor names
 */
async function getCompetitorsFromGoogle(brandName) {
  if (!SERPAPI_KEY) {
    console.log('⚠️ SERPAPI_KEY not set, using AI-powered competitor discovery');
    return getCompetitorsFromAI(brandName);
  }
  
  const query = `top competitors of ${brandName}`;
  const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}&engine=google`;

  try {
    const response = await axios.get(url);
    const competitors = new Set();

    // Extract from 'related_questions'
    if (response.data.related_questions) {
      response.data.related_questions.forEach(q => {
        if (q.question) {
          const extracted = extractBrandNamesFromText(q.question);
          extracted.forEach(brand => competitors.add(brand));
        }
      });
    }
    
    // Extract from 'organic_results' titles
    if (response.data.organic_results) {
      response.data.organic_results.forEach(res => {
        if (res.title) {
          const extracted = extractBrandNamesFromText(res.title);
          extracted.forEach(brand => competitors.add(brand));
        }
        if (res.snippet) {
          const extracted = extractBrandNamesFromText(res.snippet);
          extracted.forEach(brand => competitors.add(brand));
        }
      });
    }
    
    // Extract from 'people_also_search_for' if available
    if (response.data.people_also_search_for) {
      response.data.people_also_search_for.forEach(item => {
        if (item.title) {
          const extracted = extractBrandNamesFromText(item.title);
          extracted.forEach(brand => competitors.add(brand));
        }
      });
    }
    
    // Return top 10 unique competitors
    const result = Array.from(competitors).slice(0, 10);
    console.log(`✅ Found ${result.length} competitors from Google search:`, result);
    return result;
  } catch (error) {
    console.error('❌ Error fetching competitors from SerpAPI:', error.message);
    console.log('🔄 Using AI-powered competitor discovery');
    return getCompetitorsFromAI(brandName);
  }
}

/**
 * Get competitors using AI analysis
 * @param {string} brandName - The brand name to find competitors for
 * @returns {Promise<string[]>} - Array of competitor names
 */
async function getCompetitorsFromAI(brandName) {
  if (!OPENAI_API_KEY) {
    console.log('⚠️ OPENAI_API_KEY not set, using basic fallback');
    return getBasicFallbackCompetitors(brandName);
  }

  try {
    console.log(`🤖 Using AI to discover competitors for: ${brandName}`);
    
    const prompt = `You are a business analyst specializing in competitive intelligence. 

I need you to identify the top 8-10 direct competitors for the brand "${brandName}". 

Please provide:
1. Direct competitors in the same market/industry
2. Companies that offer similar products/services
3. Brands that customers would consider as alternatives

Requirements:
- Return ONLY the brand names (no descriptions, no explanations)
- Focus on well-known, established competitors
- Include both global and regional players if applicable
- Return the results as a JSON array of strings
- Maximum 10 competitors

Example format:
["Competitor 1", "Competitor 2", "Competitor 3"]

For the brand "${brandName}", who are the main competitors?`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a competitive intelligence expert. Provide accurate, well-researched competitor lists in JSON format only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const response = completion.choices[0].message.content.trim();
    
    // Try to parse JSON response
    try {
      const competitors = JSON.parse(response);
      if (Array.isArray(competitors)) {
        console.log(`✅ AI discovered ${competitors.length} competitors:`, competitors);
        return competitors.slice(0, 10); // Ensure max 10
      }
    } catch (parseError) {
      console.log('⚠️ AI response not in JSON format, extracting brand names manually');
      return extractBrandNamesFromText(response);
    }

  } catch (error) {
    console.error('❌ Error getting competitors from AI:', error.message);
    console.log('🔄 Using basic fallback competitors');
    return getBasicFallbackCompetitors(brandName);
  }
}

/**
 * Extract brand names from AI text response
 * @param {string} text - AI response text
 * @returns {string[]} - Array of extracted brand names
 */
function extractBrandNamesFromText(text) {
  if (!text) return [];
  
  const brands = new Set();
  
  // Enhanced patterns for brand extraction
  const patterns = [
    // Company names with common suffixes
    /\b([A-Z][a-z]+ (?:Inc|Corp|Corporation|Company|Co|LLC|Ltd|Limited|Group|Solutions|Systems|Technologies|Tech|Software|Services|Consulting|Partners|Associates|Enterprises|Industries|International|Global|Worldwide|Digital|Online|Web|Internet|Media|Marketing|Advertising|Agency|Studio|Lab|Labs|Works|Factory|Hub|Center|Network|Platform|Marketplace|Store|Shop|Retail|E-commerce|Commerce))\b/g,
    // Two-word capitalized sequences (likely brand names)
    /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g,
    // Three-word capitalized sequences
    /\b([A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+)\b/g,
    // Single capitalized words that might be brands (longer than 3 chars)
    /\b([A-Z][a-z]{3,})\b/g,
    // Domain names
    /\b([A-Za-z0-9-]+\.[A-Za-z]{2,})\b/g
  ];
  
  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleaned = match.trim();
        if (cleaned && cleaned.length > 2 && !isCommonWord(cleaned)) {
          brands.add(cleaned);
        }
      });
    }
  });
  
  const result = Array.from(brands);
  console.log(`✅ Extracted ${result.length} brand names from AI response:`, result);
  return result;
}

/**
 * Check if a word is a common word that shouldn't be considered a brand
 * @param {string} word - Word to check
 * @returns {boolean} - True if it's a common word
 */
function isCommonWord(word) {
  const commonWords = [
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'between', 'among', 'within', 'without',
    'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall',
    'best', 'top', 'leading', 'popular', 'recommended', 'trusted', 'reliable',
    'alternative', 'competitor', 'similar', 'compare', 'vs', 'versus',
    'review', 'rating', 'score', 'rank', 'ranking', 'list', 'choice',
    'preferred', 'favorite', 'go-to', 'primary', 'main', 'major'
  ];
  
  return commonWords.includes(word.toLowerCase());
}

/**
 * Basic fallback competitors (minimal, only used if AI fails)
 * @param {string} brandName - The brand name to find competitors for
 * @returns {string[]} - Array of basic fallback competitors
 */
function getBasicFallbackCompetitors(brandName) {
  console.log(`🔄 Using basic fallback competitors for: ${brandName}`);
  
  // Very basic fallback - just a few well-known companies
  const basicCompetitors = [
    'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Uber', 'Airbnb'
  ];
  
  return basicCompetitors.slice(0, 5);
}

module.exports = { getCompetitorsFromGoogle };