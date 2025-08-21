const BrandShareOfVoice = require("../models/BrandShareOfVoice");

/**
 * Gets or creates a consistent analysis session ID for a brand
 * This ensures all operations for a brand use the same session ID to prevent data fragmentation
 */
async function getOrCreateAnalysisSession(brandId, userId) {
  try {
    console.log(`🔍 Looking for existing analysis session for brand: ${brandId}, user: ${userId}`);
    
    // Try to find the most recent analysis session for this brand and user
    const latestSOV = await BrandShareOfVoice.findOne({ 
      brandId: brandId, 
      userId: userId 
    }).sort({ createdAt: -1 });
    
    if (latestSOV && latestSOV.analysisSessionId) {
      console.log(`🔄 Using existing analysis session: ${latestSOV.analysisSessionId}`);
      return latestSOV.analysisSessionId;
    } else {
      // Create a new consistent session ID for this brand
      const newSessionId = `brand_analysis_${brandId}_${Date.now()}`;
      console.log(`🆔 Created new analysis session: ${newSessionId}`);
      return newSessionId;
    }
  } catch (error) {
    console.error(`❌ Error getting analysis session:`, error);
    // Fallback to time-based session ID
    const fallbackSessionId = `brand_analysis_${brandId}_${Date.now()}`;
    console.log(`🔄 Using fallback analysis session: ${fallbackSessionId}`);
    return fallbackSessionId;
  }
}

/**
 * Validates if an analysis session belongs to a specific brand and user
 */
async function validateAnalysisSession(analysisSessionId, brandId, userId) {
  try {
    const sessionRecord = await BrandShareOfVoice.findOne({
      analysisSessionId: analysisSessionId,
      brandId: brandId,
      userId: userId
    });
    
    return !!sessionRecord;
  } catch (error) {
    console.error(`❌ Error validating analysis session:`, error);
    return false;
  }
}

/**
 * Gets all analysis sessions for a brand and user
 */
async function getBrandAnalysisSessions(brandId, userId) {
  try {
    const sessions = await BrandShareOfVoice.find({
      brandId: brandId,
      userId: userId
    }).select('analysisSessionId createdAt updatedAt').sort({ createdAt: -1 });
    
    return sessions.map(session => ({
      sessionId: session.analysisSessionId,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    }));
  } catch (error) {
    console.error(`❌ Error getting brand analysis sessions:`, error);
    return [];
  }
}

module.exports = {
  getOrCreateAnalysisSession,
  validateAnalysisSession,
  getBrandAnalysisSessions
};