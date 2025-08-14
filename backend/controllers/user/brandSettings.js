const UserBrandSettings = require("../../models/UserBrandSettings");
const BrandProfile = require("../../models/BrandProfile");

// Get user brand settings
exports.getBrandSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let brandSettings = await UserBrandSettings.findOne({ userId });
    
    // If no settings exist, create default ones
    if (!brandSettings) {
      brandSettings = new UserBrandSettings({
        userId,
        brandTonality: "",
        brandInformation: ""
      });
      await brandSettings.save();
    }
    
    // Get brand voice information from BrandProfile (automatically analyzed during domain analysis)
    let brandVoiceInfo = {
      brandTonality: "",
      brandInformation: ""
    };
    
    try {
      // Find the most recent brand profile for this user
      const brandProfile = await BrandProfile.findOne({ ownerUserId: userId })
        .sort({ updatedAt: -1 });
      
      if (brandProfile && (brandProfile.brandTonality || brandProfile.brandInformation)) {
        brandVoiceInfo = {
          brandTonality: brandProfile.brandTonality || "",
          brandInformation: brandProfile.brandInformation || ""
        };
        
        // Always update user settings with the most recent analyzed data
        // This ensures users see the latest analysis results
        if (brandVoiceInfo.brandTonality || brandVoiceInfo.brandInformation) {
          brandSettings.brandTonality = brandVoiceInfo.brandTonality;
          brandSettings.brandInformation = brandVoiceInfo.brandInformation;
          await brandSettings.save();
          console.log("✅ Brand settings updated with latest analyzed voice data");
        }
      }
    } catch (brandError) {
      console.log('Could not fetch brand voice info:', brandError.message);
      // Continue without brand voice info
    }
    
    res.json({
      success: true,
      data: {
        brandTonality: brandSettings.brandTonality || brandVoiceInfo.brandTonality || "",
        brandInformation: brandSettings.brandInformation || brandVoiceInfo.brandInformation || "",
        updatedAt: brandSettings.updatedAt,
        // Include source information
        source: {
          hasUserSettings: !!(brandSettings.brandTonality || brandSettings.brandInformation),
          hasAutoAnalyzedVoice: !!(brandVoiceInfo.brandTonality || brandVoiceInfo.brandInformation),
          lastAnalyzed: brandVoiceInfo.lastAnalyzed || null,
          dataSource: brandVoiceInfo.brandTonality || brandVoiceInfo.brandInformation ? 'Auto-analyzed' : 'Manual'
        }
      }
    });
  } catch (error) {
    console.error("Error fetching brand settings:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to fetch brand settings",
      error: error.message
    });
  }
};

// Save user brand settings
exports.saveBrandSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { brandTonality, brandInformation } = req.body;
    
    // Validate input
    if (brandTonality && brandTonality.length > 500) {
      return res.status(400).json({
        success: false,
        msg: "Brand tonality must be 500 characters or less"
      });
    }
    
    if (brandInformation && brandInformation.length > 2000) {
      return res.status(400).json({
        success: false,
        msg: "Brand information must be 2000 characters or less"
      });
    }
    
    // Find existing settings or create new ones
    let brandSettings = await UserBrandSettings.findOne({ userId });
    
    if (brandSettings) {
      // Update existing settings
      brandSettings.brandTonality = brandTonality || "";
      brandSettings.brandInformation = brandInformation || "";
      await brandSettings.save();
    } else {
      // Create new settings
      brandSettings = new UserBrandSettings({
        userId,
        brandTonality: brandTonality || "",
        brandInformation: brandInformation || ""
      });
      await brandSettings.save();
    }
    
    res.json({
      success: true,
      msg: "Brand settings saved successfully",
      data: {
        brandTonality: brandSettings.brandTonality,
        brandInformation: brandSettings.brandInformation,
        updatedAt: brandSettings.updatedAt
      }
    });
  } catch (error) {
    console.error("Error saving brand settings:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to save brand settings",
      error: error.message
    });
  }
};

// Force refresh brand voice data from latest analysis
exports.refreshBrandVoice = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get the most recent brand profile for this user
    const brandProfile = await BrandProfile.findOne({ ownerUserId: userId })
      .sort({ updatedAt: -1 });
    
    if (!brandProfile) {
      return res.status(404).json({
        success: false,
        msg: "No brand profile found. Please run a domain analysis first."
      });
    }
    
    // Find or create user brand settings
    let brandSettings = await UserBrandSettings.findOne({ userId });
    if (!brandSettings) {
      brandSettings = new UserBrandSettings({ userId });
    }
    
    // Update with latest analyzed data
    brandSettings.brandTonality = brandProfile.brandTonality || "";
    brandSettings.brandInformation = brandProfile.brandInformation || "";
    await brandSettings.save();
    
    res.json({
      success: true,
      msg: "Brand voice data refreshed from latest analysis",
      data: {
        brandTonality: brandSettings.brandTonality,
        brandInformation: brandSettings.brandInformation,
        updatedAt: brandSettings.updatedAt,
        source: "Auto-analyzed (refreshed)"
      }
    });
    
  } catch (error) {
    console.error("Error refreshing brand voice:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to refresh brand voice",
      error: error.message
    });
  }
};
