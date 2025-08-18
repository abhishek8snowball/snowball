const User = require('../models/User');
const BrandProfile = require('../models/BrandProfile');
const { findOrCreateBrandProfile } = require('./brand/brandProfile');
const { extractCategories, saveCategories } = require('./brand/category');
const { generateAndSavePrompts } = require('./brand/prompt');
const { extractCompetitorsWithOpenAI } = require('./brand/extractCompetitors');
const { generateBrandDescription } = require('./brand/description');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const onboardingController = {
  // Step 1: Analyze domain and auto-fill business information
  async analyzeDomain(req, res) {
    try {
      const { domain } = req.body;
      const userId = req.user.id;

      if (!domain) {
        return res.status(400).json({ error: 'Domain is required' });
      }

      // Normalize domain (remove protocol, www, etc.)
      const normalizedDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
      
      // Use existing brand profile creation (which includes AI analysis)
      const brand = await findOrCreateBrandProfile({ domain: normalizedDomain, brandName: normalizedDomain, userId });
      
      console.log(`🔍 Brand profile after creation/update:`, {
        id: brand._id,
        domain: brand.domain,
        brandName: brand.brandName,
        brandInformation: brand.brandInformation,
        hasDescription: !!(brand.brandInformation && brand.brandInformation.trim())
      });
      
      // Perform AI analysis to get business information
      let businessInfo = {
        businessName: brand.brandName || normalizedDomain,
        description: brand.brandInformation || '',
        targetAudiences: []
      };

      // If no description exists, generate one using existing API
      if (!brand.brandInformation || brand.brandInformation.trim() === '') {
         try {
           console.log(`🤖 Generating brand description using existing API for: ${normalizedDomain}`);
           
           // Use existing generateBrandDescription function
           const brandDescription = await generateBrandDescription(openai, { 
             brandName: normalizedDomain, 
             domain: normalizedDomain 
           });
           
           console.log(`✅ Brand description generated:`, brandDescription);
           console.log(`🔍 Brand description type:`, typeof brandDescription);
           console.log(`🔍 Brand description length:`, brandDescription ? brandDescription.length : 'null/undefined');
           
           // Update business info with generated description
           businessInfo = {
             businessName: brand.brandName || normalizedDomain,
             description: brandDescription || '',
             targetAudiences: [] // This can be enhanced later
           };

           // Update the brand profile with generated description
           brand.brandInformation = brandDescription;
           brand.updatedAt = new Date();
           await brand.save();

           console.log(`✅ Brand profile updated with description for ${normalizedDomain}`);
           console.log(`📊 Final business info:`, businessInfo);
         } catch (aiError) {
           console.error("❌ Brand description generation failed:", aiError.message);
           // Keep existing businessInfo if generation fails
         }
               } else {
          // Use existing brand information
          businessInfo = {
            businessName: brand.brandName || normalizedDomain,
            description: brand.brandInformation || '',
            targetAudiences: brand.targetAudiences || [] // Use existing target audiences
          };
        }

               console.log(`🚀 Sending response to frontend:`, { success: true, ...businessInfo });
        console.log(`🔍 Response JSON:`, JSON.stringify({ success: true, ...businessInfo }, null, 2));
        
        res.json({
          success: true,
          ...businessInfo
        });

    } catch (error) {
      console.error('Domain analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze domain' });
    }
  },

  // Step 2: Fetch competitors using existing API
  async fetchCompetitors(req, res) {
    try {
      const { domain, businessName, description } = req.body;
      const userId = req.user.id;

      if (!domain) {
        return res.status(400).json({ error: 'Domain is required' });
      }

      // Get or create brand profile for this user
      const brand = await BrandProfile.findOne({ ownerUserId: userId });
      if (!brand) {
        return res.status(400).json({ error: 'Brand profile not found. Please complete step 1 first.' });
      }

      console.log(`🔍 Fetching competitors for brand:`, {
        brandName: brand.brandName,
        domain: brand.domain,
        userId: userId
      });

      // Use existing competitor extraction API with proper brand object
      const competitors = await extractCompetitorsWithOpenAI(openai, brand);

      console.log(`✅ Competitors extracted:`, competitors);

      res.json({
        success: true,
        competitors: competitors || []
      });

    } catch (error) {
      console.error('Competitors fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch competitors' });
    }
  },

  // Step 3: Generate business categories using existing API
  async generateCategories(req, res) {
    try {
      const { domain } = req.body;
      const userId = req.user.id;

      if (!domain) {
        return res.status(400).json({ error: 'Domain is required' });
      }

      // Get user's brand profile
      const brand = await BrandProfile.findOne({ ownerUserId: userId });
      if (!brand) {
        return res.status(400).json({ error: 'Brand profile not found. Please complete step 1 first.' });
      }

      console.log(`🔍 Generating categories for brand:`, {
        brandName: brand.brandName,
        domain: brand.domain,
        userId: userId
      });

      // Use existing category extraction API
      const categories = await extractCategories(domain);

      // Save categories to database using existing API
      const savedCategories = await saveCategories(brand, categories);

      console.log(`✅ Categories extracted and saved:`, savedCategories);

      res.json({
        success: true,
        categories: savedCategories || []
      });

    } catch (error) {
      console.error('Categories generation error:', error);
      res.status(500).json({ error: 'Failed to generate categories' });
    }
  },

  // Step 4: Generate prompts based on categories using existing API
  async generatePrompts(req, res) {
    try {
      const { categories } = req.body;
      const userId = req.user.id;

      if (!categories || categories.length === 0) {
        return res.status(400).json({ error: 'Categories are required' });
      }

      // Get user's brand profile
      const brand = await BrandProfile.findOne({ ownerUserId: userId });
      if (!brand) {
        return res.status(400).json({ error: 'Brand profile not found. Please complete step 1 first.' });
      }

      console.log(`🔍 Generating prompts for brand:`, {
        brandName: brand.brandName,
        domain: brand.domain,
        categories: categories,
        userId: userId
      });

      // Use existing prompt generation API with saved categories (which have _id)
      const prompts = await generateAndSavePrompts(openai, categories, brand, []);

      console.log(`✅ Prompts generated:`, prompts);

      res.json({
        success: true,
        prompts: prompts || []
      });

    } catch (error) {
      console.error('Prompts generation error:', error);
      res.status(500).json({ error: 'Failed to generate prompts' });
    }
  },

  // Step 5: Complete onboarding and save all data
  async completeOnboarding(req, res) {
    try {
      const userId = req.user.id;

      // Get the user's brand profile
      const brand = await BrandProfile.findOne({ ownerUserId: userId });
      
      if (!brand) {
        return res.status(400).json({ error: 'No brand profile found' });
      }

      // Mark user as having completed onboarding
      await User.findByIdAndUpdate(userId, {
        hasCompletedOnboarding: true,
        onboardingCompletedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Onboarding completed successfully'
      });

    } catch (error) {
      console.error('Onboarding completion error:', error);
      res.status(500).json({ error: 'Failed to complete onboarding' });
    }
  },

  // Get onboarding status for a user
  async getOnboardingStatus(req, res) {
    try {
      const userId = req.user.id;

      const brand = await BrandProfile.findOne({ ownerUserId: userId });
      
      if (!brand) {
        return res.json({
          hasOnboardingData: false,
          isCompleted: false,
          currentStep: 1,
          shouldRedirectToDashboard: false
        });
      }

      // Check if user has completed onboarding
      const user = await User.findById(userId);
      const isCompleted = user?.hasCompletedOnboarding || false;

      // Check if user has substantial data (brand info + at least some categories or prompts)
      let hasSubstantialData = false;
      
      if (brand.brandInformation && brand.brandInformation.trim()) {
        // Check if user has categories
        const categoryCount = await require('../models/BrandCategory').countDocuments({ brandId: brand._id });
        // Check if user has prompts
        const promptCount = await require('../models/CategorySearchPrompt').countDocuments({ 
          categoryId: { $in: (await require('../models/BrandCategory').find({ brandId: brand._id }).select('_id')).map(cat => cat._id) }
        });
        
        hasSubstantialData = categoryCount > 0 || promptCount > 0;
      }

      // Determine if user should go directly to dashboard
      const shouldRedirectToDashboard = isCompleted || hasSubstantialData;

      console.log(`🔍 Onboarding status for user ${userId}:`, {
        hasBrandData: !!brand,
        isCompleted,
        hasSubstantialData,
        shouldRedirectToDashboard
      });

      res.json({
        hasOnboardingData: true,
        isCompleted,
        currentStep: isCompleted ? 6 : 1,
        shouldRedirectToDashboard,
        data: brand
      });

    } catch (error) {
      console.error('Onboarding status error:', error);
      res.status(500).json({ error: 'Failed to get onboarding status' });
    }
  }
};

module.exports = onboardingController;
