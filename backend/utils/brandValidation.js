const BrandProfile = require("../models/BrandProfile");
const BrandCategory = require("../models/BrandCategory");

/**
 * Validates that a user owns a specific brand
 * @param {string} userId - The user ID
 * @param {string} brandId - The brand ID
 * @returns {Promise<Object|null>} - Brand profile if owned, null if not
 */
exports.validateBrandOwnership = async (userId, brandId) => {
  try {
    const brand = await BrandProfile.findOne({
      _id: brandId,
      ownerUserId: userId
    });

    if (!brand) {
      console.log(`❌ Brand ownership validation failed: User ${userId} does not own brand ${brandId}`);
      return null;
    }

    console.log(`✅ Brand ownership validated: User ${userId} owns brand ${brand.brandName}`);
    return brand;
  } catch (error) {
    console.error("❌ Error validating brand ownership:", error);
    return null;
  }
};

/**
 * Validates that a user owns a specific category (through brand ownership)
 * @param {string} userId - The user ID
 * @param {string} categoryId - The category ID
 * @returns {Promise<Object|null>} - Category with populated brand if owned, null if not
 */
exports.validateCategoryOwnership = async (userId, categoryId) => {
  try {
    const category = await BrandCategory.findById(categoryId)
      .populate({
        path: 'brandId',
        select: 'ownerUserId brandName domain'
      });

    if (!category) {
      console.log(`❌ Category not found: ${categoryId}`);
      return null;
    }

    if (category.brandId.ownerUserId.toString() !== userId) {
      console.log(`❌ Category ownership validation failed: User ${userId} does not own category ${categoryId}`);
      return null;
    }

    console.log(`✅ Category ownership validated: User ${userId} owns category ${category.categoryName}`);
    return category;
  } catch (error) {
    console.error("❌ Error validating category ownership:", error);
    return null;
  }
};

/**
 * Gets all brands owned by a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - Array of brand profiles
 */
exports.getUserBrands = async (userId) => {
  try {
    const brands = await BrandProfile.find({ ownerUserId: userId })
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${brands.length} brands for user ${userId}`);
    return brands;
  } catch (error) {
    console.error("❌ Error fetching user brands:", error);
    return [];
  }
};

/**
 * Gets all categories for a user's brands
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - Array of categories with populated brand info
 */
exports.getUserCategories = async (userId) => {
  try {
    const categories = await BrandCategory.find()
      .populate({
        path: 'brandId',
        match: { ownerUserId: userId },
        select: 'brandName domain ownerUserId'
      })
      .sort({ createdAt: -1 });

    // Filter out categories where brand doesn't match (populate returns null)
    const userCategories = categories.filter(cat => cat.brandId);

    console.log(`✅ Found ${userCategories.length} categories for user ${userId}`);
    return userCategories;
  } catch (error) {
    console.error("❌ Error fetching user categories:", error);
    return [];
  }
}; 