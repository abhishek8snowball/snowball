const MentionExtractor = require('./mentionExtractor');
const CategoryPromptMention = require('../../models/CategoryPromptMention');

// Initialize mention extractor
const mentionExtractor = new MentionExtractor();

/**
 * Process mentions for a specific brand
 */
exports.processBrandMentions = async (req, res) => {
  try {
    const { brandId } = req.params;
    const userId = req.user.id;

    console.log(`🔄 Processing mentions for brand: ${brandId}`);

    // Process all unprocessed responses for this brand
    const totalMentions = await mentionExtractor.processBrandResponses(brandId, userId);

    res.json({
      success: true,
      message: `Successfully processed mentions for brand`,
      totalMentions,
      brandId
    });

  } catch (error) {
    console.error('Error processing brand mentions:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to process brand mentions',
      error: error.message
    });
  }
};

/**
 * Get all mentions for a specific company
 */
exports.getCompanyMentions = async (req, res) => {
  try {
    const { companyName } = req.params;
    const { brandId } = req.query;
    const userId = req.user.id;

    if (!brandId) {
      return res.status(400).json({
        success: false,
        message: 'Brand ID is required'
      });
    }

    console.log(`🔍 Getting mentions for company: ${companyName} in brand: ${brandId}`);

    const mentions = await mentionExtractor.getCompanyMentions(companyName, brandId, userId);

    res.json({
      success: true,
      companyName,
      brandId,
      mentions,
      totalMentions: mentions.length
    });

  } catch (error) {
    console.error('Error getting company mentions:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get company mentions',
      error: error.message
    });
  }
};

/**
 * Get mentions by category
 */
exports.getMentionsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { brandId } = req.query;
    const userId = req.user.id;

    if (!brandId) {
      return res.status(400).json({
        success: false,
        message: 'Brand ID is required'
      });
    }

    console.log(`🔍 Getting mentions for category: ${categoryId} in brand: ${brandId}`);

    const mentions = await mentionExtractor.getMentionsByCategory(categoryId, brandId, userId);

    res.json({
      success: true,
      categoryId,
      brandId,
      mentions,
      totalMentions: mentions.length
    });

  } catch (error) {
    console.error('Error getting mentions by category:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get mentions by category',
      error: error.message
    });
  }
};

/**
 * Get all unique companies mentioned for a brand
 */
exports.getUniqueCompanies = async (req, res) => {
  try {
    const { brandId } = req.params;
    const userId = req.user.id;

    console.log(`🔍 Getting unique companies for brand: ${brandId}`);

    const companies = await mentionExtractor.getUniqueCompanies(brandId, userId);

    res.json({
      success: true,
      brandId,
      companies,
      totalCompanies: companies.length
    });

  } catch (error) {
    console.error('Error getting unique companies:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get unique companies',
      error: error.message
    });
  }
};

/**
 * Search mentions by company name
 */
exports.searchMentions = async (req, res) => {
  try {
    const { query, brandId } = req.query;
    const userId = req.user.id;

    if (!query || !brandId) {
      return res.status(400).json({
        success: false,
        message: 'Query and brand ID are required'
      });
    }

    console.log(`🔍 Searching mentions for query: ${query} in brand: ${brandId}`);

    const mentions = await CategoryPromptMention.find({
      companyName: { $regex: new RegExp(query, 'i') },
      brandId,
      userId
    })
    .populate('categoryId', 'categoryName')
    .populate('promptId', 'promptText')
    .populate('responseId', 'responseText')
    .sort({ createdAt: -1 })
    .limit(50);

    res.json({
      success: true,
      query,
      brandId,
      mentions,
      totalMentions: mentions.length
    });

  } catch (error) {
    console.error('Error searching mentions:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to search mentions',
      error: error.message
    });
  }
};

/**
 * Get mention statistics for a brand
 */
exports.getMentionStats = async (req, res) => {
  try {
    const { brandId } = req.params;
    const userId = req.user.id;

    console.log(`📊 Getting mention statistics for brand: ${brandId}`);

    const stats = await CategoryPromptMention.aggregate([
      {
        $match: {
          brandId: brandId,
          userId: userId
        }
      },
      {
        $group: {
          _id: null,
          totalMentions: { $sum: 1 },
          uniqueCompanies: { $addToSet: '$companyName' },
          categories: { $addToSet: '$categoryId' },
          totalPrompts: { $addToSet: '$promptId' }
        }
      },
      {
        $project: {
          _id: 0,
          totalMentions: 1,
          uniqueCompanies: { $size: '$uniqueCompanies' },
          categories: { $size: '$categories' },
          totalPrompts: { $size: '$totalPrompts' }
        }
      }
    ]);

    const result = stats[0] || {
      totalMentions: 0,
      uniqueCompanies: 0,
      categories: 0,
      totalPrompts: 0
    };

    res.json({
      success: true,
      brandId,
      stats: result
    });

  } catch (error) {
    console.error('Error getting mention statistics:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get mention statistics',
      error: error.message
    });
  }
};
