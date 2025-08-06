const BlogExtractionService = require("../../utils/blogExtractionService");
const BlogAnalysis = require("../../models/BlogAnalysis");
const BlogScore = require("../../models/BlogScore");
const { blogScorer } = require("./blogScorer");

exports.extractAndSaveBlogs = async (brand) => {
  try {
    console.log(`📝 Extracting blogs for brand: ${brand.brandName} (${brand.domain})`);
    
    const blogExtractionService = new BlogExtractionService();
    const blogUrls = await blogExtractionService.extractTopBlogs(brand.domain);
    
    if (blogUrls.length === 0) {
      console.log('⚠️ No blogs extracted, returning empty result');
      return { blogs: [] };
    }

    console.log(`📊 Processing ${blogUrls.length} blogs with GEO scoring...`);
    
    // Process each blog to get recommendations and GEO scores
    const blogsWithAnalysis = [];
    
    for (let i = 0; i < blogUrls.length; i++) {
      const url = blogUrls[i];
      console.log(`🔍 Processing blog ${i + 1}/${blogUrls.length}: ${url}`);
      
      try {
        // Get GEO score and recommendations using OpenAI API
        console.log(`📊 Getting GEO score and recommendations for blog ${i + 1}...`);
        const geoScoreResult = await blogScorer.scoreBlog(url);
        
        // Save the GEO score to database
        const blogScore = await BlogScore.create({
          brandId: brand._id,
          blogUrl: url,
          scrapedData: geoScoreResult.scrapedData,
          geoScore: geoScoreResult.geoScore,
          geoReadiness: geoScoreResult.geoReadiness,
          factorScores: geoScoreResult.factorScores,
          recommendations: geoScoreResult.recommendations,
          limitations: geoScoreResult.limitations,
          summary: geoScoreResult.summary,
          rawAIResponse: geoScoreResult.rawAIResponse,
          scoredAt: geoScoreResult.scoredAt
        });
        
        blogsWithAnalysis.push({
          url: url,
          title: geoScoreResult.scrapedData.title || '',
          geoScore: geoScoreResult.geoScore,
          geoReadiness: geoScoreResult.geoReadiness,
          factorScores: geoScoreResult.factorScores,
          factorDetails: geoScoreResult.factorDetails, // Add detailed factor information
          recommendations: geoScoreResult.recommendations, // AI-powered recommendations from OpenAI
          summary: geoScoreResult.summary,
          limitations: geoScoreResult.limitations,
          blogScoreId: blogScore._id,
          extractedAt: new Date()
        });
        
        console.log(`✅ Added blog ${i + 1} with GEO score: ${geoScoreResult.geoScore}/10 (${geoScoreResult.geoReadiness})`);
        
        // Add a small delay to avoid rate limiting
        if (i < blogUrls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.error(`❌ Error processing blog ${i + 1}:`, error.message);
        // Still add the blog without scoring
        blogsWithAnalysis.push({
          url: url,
          title: '',
          geoScore: 0,
          geoReadiness: 'Unknown',
          factorScores: {},
          recommendations: [],
          summary: 'Error occurred during analysis',
          limitations: [error.message],
          blogScoreId: null,
          extractedAt: new Date()
        });
      }
    }

    // Save to database
    const blogAnalysis = await BlogAnalysis.create({
      brandId: brand._id,
      domain: brand.domain,
      blogs: blogsWithAnalysis,
      createdAt: new Date()
    });

    console.log(`✅ Blog analysis saved to database: ${blogAnalysis._id}`);
    console.log(`📊 Extracted ${blogsWithAnalysis.length} blogs with GEO scoring for ${brand.domain}`);

    return {
      id: blogAnalysis._id,
      domain: brand.domain,
      blogs: blogsWithAnalysis,
      createdAt: blogAnalysis.createdAt
    };

  } catch (error) {
    console.error('❌ Error in blog extraction and saving:', error);
    return { blogs: [] };
  }
};

// Get blog analysis for a brand
exports.getBlogAnalysis = async (req, res) => {
  try {
    const { brandId } = req.params;
    const userId = req.user.id;

    console.log(`🔍 Fetching blog analysis for brandId: ${brandId} for user: ${userId}`);

    if (!brandId) {
      return res.status(400).json({ msg: "Brand ID is required" });
    }

    // Validate brand ownership
    const { validateBrandOwnership } = require("../../utils/brandValidation");
    const brand = await validateBrandOwnership(userId, brandId);

    if (!brand) {
      return res.status(403).json({ msg: "Access denied: You don't have permission to access this brand" });
    }

    // Get the most recent blog analysis
    const blogAnalysis = await BlogAnalysis.findOne({ brandId })
      .sort({ createdAt: -1 });

    if (!blogAnalysis) {
      return res.json({
        blogs: [],
        domain: brand.domain,
        message: "No blog analysis found for this brand"
      });
    }

    console.log(`✅ Found blog analysis with ${blogAnalysis.blogs.length} blogs`);

    res.json({
      id: blogAnalysis._id,
      domain: brand.domain,
      blogs: blogAnalysis.blogs,
      createdAt: blogAnalysis.createdAt
    });

  } catch (error) {
    console.error("❌ Error fetching blog analysis:", error);
    res.status(500).json({ msg: "Failed to fetch blog analysis", error: error.message });
  }
};

// Score a single blog URL
exports.scoreSingleBlog = async (req, res) => {
  try {
    const { blogUrl } = req.body;
    const { brandId } = req.params;
    const userId = req.user.id;

    console.log(`📊 Scoring single blog: ${blogUrl} for brandId: ${brandId}`);

    if (!blogUrl) {
      return res.status(400).json({ msg: "Blog URL is required" });
    }

    if (!brandId) {
      return res.status(400).json({ msg: "Brand ID is required" });
    }

    // Validate brand ownership
    const { validateBrandOwnership } = require("../../utils/brandValidation");
    const brand = await validateBrandOwnership(userId, brandId);

    if (!brand) {
      return res.status(403).json({ msg: "Access denied: You don't have permission to access this brand" });
    }

    // Score the blog using OpenAI API
    const geoScoreResult = await blogScorer.scoreBlog(blogUrl);
    
    // Save the score to database
    const blogScore = await BlogScore.create({
      brandId: brand._id,
      blogUrl: blogUrl,
      scrapedData: geoScoreResult.scrapedData,
      geoScore: geoScoreResult.geoScore,
      geoReadiness: geoScoreResult.geoReadiness,
      factorScores: geoScoreResult.factorScores,
      recommendations: geoScoreResult.recommendations,
      limitations: geoScoreResult.limitations,
      summary: geoScoreResult.summary,
      rawAIResponse: geoScoreResult.rawAIResponse,
      scoredAt: geoScoreResult.scoredAt
    });

    console.log(`✅ Blog scored successfully. Score: ${geoScoreResult.geoScore}/10`);

    res.json({
      success: true,
      blogScore: {
        id: blogScore._id,
        blogUrl: blogUrl,
        geoScore: geoScoreResult.geoScore,
        geoReadiness: geoScoreResult.geoReadiness,
        factorScores: geoScoreResult.factorScores,
        factorDetails: geoScoreResult.factorDetails, // Add detailed factor information
        recommendations: geoScoreResult.recommendations,
        limitations: geoScoreResult.limitations,
        summary: geoScoreResult.summary,
        scrapedData: geoScoreResult.scrapedData,
        scoredAt: geoScoreResult.scoredAt
      }
    });

  } catch (error) {
    console.error("❌ Error scoring blog:", error);
    res.status(500).json({ 
      msg: "Failed to score blog", 
      error: error.message 
    });
  }
};

// Get blog scores for a brand
exports.getBlogScores = async (req, res) => {
  try {
    const { brandId } = req.params;
    const userId = req.user.id;

    console.log(`🔍 Fetching blog scores for brandId: ${brandId} for user: ${userId}`);

    if (!brandId) {
      return res.status(400).json({ msg: "Brand ID is required" });
    }

    // Validate brand ownership
    const { validateBrandOwnership } = require("../../utils/brandValidation");
    const brand = await validateBrandOwnership(userId, brandId);

    if (!brand) {
      return res.status(403).json({ msg: "Access denied: You don't have permission to access this brand" });
    }

    // Get all blog scores for this brand
    const blogScores = await BlogScore.find({ brandId })
      .sort({ scoredAt: -1 })
      .limit(50); // Limit to recent 50 scores

    console.log(`✅ Found ${blogScores.length} blog scores`);

    res.json({
      success: true,
      brandId: brand._id,
      brandName: brand.brandName,
      domain: brand.domain,
      blogScores: blogScores.map(score => ({
        id: score._id,
        blogUrl: score.blogUrl,
        geoScore: score.geoScore,
        geoReadiness: score.geoReadiness,
        factorScores: score.factorScores,
        recommendations: score.recommendations,
        limitations: score.limitations,
        summary: score.summary,
        scrapedData: score.scrapedData,
        scoredAt: score.scoredAt
      }))
    });

  } catch (error) {
    console.error("❌ Error fetching blog scores:", error);
    res.status(500).json({ 
      msg: "Failed to fetch blog scores", 
      error: error.message 
    });
  }
};

// Trigger blog analysis for domain analysis flow
exports.triggerBlogAnalysis = async (req, res) => {
  try {
    const { brandId } = req.params;
    const userId = req.user.id;

    console.log(`🚀 Triggering blog analysis for brandId: ${brandId} for user: ${userId}`);

    if (!brandId) {
      return res.status(400).json({ msg: "Brand ID is required" });
    }

    // Validate brand ownership
    const { validateBrandOwnership } = require("../../utils/brandValidation");
    const brand = await validateBrandOwnership(userId, brandId);

    if (!brand) {
      return res.status(403).json({ msg: "Access denied: You don't have permission to access this brand" });
    }

    // Check if blog analysis already exists
    const existingAnalysis = await BlogAnalysis.findOne({ brandId });
    if (existingAnalysis) {
      console.log(`✅ Blog analysis already exists for brand: ${brand.brandName}`);
      return res.json({
        success: true,
        brandId: brand._id,
        brandName: brand.brandName,
        domain: brand.domain,
        blogAnalysis: {
          blogs: existingAnalysis.blogs,
          createdAt: existingAnalysis.createdAt,
          status: "completed"
        },
        message: "Blog analysis already completed"
      });
    }

    // Extract and analyze blogs
    console.log(`📝 Starting blog extraction for brand: ${brand.brandName}`);
    const blogAnalysis = await exports.extractAndSaveBlogs(brand);

    console.log(`✅ Blog analysis completed for brand: ${brand.brandName}`);

    res.json({
      success: true,
      brandId: brand._id,
      brandName: brand.brandName,
      domain: brand.domain,
      blogAnalysis: {
        blogs: blogAnalysis.blogs,
        createdAt: new Date(),
        status: "completed"
      },
      message: "Blog analysis completed successfully"
    });

  } catch (error) {
    console.error("❌ Error triggering blog analysis:", error);
    res.status(500).json({ 
      msg: "Failed to trigger blog analysis", 
      error: error.message 
    });
  }
};