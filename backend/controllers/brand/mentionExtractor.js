const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const CategoryPromptMention = require("../../models/CategoryPromptMention");
const PromptAIResponse = require("../../models/PromptAIResponse");
const CategorySearchPrompt = require("../../models/CategorySearchPrompt");
const TokenCostLogger = require("../../utils/tokenCostLogger");

// Initialize token logger
const tokenLogger = new TokenCostLogger();

class MentionExtractor {
  constructor() {
    this.extractionPrompt = `System: You are an entity extraction tool.

User: From the following text, extract all company or brand names mentioned. Only return a JSON array of strings, with no explanation. Example: ["Tesla", "Coca-Cola"]

Text:
<<< {RESPONSE_TEXT} >>>`;
  }

  /**
   * Extract company mentions from a single AI response
   */
  async extractMentionsFromResponse(responseText, promptId, categoryId, brandId, userId, responseId) {
    try {
      console.log(`🔍 Extracting mentions from response for prompt: ${promptId}`);
      
      // Prepare the extraction prompt
      const prompt = this.extractionPrompt.replace('{RESPONSE_TEXT}', responseText);
      
      // Call OpenAI for entity extraction
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.1
      });

      const responseContent = completion.choices[0].message.content;
      
      // Log token usage
      tokenLogger.logOpenAICall(
        'Mention Extraction',
        prompt,
        responseContent,
        'gpt-3.5-turbo'
      );

      // Parse the JSON response
      let companies = [];
      try {
        companies = JSON.parse(responseContent);
        if (!Array.isArray(companies)) {
          throw new Error('Response is not an array');
        }
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', responseContent);
        // Fallback: extract company names using regex patterns
        companies = this.extractCompaniesWithRegex(responseText);
      }

      console.log(`✅ Extracted ${companies.length} companies:`, companies);

      // Store mentions in database
      const mentions = [];
      for (const companyName of companies) {
        if (companyName && typeof companyName === 'string' && companyName.trim()) {
          const mention = await CategoryPromptMention.create({
            categoryId,
            promptId,
            companyName: companyName.trim(),
            responseId: responseId,
            brandId,
            userId,
            confidence: 1.0
          });
          mentions.push(mention);
        }
      }

      return mentions;

    } catch (error) {
      console.error('Error extracting mentions:', error.message);
      throw error;
    }
  }

  /**
   * Extract company names using regex patterns as fallback
   */
  extractCompaniesWithRegex(text) {
    const companies = [];
    
    // Common company patterns
    const patterns = [
      /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Inc|Corp|Corporation|LLC|Ltd|Limited|Company|Co|Group|Solutions|Systems|Technologies|Software|Services)\b/g,
      /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        companies.push(...matches);
      }
    }

    // Remove duplicates and filter out common words
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return [...new Set(companies)]
      .filter(company => 
        company.length > 2 && 
        !commonWords.includes(company.toLowerCase()) &&
        !/^\d+$/.test(company)
      )
      .slice(0, 10); // Limit to 10 companies
  }

  /**
   * Process all unprocessed AI responses for a specific brand
   */
  async processBrandResponses(brandId, userId) {
    try {
      console.log(`🔄 Processing brand responses for brand: ${brandId}`);
      
      // Get all unprocessed responses for this brand
      // First, try to find responses that have brandId set directly
      let unprocessedResponses = await PromptAIResponse.find({
        brandId: brandId,
        mentionsProcessed: false
      });

      console.log(`📊 Found ${unprocessedResponses.length} unprocessed responses with direct brandId`);

      // If no direct matches, try the aggregation approach for older data
      if (unprocessedResponses.length === 0) {
        console.log("🔍 No direct matches, trying aggregation for older data...");
        
        unprocessedResponses = await PromptAIResponse.aggregate([
          {
            $lookup: {
              from: 'categorysearchprompts',
              localField: 'promptId',
              foreignField: '_id',
              as: 'prompt'
            }
          },
          {
            $unwind: '$prompt'
          },
          {
            $match: {
              'prompt.brandId': brandId,
              mentionsProcessed: false
            }
          }
        ]);

        console.log(`📊 Found ${unprocessedResponses.length} unprocessed responses via aggregation`);
      }

      let totalMentions = 0;
      for (const response of unprocessedResponses) {
        try {
          // Handle both direct responses and aggregated responses
          const responseId = response._id;
          const responseText = response.responseText;
          const promptId = response.promptId;
          
          // Get the categoryId from the CategorySearchPrompt
          const CategorySearchPrompt = require("../../models/CategorySearchPrompt");
          const promptDoc = await CategorySearchPrompt.findById(promptId);
          
          if (!promptDoc || !promptDoc.categoryId) {
            console.log(`⚠️ Skipping response ${responseId}: No categoryId found in prompt ${promptId}`);
            continue;
          }
          
          const categoryId = promptDoc.categoryId;
          console.log(`🔍 Processing response ${responseId} for category: ${categoryId}`);

          const mentions = await this.extractMentionsFromResponse(
            responseText,
            promptId,
            categoryId,
            brandId,
            userId,
            responseId
          );

          // Update the response to mark it as processed
          await PromptAIResponse.findByIdAndUpdate(
            responseId,
            { 
              mentionsProcessed: true,
              brandId: brandId, // Ensure brandId is set
              userId: userId    // Ensure userId is set
            }
          );

          totalMentions += mentions.length;
          console.log(`✅ Processed response ${responseId}: ${mentions.length} mentions`);

        } catch (error) {
          console.error(`❌ Error processing response ${response._id}:`, error.message);
          // Continue with other responses
        }
      }

      console.log(`🎉 Brand processing complete. Total mentions: ${totalMentions}`);
      return totalMentions;

    } catch (error) {
      console.error('Error processing brand responses:', error.message);
      throw error;
    }
  }

  /**
   * Get all mentions for a specific company
   */
  async getCompanyMentions(companyName, brandId, userId) {
    try {
      console.log(`🔍 Getting mentions for company: ${companyName}`);
      
      const mentions = await CategoryPromptMention.find({
        companyName: { $regex: new RegExp(companyName, 'i') },
        brandId,
        userId
      })
      .populate('categoryId', 'categoryName')
      .populate('promptId', 'promptText')
      .populate('responseId', 'responseText')
      .sort({ createdAt: -1 });

      console.log(`✅ Found ${mentions.length} mentions for ${companyName}`);
      return mentions;

    } catch (error) {
      console.error('Error getting company mentions:', error.message);
      throw error;
    }
  }

  /**
   * Get mentions by category
   */
  async getMentionsByCategory(categoryId, brandId, userId) {
    try {
      const mentions = await CategoryPromptMention.find({
        categoryId,
        brandId,
        userId
      })
      .populate('promptId', 'promptText')
      .populate('responseId', 'responseText')
      .sort({ createdAt: -1 });

      return mentions;
    } catch (error) {
      console.error('Error getting mentions by category:', error.message);
      throw error;
    }
  }

  /**
   * Get all unique companies mentioned for a brand
   */
  async getUniqueCompanies(brandId, userId) {
    try {
      const companies = await CategoryPromptMention.aggregate([
        {
          $match: {
            brandId: brandId,
            userId: userId
          }
        },
        {
          $group: {
            _id: '$companyName',
            mentionCount: { $sum: 1 },
            lastMention: { $max: '$createdAt' }
          }
        },
        {
          $sort: { mentionCount: -1 }
        }
      ]);

      return companies;
    } catch (error) {
      console.error('Error getting unique companies:', error.message);
      throw error;
    }
  }
}

module.exports = MentionExtractor;
