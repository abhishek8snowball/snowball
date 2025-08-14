const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Analyzes brand voice and information from domain and brand name
 * Uses minimal tokens for cost efficiency
 */
exports.analyzeBrandVoice = async (domain, brandName) => {
  try {
    console.log(`🎭 Analyzing brand tonality for: ${brandName} (${domain})`);
    
    const prompt = `Analyze the brand voice and tone for: ${brandName} (${domain})

Return ONLY a JSON object with this exact field:
{
  "brandTonality": "Brief description of brand voice/tone (max 100 characters)"
}

Keep responses concise and professional. Focus only on voice, tone, and personality.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a brand voice analyst. Provide concise, accurate brand voice and tone analysis. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 100, // Even lower token limit since we only need tonality
      temperature: 0.3, // Low temperature for consistent results
      response_format: { type: "json_object" } // Ensure JSON response
    });

    const response = completion.choices[0].message.content;
    let parsedResponse;
    
    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", response);
      // Fallback response
      parsedResponse = {
        brandTonality: "Professional and informative"
      };
    }

    // Validate and clean the response
    const brandTonality = parsedResponse.brandTonality || "Professional and informative";

    console.log(`✅ Brand tonality analysis completed:`, {
      tonality: brandTonality.substring(0, 50) + (brandTonality.length > 50 ? '...' : '')
    });

    return {
      brandTonality: brandTonality.substring(0, 500), // Ensure it fits in database
      brandInformation: "" // Not used anymore - we reuse existing description
    };

  } catch (error) {
    console.error("❌ Error analyzing brand tonality:", error.message);
    
    // Return fallback values on error
    return {
      brandTonality: "Professional and informative",
      brandInformation: ""
    };
  }
};

/**
 * Updates brand profile with voice analysis results
 */
exports.updateBrandProfileWithVoice = async (brandProfile, voiceAnalysis) => {
  try {
    brandProfile.brandTonality = voiceAnalysis.brandTonality;
    // Note: brandInformation is not updated here - it comes from existing brand description
    brandProfile.updatedAt = new Date();
    
    await brandProfile.save();
    console.log("✅ Brand profile updated with tonality analysis");
    
    return brandProfile;
  } catch (error) {
    console.error("❌ Error updating brand profile with voice analysis:", error.message);
    throw error;
  }
};
