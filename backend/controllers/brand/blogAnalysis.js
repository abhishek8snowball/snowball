const BlogExtractionService = require("../../utils/blogExtractionService");
const BlogAnalysis = require("../../models/BlogAnalysis");

exports.extractAndSaveBlogs = async (brand) => {
  try {
    console.log(`📝 Extracting blogs for brand: ${brand.brandName} (${brand.domain})`);
    
    const blogExtractionService = new BlogExtractionService();
    const blogUrls = await blogExtractionService.extractTopBlogs(brand.domain);
    
    if (blogUrls.length === 0) {
      console.log('⚠️ No blogs extracted, returning empty result');
      return { blogs: [] };
    }

    console.log(`📊 Processing ${blogUrls.length} blogs with recommendations...`);
    
    // Process each blog to get recommendations
    const blogsWithRecommendations = [];
    
    for (let i = 0; i < blogUrls.length; i++) {
      const url = blogUrls[i];
      console.log(`🔍 Processing blog ${i + 1}/${blogUrls.length}: ${url}`);
      
      try {
        // Get recommendations for this blog
        const recommendations = await blogExtractionService.getBlogRecommendations(url);
        
        blogsWithRecommendations.push({
          url: url,
          title: '', // Will be populated later if needed
          recommendations: recommendations,
          extractedAt: new Date()
        });
        
        console.log(`✅ Added ${recommendations.length} recommendations for blog ${i + 1}`);
        
        // Add a small delay to avoid rate limiting
        if (i < blogUrls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`❌ Error processing blog ${i + 1}:`, error.message);
        // Still add the blog without recommendations
        blogsWithRecommendations.push({
          url: url,
          title: '',
          recommendations: [],
          extractedAt: new Date()
        });
      }
    }

    // Save to database
    const blogAnalysis = await BlogAnalysis.create({
      brandId: brand._id,
      domain: brand.domain,
      blogs: blogsWithRecommendations,
      createdAt: new Date()
    });

    console.log(`✅ Blog analysis saved to database: ${blogAnalysis._id}`);
    console.log(`📊 Extracted ${blogsWithRecommendations.length} blogs with recommendations for ${brand.domain}`);

    return {
      id: blogAnalysis._id,
      domain: brand.domain,
      blogs: blogsWithRecommendations,
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
      domain: blogAnalysis.domain,
      blogs: blogAnalysis.blogs,
      createdAt: blogAnalysis.createdAt
    });

  } catch (error) {
    console.error("❌ Error fetching blog analysis:", error);
    res.status(500).json({ msg: "Failed to fetch blog analysis", error: error.message });
  }
}; 