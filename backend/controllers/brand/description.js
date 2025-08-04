exports.generateBrandDescription = async (openai, brand) => {
  const descPrompt = `Write a concise 1-2 sentence description for the brand "${brand.brandName}" (${brand.domain}).`;
  const descResp = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: descPrompt }],
    max_tokens: 100,
  });
  return descResp.choices[0].message.content.trim();
};