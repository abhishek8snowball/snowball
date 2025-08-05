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

  async getLongTailKeywords(domainUrl, category) {
    try {
      console.log(`🔍 Fetching long-tail keywords from Perplexity for: ${domainUrl} in ${category}`);
      console.log(`🔑 API Key exists:`, !!this.apiKey);
      console.log(`🔗 Base URL:`, this.baseURL);
      
      if (!this.apiKey) {
        console.warn('⚠️ Perplexity API key not found, using fallback');
        return [
          `${category} solutions`,
          `best ${category} services`,
          `${category} comparison`,
          `${category} alternatives`,
          `${category} reviews`
        ];
      }

             const requestBody = {
         model: 'sonar-pro',
         messages: [
           {
             role: 'user',
             content: `Please suggest 10 long-tail keywords for ${domainUrl} in the ${category} category. These should be specific search terms that users might use when looking for services like what ${domainUrl} offers. Return the results as a JSON array of strings. Additionally, provide a "People Also Search For" and "People Also Ask" section, just like those on Google. Use current data and show both sections as structured JSON arrays based on real or real-sounding example data.
`
           }
         ],
         max_tokens: 300,
         temperature: 0.1
       };

      console.log(`📤 Sending request to Perplexity:`, JSON.stringify(requestBody, null, 2));

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      console.log(`📥 Perplexity response status:`, response.status);
      console.log(`📥 Perplexity response data:`, JSON.stringify(response.data, null, 2));

      const content = response.data.choices[0].message.content;
      let keywords = [];
      
      // Simple approach: Extract all quoted strings from the response
      const quotedStrings = content.match(/"([^"]+)"/g);
      if (quotedStrings) {
        keywords = quotedStrings.map(s => s.replace(/"/g, "")).slice(0, 10);
        console.log(`✅ Extracted ${keywords.length} keywords directly from response`);
      } else {
        console.log(`⚠️ No quoted strings found in response, using fallback`);
        keywords = [
          `${category} solutions`,
          `best ${category} services`,
          `${category} comparison`,
          `${category} alternatives`,
          `${category} reviews`
        ];
      }

      console.log(`✅ Perplexity keywords received for ${domainUrl} in ${category}:`, keywords.length);
      return keywords.slice(0, 10);

    } catch (error) {
      console.error(`❌ Perplexity API error for keywords:`, error.message);
      console.error(`❌ Error details:`, error.response?.data || error.code || 'No additional details');
      console.error(`❌ Error status:`, error.response?.status);
      
      // Fallback keywords
      return [
        `${category} solutions`,
        `best ${category} services`,
        `${category} comparison`,
        `${category} alternatives`,
        `${category} reviews`,
        `${category} pricing`,
        `${category} features`,
        `${category} benefits`,
        `${category} pros and cons`,
        `${category} vs competitors`
      ];
    }
  }
}

module.exports = PerplexityService; 