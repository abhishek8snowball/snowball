const BlogExtractionService = require("../../utils/blogExtractionService");
const BlogAnalysis = require("../../models/BlogAnalysis");
const BlogScore = require("../../models/BlogScore");
const { blogScorer } = require("./blogScorer");
const axios = require("axios");

// Add URL validation function
const validateBlogUrls = async (blogUrls) => {
  console.log(`🔍 Validating ${blogUrls.length} blog URLs before processing...`);
  const validUrls = [];
  
  for (const url of blogUrls) {
    try {
      console.log(`🔍 Checking URL: ${url}`);
      
      // Use GET request instead of HEAD for better compatibility
      const response = await axios.get(url, { 
        timeout: 15000,
        maxRedirects: 5,
        validateStatus: function (status) {
          // Accept 2xx status codes and redirects
          return status >= 200 && status < 400;
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      // Check if the response contains actual content (not just a redirect page)
      const contentLength = response.data ? response.data.length : 0;
      const isRedirect = response.request && response.request.res && response.request.res.responseUrl !== url;
      
      if (response.status >= 200 && response.status < 400 && contentLength > 100 && !isRedirect) {
        validUrls.push(url);
        console.log(`✅ URL validated: ${url} (Status: ${response.status}, Content Length: ${contentLength})`);
      } else {
        console.log(`❌ URL validation failed: ${url} (Status: ${response.status}, Content Length: ${contentLength}, Redirect: ${isRedirect})`);
      }
    } catch (error) {
      if (error.response) {
        // Server responded with error status
        console.log(`❌ URL validation failed: ${url} - HTTP ${error.response.status} (${error.response.statusText})`);
      } else if (error.request) {
        // Request was made but no response received
        console.log(`❌ URL validation failed: ${url} - No response received (timeout/network error)`);
      } else {
        // Something else happened
        console.log(`❌ URL validation failed: ${url} - ${error.message}`);
      }
    }
  }
  
  console.log(`📊 URL validation complete: ${validUrls.length}/${blogUrls.length} URLs are valid`);
  
  if (validUrls.length === 0) {
    console.log(`⚠️ WARNING: All ${blogUrls.length} extracted URLs failed validation!`);
    console.log(`⚠️ This suggests the blog extraction service is generating invalid URLs.`);
    console.log(`⚠️ Consider implementing real website crawling instead of AI-generated URLs.`);
  }
  
  return validUrls;
};

// Fallback function to find real blog URLs
const findRealBlogUrls = async (domain) => {
  console.log(`🔍 Attempting to find real blog URLs for ${domain}...`);
  const realUrls = [];
  
  try {
    // Try to find sitemap
    const sitemapUrl = `${domain}/sitemap.xml`;
    try {
      const sitemapResponse = await axios.get(sitemapUrl, { timeout: 10000 });
      if (sitemapResponse.status === 200) {
        console.log(`✅ Found sitemap at ${sitemapUrl}`);
        // Extract blog URLs from sitemap (basic regex extraction)
        const blogMatches = sitemapResponse.data.match(/<loc>(https?:\/\/[^<]+blog[^<]+)<\/loc>/gi);
        if (blogMatches) {
          blogMatches.forEach(match => {
            const url = match.replace(/<loc>(.*)<\/loc>/i, '$1');
            if (url.includes('blog') && !realUrls.includes(url)) {
              realUrls.push(url);
            }
          });
        }
      }
    } catch (sitemapError) {
      console.log(`⚠️ No sitemap found at ${sitemapUrl}`);
    }
    
    // Try common blog patterns
    const commonBlogPatterns = [
      `${domain}/blog`,
      `${domain}/articles`,
      `${domain}/news`,
      `${domain}/insights`,
      `${domain}/resources`
    ];
    
    for (const pattern of commonBlogPatterns) {
      try {
        const response = await axios.get(pattern, { timeout: 10000 });
        if (response.status === 200 && response.data.length > 100) {
          console.log(`✅ Found blog section at ${pattern}`);
          // Extract individual blog post URLs from the blog listing page
          const blogPostMatches = response.data.match(/href=["']([^"']*blog[^"']*\/[^"']*)["']/gi);
          if (blogPostMatches) {
            blogPostMatches.forEach(match => {
              const url = match.replace(/href=["']([^"']*)["']/i, '$1');
              const fullUrl = url.startsWith('http') ? url : `${domain}${url.startsWith('/') ? '' : '/'}${url}`;
              if (fullUrl.includes('blog') && !realUrls.includes(fullUrl)) {
                realUrls.push(fullUrl);
              }
            });
          }
        }
      } catch (patternError) {
        // Pattern not found, continue to next
      }
    }
    
    console.log(`🔍 Found ${realUrls.length} potential real blog URLs`);
    return realUrls.slice(0, 5); // Limit to 5
    
  } catch (error) {
    console.log(`❌ Error finding real blog URLs: ${error.message}`);
    return [];
  }
};

exports.extractAndSaveBlogs = async (brand) => {
  try {
    console.log(`📝 Extracting blogs for brand: ${brand.brandName} (${brand.domain})`);
    
    const blogExtractionService = new BlogExtractionService();
    const blogUrls = await blogExtractionService.extractTopBlogs(brand.domain);
    
    if (blogUrls.length === 0) {
      console.log('⚠️ No blogs extracted, returning empty result');
      return { blogs: [] };
    }

    console.log(`📋 Extracted ${blogUrls.length} blog URLs from AI service:`);
    blogUrls.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });

    // Validate URLs before processing
    let validBlogUrls = await validateBlogUrls(blogUrls);
    
    if (validBlogUrls.length === 0) {
      console.log('⚠️ No valid blog URLs found after validation, trying fallback method...');
      
      // Try to find real blog URLs as fallback
      const fallbackUrls = await findRealBlogUrls(brand.domain);
      if (fallbackUrls.length > 0) {
        console.log(`✅ Found ${fallbackUrls.length} real blog URLs using fallback method`);
        const validFallbackUrls = await validateBlogUrls(fallbackUrls);
        if (validFallbackUrls.length > 0) {
          console.log(`✅ Using ${validFallbackUrls.length} validated fallback URLs`);
          validBlogUrls = validFallbackUrls;
        } else {
          console.log('⚠️ Even fallback URLs failed validation, returning empty result');
          return { blogs: [] };
        }
      } else {
        console.log('⚠️ No fallback URLs found, returning empty result');
        return { blogs: [] };
      }
    }

    console.log(`📊 Processing ${validBlogUrls.length} valid blogs with GEO scoring...`);
    console.log(`📋 Valid URLs to process:`);
    validBlogUrls.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });
    
    // Process each valid blog to get recommendations and GEO scores
    const blogsWithAnalysis = [];
    
    for (let i = 0; i < validBlogUrls.length; i++) {
      const url = validBlogUrls[i];
      console.log(`🔍 Processing blog ${i + 1}/${validBlogUrls.length}: ${url}`);
      
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
        if (i < validBlogUrls.length - 1) {
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