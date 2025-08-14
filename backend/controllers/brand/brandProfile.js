const BrandProfile = require("../../models/BrandProfile");
const { analyzeBrandVoice, updateBrandProfileWithVoice } = require("./brandVoiceAnalyzer");

exports.findOrCreateBrandProfile = async ({ domain, brandName, userId }) => {
  // First, check if user already has any brand profile
  let existingBrand = await BrandProfile.findOne({ ownerUserId: userId });
  
  if (existingBrand) {
    // User already has a brand - check if they're trying to analyze the same domain
    if (existingBrand.domain === domain) {
      console.log("✅ User's existing brand profile found for same domain:", existingBrand);
      return existingBrand;
    } else {
      // User is trying to analyze a different domain - update existing brand
      console.log("🔄 User switching domains - updating existing brand profile");
      console.log("Old domain:", existingBrand.domain, "→ New domain:", domain);
      
      // Update the existing brand profile with new domain and name
      existingBrand.domain = domain;
      existingBrand.brandName = brandName || domain;
      existingBrand.updatedAt = new Date();
      
      // Clear previous analysis data since domain changed
      existingBrand.brandTonality = "";
      existingBrand.brandInformation = "";
      
      await existingBrand.save();
      console.log("✅ Brand profile updated with new domain:", existingBrand);
      return existingBrand;
    }
  } else {
    // User has no brand profile - create new one
    console.log("🆕 Creating first brand profile for user");
    const newBrand = await BrandProfile.create({ 
      ownerUserId: userId, 
      brandName: brandName || domain, 
      domain 
    });
    console.log("✅ New BrandProfile created:", newBrand);
    return newBrand;
  }
};

/**
 * Updates brand profile with existing brand description and analyzes only brand tonality
 * This is more efficient as we reuse the existing brand description
 */
exports.updateBrandProfileWithDescriptionAndVoice = async (brandProfile, brandDescription, domain, brandName) => {
  try {
    // Use the existing brand description for brandInformation
    brandProfile.brandInformation = brandDescription || "";
    
    // Only analyze brand tonality (voice/tone) since we already have the description
    console.log("🎭 Analyzing brand tonality only (reusing existing description)...");
    const voiceAnalysis = await analyzeBrandVoice(domain, brandName);
    
    // Update with tonality and existing description
    brandProfile.brandTonality = voiceAnalysis.brandTonality;
    brandProfile.updatedAt = new Date();
    
    await brandProfile.save();
    console.log("✅ Brand profile updated with description and tonality analysis");
    
    return brandProfile;
  } catch (error) {
    console.error("❌ Error updating brand profile with description and voice:", error.message);
    throw error;
  }
};

/**
 * Get user's current brand profile
 */
exports.getUserBrandProfile = async (userId) => {
  try {
    const brandProfile = await BrandProfile.findOne({ ownerUserId: userId });
    return brandProfile;
  } catch (error) {
    console.error("❌ Error fetching user brand profile:", error.message);
    throw error;
  }
};

/**
 * Check if user can analyze a new domain (for validation)
 */
exports.canUserAnalyzeDomain = async (userId, domain) => {
  try {
    const existingBrand = await BrandProfile.findOne({ ownerUserId: userId });
    
    if (!existingBrand) {
      return { canAnalyze: true, message: "First brand analysis" };
    }
    
    if (existingBrand.domain === domain) {
      return { canAnalyze: true, message: "Re-analyzing existing domain" };
    }
    
    return { 
      canAnalyze: true, 
      message: `Switching from ${existingBrand.domain} to ${domain}`,
      warning: "This will replace your previous brand analysis"
    };
  } catch (error) {
    console.error("❌ Error checking domain analysis permission:", error.message);
    return { canAnalyze: false, message: "Error checking permissions" };
  }
};