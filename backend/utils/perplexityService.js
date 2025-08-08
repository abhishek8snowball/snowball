const axios = require('axios');

class PerplexityService {
  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY;
    this.baseURL = 'https://api.perplexity.ai';
  }

  async getDomainInfo(domainUrl) {
    try {
      console.log(`🔍 Fetching domain info from Perplexity for: ${domainUrl}`);
      
      if (!this.apiKey) {
        console.warn('⚠️ Perplexity API key not found, using fallback');
        return `Information about ${domainUrl} - a business website offering various services and solutions.`;
      }

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'sonar-pro',
          messages: [
            {
              role: 'user',
              content: `What does ${domainUrl} do? Provide a concise overview of their business, services, and main offerings.`
            }
          ],
          max_tokens: 500,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const domainInfo = response.data.choices[0].message.content;
      console.log(`✅ Perplexity response received for ${domainUrl}`);
      return domainInfo;

    } catch (error) {
      console.error(`❌ Perplexity API error for ${domainUrl}:`, error.message);
      
      // Fallback response
      return `Information about ${domainUrl} - a business website offering various services and solutions.`;
    }
  }
}

module.exports = PerplexityService; 