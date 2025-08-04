const OpenAI = require("openai");
const WebsiteScraper = require("./websiteScraper");
const SEOScoreCalculator = require("./seoScoreCalculator");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.analyzeWebsiteSEO = async (openai, domain) => {
  try {
    console.log(`🔧 Starting real SEO audit for domain: ${domain}`);
    
    // Ensure domain has protocol
    let url = domain;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    // Step 1: Scrape website data
    console.log("📊 Step 1: Scraping website data...");
    const scraper = new WebsiteScraper();
    const scrapedData = await scraper.scrapeWebsite(url);
    await scraper.close();
    
    console.log("✅ Website data scraped successfully");
    console.log("📋 Scraped data summary:", {
      title: scrapedData.title?.substring(0, 50) + '...',
      metaDescription: scrapedData.metaDescription?.substring(0, 50) + '...',
      h1Count: scrapedData.h1Count,
      h2Count: scrapedData.h2Count,
      wordCount: scrapedData.wordCount,
      imageCount: scrapedData.imageCount,
      linkCount: scrapedData.linkCount,
      mobileScore: scrapedData.mobileScore?.score,
      accessibilityScore: scrapedData.accessibilityScore?.score
    });

    // Step 2: Calculate SEO score
    console.log("📈 Step 2: Calculating SEO score...");
    const calculator = new SEOScoreCalculator();
    const seoAnalysis = calculator.calculateScore(scrapedData);
    
    console.log("✅ SEO score calculated:", seoAnalysis.score);

    // Step 3: Generate AI summary and recommendations
    console.log("🤖 Step 3: Generating AI analysis...");
    const aiSummary = await generateAISummary(openai, scrapedData, seoAnalysis);
    
    console.log("✅ AI analysis generated");

    // Step 4: Combine results
    const finalResult = {
      status: seoAnalysis.status,
      score: seoAnalysis.score,
      issues: seoAnalysis.issues,
      recommendations: seoAnalysis.recommendations,
      summary: aiSummary,
      rawData: {
        scraped: scrapedData,
        analysis: seoAnalysis
      }
    };

    console.log("🎉 SEO audit completed successfully");
    console.log("📊 Final results:", {
      score: finalResult.score,
      status: finalResult.status,
      issuesCount: finalResult.issues.length,
      recommendationsCount: finalResult.recommendations.length
    });

    return finalResult;

  } catch (error) {
    console.error("❌ Error in SEO audit:", error);
    
    // Fallback to basic analysis if scraping fails
    return {
      status: 'needs-improvement',
      score: 30,
      issues: [
        {
          type: 'error',
          category: 'technical',
          message: 'Unable to analyze website - connection or scraping failed',
          priority: 'high'
        }
      ],
      recommendations: [
        'Check if the website is accessible',
        'Verify the domain is correct',
        'Ensure the website is not blocking automated access'
      ],
      summary: `Unable to perform comprehensive SEO analysis for ${domain}. The website may be inaccessible or blocking automated analysis tools.`
    };
  }
};

async function generateAISummary(openai, scrapedData, seoAnalysis) {
  try {
    const prompt = `Analyze this website's SEO data and provide a comprehensive summary:

Website Data:
- Title: "${scrapedData.title || 'Missing'}"
- Meta Description: "${scrapedData.metaDescription || 'Missing'}"
- Word Count: ${scrapedData.wordCount}
- H1 Tags: ${scrapedData.h1Count}, H2 Tags: ${scrapedData.h2Count}
- Images: ${scrapedData.imageCount} (${scrapedData.imagesWithoutAlt} without alt text)
- Links: ${scrapedData.linkCount} (${scrapedData.internalLinks} internal, ${scrapedData.externalLinks} external)
- Mobile Score: ${scrapedData.mobileScore?.score || 0}/100
- Accessibility Score: ${scrapedData.accessibilityScore?.score || 0}/100
- Has Schema: ${scrapedData.hasSchema ? 'Yes' : 'No'}
- Has Open Graph: ${scrapedData.hasOpenGraph ? 'Yes' : 'No'}
- Has Viewport: ${scrapedData.hasViewport ? 'Yes' : 'No'}

SEO Analysis:
- Overall Score: ${seoAnalysis.score}/100
- Status: ${seoAnalysis.status}
- Issues Found: ${seoAnalysis.issues.length}
- Key Issues: ${seoAnalysis.issues.slice(0, 3).map(i => i.message).join(', ')}

Provide a concise, professional summary (2-3 sentences) of the website's SEO health, focusing on the most critical issues and overall performance.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("❌ Error generating AI summary:", error);
    return `SEO analysis completed with a score of ${seoAnalysis.score}/100. ${seoAnalysis.issues.length} issues were identified that need attention.`;
  }
}