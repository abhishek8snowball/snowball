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
      const formattedPlan = await this.formatContentPlan(contentPlan, companyName, userId);

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
    
    const prompt = `can you give 30 days content calender for ${companyName}  
    
    Return the response as a JSON array with 30 objects, each containing:
    {
      "title": "Blog post title",
      "description": "Detailed description",
      "keywords": "keyword1, keyword2, keyword3",
      "targetAudience": "Target audience description"
    };}`;

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

  async formatContentPlan(contentPlan, companyName, userId) {
    const today = new Date();
    const formattedPlan = [];

    // Get user's CMS platform preference from credentials
    let userCmsPlatform = 'shopify'; // Default to Shopify
    try {
      const userCredentials = await CMSCredentials.findOne({ 
        userId, 
        isActive: true 
      });
      if (userCredentials) {
        userCmsPlatform = userCredentials.platform;
      }
    } catch (error) {
      console.log('Could not determine user CMS platform, defaulting to Shopify');
    }

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
        cmsPlatform: userCmsPlatform
      });
    }

    return formattedPlan;
  }

  // Get specific calendar entry
  async getEntry(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const entry = await ContentCalendar.findOne({ _id: id, userId });
      
      if (!entry) {
        return res.status(404).json({ error: 'Entry not found' });
      }

      res.json({
        success: true,
        data: entry
      });
    } catch (error) {
      console.error('Error getting entry:', error);
      res.status(500).json({ error: 'Failed to get entry' });
    }
  }

  // Create new calendar entry
  async createEntry(req, res) {
    try {
      const userId = req.user.id;
      const entryData = req.body;

      const newEntry = new ContentCalendar({
        ...entryData,
        userId,
        date: entryData.date ? new Date(entryData.date) : new Date(),
        status: entryData.status || 'draft'
      });

      const savedEntry = await newEntry.save();

      res.json({
        success: true,
        data: savedEntry,
        message: 'Entry created successfully'
      });
    } catch (error) {
      console.error('Error creating entry:', error);
      res.status(500).json({ error: 'Failed to create entry' });
    }
  }

  // Generate content outline using OpenAI
  async generateOutline(req, res) {
    try {
      const { id } = req.params;
      const { title, description, keywords, targetAudience } = req.body;
      const userId = req.user.id;

      console.log('generateOutline called with:', { id, title, description, keywords, targetAudience, userId });

      if (!title) {
        return res.status(400).json({ error: 'Title is required to generate outline' });
      }

      // Create OpenAI prompt for outline generation
      const prompt = `Generate a detailed content outline for a blog post titled "${title}".

Description: ${description || 'No description provided'}

Keywords: ${keywords || 'No keywords provided'}

Target Audience: ${targetAudience || 'General audience'}

Please create a comprehensive outline with:
1. Introduction section
2. Main content sections (3-5 sections with subsections)
3. Conclusion section
4. Key takeaways
5. Call-to-action suggestions

Format the response as HTML with proper heading tags (h2, h3) and bullet points.`;

      console.log('OpenAI prompt:', prompt);

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional content strategist and copywriter. Create detailed, actionable content outlines that help writers structure their blog posts effectively."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const outline = completion.choices[0].message.content;
      console.log('Generated outline:', outline);

      // Update the entry with the generated outline
      const updatedEntry = await ContentCalendar.findByIdAndUpdate(
        id, 
        { outline },
        { new: true, runValidators: true }
      );

      console.log('Updated entry:', updatedEntry);

      res.json({
        success: true,
        data: { outline },
        message: 'Content outline generated successfully'
      });

    } catch (error) {
      console.error('Error generating outline:', error);
      res.status(500).json({ 
        error: 'Failed to generate outline',
        details: error.message 
      });
    }
  }

  // Create blog content from outline using OpenAI
  async createBlogFromOutline(req, res) {
    try {
      const { id } = req.params;
      const { title, description, keywords, targetAudience, outline } = req.body;
      const userId = req.user.id;

      console.log('createBlogFromOutline called with:', { id, title, description, keywords, targetAudience, userId });

      if (!outline) {
        return res.status(400).json({ error: 'Outline is required to create blog content' });
      }

      if (!title) {
        return res.status(400).json({ error: 'Title is required to create blog content' });
      }

      // Create OpenAI prompt for blog creation
      const prompt = `Create a comprehensive, engaging blog post based on this outline:

Title: ${title}
Description: ${description || 'Not specified'}
Keywords: ${keywords || 'Not specified'}
Target Audience: ${targetAudience || 'General audience'}

Outline:
${outline}

Requirements:
- Write in a professional, engaging tone
- Include proper headings (H1, H2, H3) based on the outline
- Use the keywords naturally throughout the content
- Target the specified audience
- Include practical examples and actionable insights
- Write 800-1200 words
- Format in HTML with proper tags
- Make it SEO-friendly and engaging
- Ensure the content flows logically from the outline structure

Please provide the complete blog post in HTML format.`;

      console.log('OpenAI prompt for blog creation:', prompt);

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert content writer specializing in creating engaging, SEO-optimized blog posts. Always respond with properly formatted HTML content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      const blogContent = completion.choices[0].message.content;
      console.log('Generated blog content length:', blogContent.length);

      // Update the entry with the generated blog content
      const updatedEntry = await ContentCalendar.findByIdAndUpdate(
        id, 
        { content: blogContent },
        { new: true, runValidators: true }
      );

      console.log('Updated entry with blog content:', updatedEntry._id);

      res.json({
        success: true,
        data: { blogContent },
        message: 'Blog created successfully from outline'
      });

    } catch (error) {
      console.error('Error creating blog from outline:', error);
      res.status(500).json({ 
        error: 'Failed to create blog from outline',
        details: error.message 
      });
    }
  }
}

const controller = new ContentCalendarController();

// Bind all methods to preserve 'this' context
module.exports = {
  generateCalendar: controller.generateCalendar.bind(controller),
  approveCalendar: controller.approveCalendar.bind(controller),
  getCalendar: controller.getCalendar.bind(controller),
  updateEntry: controller.updateEntry.bind(controller),
  deleteEntry: controller.deleteEntry.bind(controller),
  getEntry: controller.getEntry.bind(controller),
  createEntry: controller.createEntry.bind(controller),
  generateOutline: controller.generateOutline.bind(controller),
  createBlogFromOutline: controller.createBlogFromOutline.bind(controller)
};
