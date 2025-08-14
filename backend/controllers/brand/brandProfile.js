const BrandProfile = require("../../models/BrandProfile");
const { analyzeBrandVoice, updateBrandProfileWithVoice } = require("./brandVoiceAnalyzer");

exports.findOrCreateBrandProfile = async ({ domain, brandName, userId }) => {
  let brand = await BrandProfile.findOne({ domain, ownerUserId: userId });
  
  if (!brand) {
    // Create new brand profile
    brand = await BrandProfile.create({ 
      ownerUserId: userId, 
      brandName: brandName || domain, 
      domain 
    });
    console.log("BrandProfile created:", brand);
    
    // Note: Brand voice analysis will happen later when we have the brand description
  } else {
    console.log("BrandProfile found:", brand);
  }
  
  return brand;
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