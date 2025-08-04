const PromptAIResponse = require("../../models/PromptAIResponse");

exports.runPromptsAndSaveResponses = async (openai, prompts) => {
  const aiResponses = [];
  for (const { promptDoc, catDoc } of prompts) {
    console.log("OpenAI running prompt:", promptDoc.promptText);
    
    // Enhance the prompt to ensure brand names are mentioned in the response
    const enhancedPrompt = `${promptDoc.promptText}

IMPORTANT: In your response, make sure to explicitly mention the brand names that are referenced in the question. If the question asks about specific brands, include those brand names in your answer. Be specific and mention the actual brand names rather than using generic terms.`;
    
    const aiResp = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: enhancedPrompt }],
      max_tokens: 500,
    });
    console.log("OpenAI aiResp:", aiResp.choices[0].message.content);
    const aiText = aiResp.choices[0].message.content;
    const aiDoc = await PromptAIResponse.create({ promptId: promptDoc._id, responseText: aiText });
    aiResponses.push({ aiDoc, catDoc });
    console.log("PromptAIResponse created:", aiDoc);
  }
  return aiResponses;
};