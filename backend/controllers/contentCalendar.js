const OpenAI = require('openai');
const ContentCalendar = require('../models/ContentCalendar');
const CMSCredentials = require('../models/CMSCredentials');
const cmsIntegration = require('../utils/cmsIntegration');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class ContentCalendarController {
  async generateCalendar(req, res) {
    try {
      const { companyName } = req.body;
      const userId = req.user.id;

      if (!companyName) {
        return res.status(400).json({ error: 'Company name is required' });
      }

      // Generate 30-day content plan using OpenAI
      const contentPlan = await this.generateContentPlan(companyName, userId, req);
      
      // Format dates for the next 30 days
      const formattedPlan = this.formatContentPlan(contentPlan, companyName);

      res.json({
        success: true,
        data: formattedPlan,
        message: 'Content calendar generated successfully'
      });

    } catch (error) {
      console.error('Error generating content calendar:', error);
      res.status(500).json({ 
        error: 'Failed to generate content calendar',
        details: error.message 
      });
    }
  }

  async approveCalendar(req, res) {
    try {
      const { companyName, contentPlan } = req.body;
      const userId = req.user.id;

      if (!companyName || !contentPlan || !Array.isArray(contentPlan)) {
        return res.status(400).json({ error: 'Invalid request data' });
      }

      // Save approved content plan to database
      const savedEntries = [];
      for (const item of contentPlan) {
        const calendarEntry = new ContentCalendar({
          userId,
          companyName,
          date: new Date(item.date),
          title: item.title,
          description: item.description,
          keywords: item.keywords,
          targetAudience: item.targetAudience,
          status: 'approved',
          cmsPlatform: item.cmsPlatform || 'wordpress'
        });

        const savedEntry = await calendarEntry.save();
        savedEntries.push(savedEntry);
      }

      res.json({
        success: true,
        data: savedEntries,
        message: 'Content calendar approved and scheduled successfully'
      });

    } catch (error) {
      console.error('Error approving content calendar:', error);
      res.status(500).json({ 
        error: 'Failed to approve content calendar',
        details: error.message 
      });
    }
  }

  async getCalendar(req, res) {
    try {
      const userId = req.user.id;
      const { companyName } = req.query;

      const query = { userId };
      if (companyName) {
        query.companyName = companyName;
      }

      const calendarEntries = await ContentCalendar.find(query)
        .sort({ date: 1 })
        .limit(100);

      res.json({
        success: true,
        data: calendarEntries
      });

    } catch (error) {
      console.error('Error fetching content calendar:', error);
      res.status(500).json({ 
        error: 'Failed to fetch content calendar',
        details: error.message 
      });
    }
  }

  async updateEntry(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const userId = req.user.id;

      const entry = await ContentCalendar.findOneAndUpdate(
        { _id: id, userId },
        updates,
        { new: true, runValidators: true }
      );

      if (!entry) {
        return res.status(404).json({ error: 'Calendar entry not found' });
      }

      res.json({
        success: true,
        data: entry,
        message: 'Entry updated successfully'
      });

    } catch (error) {
      console.error('Error updating calendar entry:', error);
      res.status(500).json({ 
        error: 'Failed to update entry',
        details: error.message 
      });
    }
  }

  async deleteEntry(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const entry = await ContentCalendar.findOneAndDelete({ _id: id, userId });

      if (!entry) {
        return res.status(404).json({ error: 'Calendar entry not found' });
      }

      res.json({
        success: true,
        message: 'Entry deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting calendar entry:', error);
      res.status(500).json({ 
        error: 'Failed to delete entry',
        details: error.message 
      });
    }
  }

  async generateContentPlan(companyName, userId, req) {
    const startTime = Date.now();
    
    const prompt = `Generate a 30-day content marketing plan for ${companyName}. 
    
    For each day, provide:
    - A compelling blog post title
    - A detailed description (150-200 words)
    - 3-5 relevant SEO keywords
    - Target audience description
    
    The content should be diverse and cover:
    - Industry insights and trends
    - How-to guides and tutorials
    - Company news and updates
    - Customer success stories
    - Educational content
    - Thought leadership pieces
    
    Make the content engaging, SEO-friendly, and valuable for the target audience.
    
    Return the response as a JSON array with 30 objects, each containing:
    {
      "title": "Blog post title",
      "description": "Detailed description",
      "keywords": "keyword1, keyword2, keyword3",
      "targetAudience": "Target audience description"
    }`;

    // Prepare request payload for logging
    const requestPayload = {
      companyName,
      prompt,
      model: "gpt-3.5-turbo",
      temperature: 0.4,
      maxTokens: 3000,
      timestamp: new Date()
    };

    try {
      console.log(`🤖 OPENAI API CALL - Content Calendar Generation for ${companyName}`);
      console.log(`   User ID: ${userId}`);
      console.log(`   Model: ${requestPayload.model}`);
      console.log(`   Temperature: ${requestPayload.temperature}`);
      console.log(`   Max Tokens: ${requestPayload.maxTokens}`);
      console.log(`   Prompt Length: ${prompt.length} characters`);

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a content marketing expert. Generate engaging, SEO-friendly blog content ideas."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      });

      const responseTime = Date.now() - startTime;
      const response = completion.choices[0].message.content;
      const usage = completion.usage;

      // Log OpenAI response
      console.log(`✅ OpenAI API response received`);
      console.log(`   Response Time: ${responseTime}ms`);
      console.log(`   Input Tokens: ${usage.prompt_tokens}`);
      console.log(`   Output Tokens: ${usage.completion_tokens}`);
      console.log(`   Total Tokens: ${usage.total_tokens}`);
      console.log(`   Cost: $${((usage.prompt_tokens * 0.00003) + (usage.completion_tokens * 0.00006)).toFixed(6)}`);



      let parsedResult;
      try {
        // Extract JSON from the response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
          
          // Log successful parsing
          console.log(`✅ Content plan parsed successfully`);
          console.log(`   Generated ${parsedResult.length} content ideas`);
          
          return parsedResult;
        }
        throw new Error('No valid JSON found in response');
      } catch (parseError) {
        console.error('❌ Error parsing OpenAI response:', parseError);
        
        // Fallback: generate a basic plan
        console.log(`🔄 Using fallback content plan`);
        return this.generateFallbackPlan(companyName);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`❌ OpenAI API call failed:`, error);
      
      // Fallback: generate a basic plan
      console.log(`🔄 Using fallback content plan due to API error`);
      return this.generateFallbackPlan(companyName);
    }
  }

  generateFallbackPlan(companyName) {
    const fallbackTitles = [
      "10 Ways to Improve Your Business Strategy",
      "The Future of Digital Marketing",
      "Building Strong Customer Relationships",
      "Innovation in the Modern Workplace",
      "Sustainable Business Practices",
      "Effective Team Communication",
      "Data-Driven Decision Making",
      "Customer Experience Optimization",
      "Strategic Planning for Growth",
      "Technology Trends in Business",
      "Leadership Development Strategies",
      "Market Analysis and Insights",
      "Product Development Best Practices",
      "Financial Planning for Success",
      "Employee Engagement Techniques",
      "Brand Building Strategies",
      "Sales Optimization Methods",
      "Quality Assurance Processes",
      "Supply Chain Management",
      "Risk Management Strategies",
      "Performance Metrics and KPIs",
      "Change Management Approaches",
      "Customer Retention Strategies",
      "Competitive Analysis Methods",
      "Business Process Optimization",
      "Talent Acquisition Strategies",
      "Market Expansion Planning",
      "Product Launch Strategies",
      "Customer Feedback Analysis",
      "Business Model Innovation"
    ];

    return fallbackTitles.map((title, index) => ({
      title,
      description: `This comprehensive guide explores ${title.toLowerCase()} and provides actionable insights for ${companyName} and similar businesses looking to improve their operations and achieve sustainable growth.`,
      keywords: "business strategy, growth, optimization, best practices",
      targetAudience: "Business owners, managers, and professionals seeking to improve their business performance"
    }));
  }

  formatContentPlan(contentPlan, companyName) {
    const today = new Date();
    const formattedPlan = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const content = contentPlan[i] || contentPlan[contentPlan.length - 1];
      
      formattedPlan.push({
        date: date.toISOString().split('T')[0],
        title: content.title,
        description: content.description,
        keywords: content.keywords,
        targetAudience: content.targetAudience,
        status: 'draft',
        cmsPlatform: 'wordpress'
      });
    }

    return formattedPlan;
  }
}

const controller = new ContentCalendarController();

// Bind all methods to preserve 'this' context
module.exports = {
  generateCalendar: controller.generateCalendar.bind(controller),
  approveCalendar: controller.approveCalendar.bind(controller),
  getCalendar: controller.getCalendar.bind(controller),
  updateEntry: controller.updateEntry.bind(controller),
  deleteEntry: controller.deleteEntry.bind(controller)
};
