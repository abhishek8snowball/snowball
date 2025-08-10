const axios = require('axios');
const TokenCostLogger = require('./tokenCostLogger');

class BlogExtractionService {
  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY;
    this.baseURL = 'https://api.perplexity.ai';
    this.tokenLogger = new TokenCostLogger();
  }

  async extractTopBlogs(domain) {
    try {
      console.log(`🔍 Extracting top 10 blogs from: ${domain}`);

      if (!this.apiKey) {
        console.error('❌ Perplexity API key not found');
        return [];
      }

      const prompt = `Extract exactly 10 most important blog posts or articles from ${domain}. 
      
Focus on:
- High-quality, informative content
- Blog posts that represent the brand's expertise
- Content with good engagement potential
- Articles that are well-written and valuable
- Most popular and trending blog posts

Return ONLY a JSON array of URLs in this exact format:
["https://domain.com/blog1", "https://domain.com/blog2", "https://domain.com/blog3", "https://domain.com/blog4", "https://domain.com/blog5", "https://domain.com/blog6", "https://domain.com/blog7", "https://domain.com/blog8", "https://domain.com/blog9", "https://domain.com/blog10"]

Make sure to return exactly 10 URLs. Do not include any explanations or additional text, just the JSON array.`;

      const requestBody = {
        model: 'sonar-pro',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.1
      };

      console.log('📡 Making Perplexity API call for blog extraction...');
      
      const response = await axios.post(`${this.baseURL}/chat/completions`, requestBody, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      console.log('✅ Perplexity API response received');
      
      const content = response.data.choices[0].message.content;
      
      // Log token usage and cost
      this.tokenLogger.logPerplexityCall(
        'Blog URL Extraction',
        prompt,
        content,
        'sonar-pro'
      );
      
      console.log('📝 Raw response:', content);

      // Extract URLs from the response
      let blogUrls = [];
      
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          blogUrls = parsed;
        }
      } catch (parseError) {
        console.log('⚠️ JSON parsing failed, extracting URLs with regex');
        
        // Fallback: Extract URLs using regex
        const urlRegex = /https?:\/\/[^\s"']+/g;
        const matches = content.match(urlRegex);
        if (matches) {
          blogUrls = matches.slice(0, 10); // Limit to 10
        }
      }

      // Clean and validate URLs
      blogUrls = blogUrls
        .filter(url => url && typeof url === 'string')
        .map(url => url.trim())
        .filter(url => url.startsWith('http'))
        .slice(0, 10); // Ensure max 10

      console.log(`✅ Extracted ${blogUrls.length} blog URLs:`, blogUrls);
      return blogUrls;

    } catch (error) {
      console.error('❌ Error extracting blogs:', error.message);
      console.error('❌ Error details:', error.response?.data || error.code || 'No additional details');
      console.error('❌ Error status:', error.response?.status);
      
      // Return empty array on error
      return [];
    }
  }
}

module.exports = BlogExtractionService; 