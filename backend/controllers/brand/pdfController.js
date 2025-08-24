const BrandAnalysisPDFGenerator = require('../../services/pdfGenerator');
const BrandShareOfVoice = require('../../models/BrandShareOfVoice');
const BrandProfile = require('../../models/BrandProfile');
const BrandCategory = require('../../models/BrandCategory');
const CategorySearchPrompt = require('../../models/CategorySearchPrompt');
const PromptAIResponse = require('../../models/PromptAIResponse');

// Super user only - Download brand analysis as PDF
exports.downloadBrandAnalysisPDF = async (req, res) => {
  console.log("=== 📄 PDF Download Request ===");
  const { brandId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  // Strict super user validation
  if (userRole !== 'superuser') {
    console.log("❌ Access denied - not a super user");
    return res.status(403).json({ 
      success: false,
      error: "Access denied - PDF download is only available for super users" 
    });
  }

  if (!brandId) {
    return res.status(400).json({ 
      success: false,
      error: "Brand ID is required" 
    });
  }

  try {
    console.log(`📋 Fetching brand analysis data for brandId: ${brandId}`);

    // Get brand profile
    const brand = await BrandProfile.findById(brandId);
    if (!brand) {
      return res.status(404).json({ 
        success: false,
        error: "Brand not found" 
      });
    }

    // Super user can access any brand, but let's verify this is an admin analysis
    if (!brand.isAdminAnalysis) {
      console.log("⚠️ Warning: Accessing non-admin analysis brand as super user");
    }

    console.log(`✅ Brand found: ${brand.brandName} (${brand.domain})`);

    // Get the latest analysis for this brand
    const latestAnalysis = await BrandShareOfVoice.findOne({ 
      brandId: brand._id 
    }).sort({ analysisDate: -1 });

    if (!latestAnalysis) {
      return res.status(404).json({ 
        success: false,
        error: "No analysis found for this brand" 
      });
    }

    console.log(`📊 Analysis found: ${latestAnalysis.analysisDate}`);

    // Get populated categories with prompts and responses
    let populatedCategories = [];
    if (latestAnalysis.categories && latestAnalysis.categories.length > 0) {
      console.log(`🔍 Fetching ${latestAnalysis.categories.length} categories...`);
      
      populatedCategories = await BrandCategory.find({
        _id: { $in: latestAnalysis.categories }
      }).lean();

      console.log(`✅ Found ${populatedCategories.length} categories`);

      // Get prompts and responses for each category
      for (const category of populatedCategories) {
        console.log(`📝 Fetching prompts for category: ${category.categoryName}`);
        
        const prompts = await CategorySearchPrompt.find({
          categoryId: category._id,
          brandId: brand._id
        }).lean();

        console.log(`📝 Found ${prompts.length} prompts for ${category.categoryName}`);

        // Get AI responses for each prompt
        const promptsWithResponses = [];
        for (const prompt of prompts) {
          const aiResponse = await PromptAIResponse.findOne({
            promptId: prompt._id
          }).lean();

          promptsWithResponses.push({
            ...prompt,
            aiResponse: aiResponse || null
          });
        }

        category.prompts = promptsWithResponses;
      }
    }

    // Prepare complete analysis data for PDF
    const analysisData = {
      brandName: brand.brandName,
      domain: brand.domain,
      description: latestAnalysis.description || `Analysis of ${brand.brandName}`,
      analysisDate: latestAnalysis.analysisDate,
      shareOfVoice: latestAnalysis.shareOfVoice || {},
      mentionCounts: latestAnalysis.mentionCounts || {},
      totalMentions: latestAnalysis.totalMentions || 0,
      brandShare: latestAnalysis.brandShare || 0,
      aiVisibilityScore: latestAnalysis.aiVisibilityScore || 0,
      competitors: latestAnalysis.competitors || [],
      categories: populatedCategories
    };

    console.log(`📊 PDF Data Summary:`, {
      categories: populatedCategories.length,
      competitors: latestAnalysis.competitors?.length || 0,
      totalMentions: latestAnalysis.totalMentions,
      brandShare: latestAnalysis.brandShare
    });

    // Generate PDF
    console.log(`🔄 Generating PDF for ${brand.brandName}...`);
    const pdfGenerator = new BrandAnalysisPDFGenerator();
    const pdfBuffer = await pdfGenerator.generateBrandAnalysisPDF(analysisData);

    console.log(`✅ PDF generated successfully`);

    // Set response headers for PDF download
    const filename = `${brand.brandName.replace(/[^a-zA-Z0-9]/g, '_')}_Analysis_${new Date().toISOString().split('T')[0]}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF buffer
    res.end(pdfBuffer);
    
    console.log(`📄 PDF downloaded: ${filename}`);

  } catch (error) {
    console.error("=== 💥 PDF Generation Error ===");
    console.error("❌ Error details:", error);
    
    res.status(500).json({ 
      success: false,
      error: "Failed to generate PDF",
      message: error.message 
    });
  }
};

// Super user only - Get analysis history
exports.getSuperUserAnalysisHistory = async (req, res) => {
  console.log("=== 📚 Super User Analysis History Request ===");
  const userId = req.user.id;
  const userRole = req.user.role;

  // Strict super user validation
  if (userRole !== 'superuser') {
    console.log("❌ Access denied - not a super user");
    return res.status(403).json({ 
      success: false,
      error: "Access denied - Analysis history is only available for super users" 
    });
  }

  try {
    console.log(`📋 Fetching all admin analysis brands for super user: ${userId}`);

    // Get ALL super user analyses (completely isolated, even same domains)
    const allSuperUserAnalyses = await BrandShareOfVoice.find({ 
      userId: userId.toString()
    }).populate('brandId').sort({ analysisDate: -1 });

    console.log(`✅ Found ${allSuperUserAnalyses.length} total analyses for super user`);

    // Build complete history - each analysis is separate and isolated
    const analysisHistory = [];
    
    for (const analysis of allSuperUserAnalyses) {
      // Only include super user admin analyses
      if (analysis.brandId && analysis.brandId.isAdminAnalysis) {
        analysisHistory.push({
          brandId: analysis.brandId._id,
          brandName: analysis.brandId.brandName,
          domain: analysis.brandId.domain,
          analysisDate: analysis.analysisDate,
          totalMentions: analysis.totalMentions || 0,
          brandShare: analysis.brandShare || 0,
          aiVisibilityScore: analysis.aiVisibilityScore || 0,
          competitorCount: analysis.competitors?.length || 0,
          createdAt: analysis.analysisDate, // Use analysis date for proper chronological sorting
          analysisId: analysis._id // Add unique analysis ID for complete isolation
        });
      }
    }

    console.log(`📊 Super user analysis history: ${analysisHistory.length} isolated analyses`);
    
    // Log breakdown for debugging
    const domainBreakdown = {};
    analysisHistory.forEach(analysis => {
      domainBreakdown[analysis.domain] = (domainBreakdown[analysis.domain] || 0) + 1;
    });
    console.log(`📈 Domain breakdown:`, domainBreakdown);

    console.log(`📊 Analysis history summary: ${analysisHistory.length} analyses`);

    res.json({
      success: true,
      message: "Super user analysis history retrieved",
      history: analysisHistory,
      totalAnalyses: analysisHistory.length
    });

  } catch (error) {
    console.error("=== 💥 Analysis History Error ===");
    console.error("❌ Error details:", error);
    
    res.status(500).json({ 
      success: false,
      error: "Failed to retrieve analysis history",
      message: error.message 
    });
  }
};