const CategorySearchPrompt = require("../../models/CategorySearchPrompt");
const PerplexityService = require("../../utils/perplexityService");

// Initialize Perplexity service
const perplexityService = new PerplexityService();

exports.generateAndSavePrompts = async (openai, catDocs, brand, competitors = []) => {
  console.log(`🔄 Starting simplified two-step prompt generation for ${catDocs.length} categories`);
  console.log(`🏢 Using competitors: ${competitors.join(', ')}`);
  const prompts = [];
  
  for (const catDoc of catDocs) {
    console.log(`📝 Step 1: Getting long-tail keywords for category: ${catDoc.categoryName} (${catDoc._id})`);

    // Step 1: Get long-tail keywords from Perplexity
    let keywords = [];
    try {
      keywords = await perplexityService.getLongTailKeywords(brand.domain, catDoc.categoryName);
      console.log(`✅ Retrieved ${keywords.length} keywords for ${catDoc.categoryName}:`, keywords);
    } catch (error) {
      console.error(`❌ Error getting keywords for ${catDoc.categoryName}:`, error.message);
      // Fallback keywords
      keywords = [
        `${catDoc.categoryName} solutions`,
        `best ${catDoc.categoryName} services`,
        `${catDoc.categoryName} comparison`,
        `${catDoc.categoryName} alternatives`,
        `${catDoc.categoryName} reviews`
      ];
    }

    // Step 2: Generate prompts based on keywords
    console.log(`📝 Step 2: Generating prompts based on keywords for ${catDoc.categoryName}`);
    
    // Use real competitors if provided, otherwise fallback
    const competitorList = competitors.length > 0 ? competitors : [
      'competitor1', 'competitor2', 'competitor3', 'competitor4', 'competitor5'
    ];
    
    // Generate prompts based on keywords that users typically ask ChatGPT
    const promptGen = `You are helping a digital marketing researcher generate realistic, user-like questions that people typically ask ChatGPT about ${catDoc.categoryName} services.

Long-tail keywords for ${brand.domain} in ${catDoc.categoryName}: ${keywords.join(', ')}

Popular competitors include: ${competitorList.join(', ')}.

Generate 5 natural, conversational questions that users typically ask ChatGPT about these keywords. These questions should be framed so that responses would naturally mention ${brand.brandName} alongside competitors.

Guidelines:
- Use the provided keywords as inspiration for question topics
- Use natural, conversational phrasing reflecting genuine user curiosity (e.g., "What are the best…", "Which platforms…", "How do I choose…").
- Cover themes like comparisons, alternatives, recommendations, trending tools, and value-for-money.
- Do NOT mention the brand name in the questions themselves.
- Structure questions in the style commonly found in topic-based research or FAQs.
- Create questions that lead naturally to mentioning brands in answers.
- Focus on questions that users would actually ask ChatGPT for help with.

Format: Output only a JSON array of 5 strings.`;


    try {
      const promptResp = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: promptGen }],
        max_tokens: 300,
      });
      console.log("OpenAI promptResp:", promptResp.choices[0].message.content);
      let promptArr = [];
      try {
        promptArr = JSON.parse(promptResp.choices[0].message.content);
      } catch (e) {
        console.error("Failed to parse prompts JSON:", promptResp.choices[0].message.content);
        promptArr = promptResp.choices[0].message.content.match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, "")) || [];
      }
      promptArr = promptArr.slice(0, 5);
      console.log(`📋 Generated ${promptArr.length} prompts for category ${catDoc.categoryName}`);
      for (const p of promptArr) {
        const promptText = typeof p === "string" ? p : p.query;
        console.log(`💾 Saving prompt: ${promptText.substring(0, 50)}...`);
        const promptDoc = await CategorySearchPrompt.create({ categoryId: catDoc._id, promptText });
        prompts.push({ promptDoc, catDoc });
        console.log("✅ CategorySearchPrompt created:", promptDoc._id);
      }
    } catch (error) {
      console.error(`❌ Error generating prompts for category ${catDoc.categoryName}:`, error);
    }
  }
  console.log(`🎉 Prompt generation complete. Created ${prompts.length} prompts total.`);
  return prompts;
};

