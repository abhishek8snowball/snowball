const axios = require('axios');
const cheerio = require('cheerio');
const OpenAI = require('openai');
const TokenCostLogger = require("../../utils/tokenCostLogger");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialize token logger
const tokenLogger = new TokenCostLogger();

class BlogScorer {
  constructor() {
    this.scoringPrompt = `Final prompt and evaluation criteria:

You are an SEO and AI content evaluation expert. Analyze the following blog for its effectiveness in Generative Engine Optimization (GEO), based on the 5-factor framework below.

🔗 Blog URL: {BLOG_URL}

Please evaluate the blog against the following 5 GEO factors. For each factor:
- Give a score from 0 to 10 (10 being excellent, 0 being not present)
- Multiply by the weight percentage
- Provide a brief explanation for the score with specific examples from the content
- Note any limitations in your evaluation method

At the end, calculate the total weighted score out of 10 and summarize the blog's GEO-readiness.

---

📊 *GEO Blog Scoring Framework (5 Key Factors):*

## *1. Content Structure & Answer Format (Weight: 30%)*
*What to evaluate:*
- Clear hierarchical headings (H1, H2, H3) and logical organization
- FAQ sections or Q&A format throughout content
- Direct answers immediately after question-based headings  
- One sentence = one clear answer approach
- Content is scannable and easy to navigate

*Scoring Guide:*
- *9-10*: Perfect hierarchy + extensive Q&A format + direct answers after each heading
- *7-8*: Good structure + some Q&A elements + most sections provide clear answers
- *5-6*: Basic structure + limited direct answers + moderate organization
- *3-4*: Poor structure + few direct answers + difficult to scan
- *0-2*: No clear structure + no direct answers + confusing layout

---

## *2. Schema Markup & Technical Foundation (Weight: 25%)*
*What to evaluate:*
- Article schema with author, date, description
- FAQ/HowTo schema for relevant sections  
- JSON-LD format implementation
- HTTPS, mobile-responsive, fast loading
- Clean HTML structure and proper meta tags

*Scoring Guide:*
- *9-10*: Multiple schema types (Article, FAQ, HowTo) + perfect technical setup
- *7-8*: 2-3 schema types + good technical foundation with minor issues
- *5-6*: Basic Article schema + adequate technical implementation
- *3-4*: Minimal schema + some technical issues
- *0-2*: No schema + major technical problems

*⚠ Evaluation Note*: Schema markup requires HTML source inspection. If unable to verify technically, clearly state limitations and focus on visible technical elements only.

---

## *3. Semantic Clarity & Topic Authority (Weight: 20%)*
*What to evaluate:*
- Comprehensive, contextually rich content coverage
- Natural, conversational language
- Clear author credentials and brand entity consistency
- Expert quotes or first-hand experience
- Industry terminology used correctly

*Scoring Guide:*
- *9-10*: Comprehensive topic coverage + strong entity presence + clear expertise signals
- *7-8*: Good depth + some entity recognition + basic authority indicators
- *5-6*: Adequate coverage + limited entity clarity + few authority signals
- *3-4*: Surface-level content + weak entities + minimal authority
- *0-2*: Poor coverage + no entity recognition + no authority signals

---

## *4. Content Freshness & Conversational Optimization (Weight: 15%)*
*What to evaluate:*
- Recent publication/update dates with timestamps
- Current data and statistics (2024-2025)
- Long-tail, conversational keyword phrases
- "How to," "What is," "Why does" question formats
- Natural speech patterns that work for voice search

*Scoring Guide:*
- *9-10*: Recently updated + extensive long-tail keywords + perfect conversational tone
- *7-8*: Fresh content + good conversational elements + some voice optimization
- *5-6*: Moderately current + basic natural language + limited voice consideration
- *3-4*: Somewhat outdated + formal tone + no voice optimization
- *0-2*: Old content + robotic language + completely ignores conversational search

---

## *5. Citation Worthiness & Multimedia Integration (Weight: 10%)*
*What to evaluate:*
- Links to authoritative sources (.edu, .gov, industry leaders)
- Original research, expert quotes, or unique insights
- Descriptive alt text and file names for images
- Charts, infographics, or supporting visuals
- Content that other sites would want to reference

*Scoring Guide:*
- *9-10*: Highly authoritative sources + rich multimedia with proper optimization
- *7-8*: Good sources + some optimized multimedia elements
- *5-6*: Basic sources + limited multimedia with basic optimization
- *3-4*: Few sources + minimal multimedia + poor optimization
- *0-2*: No credible sources + no multimedia or completely unoptimized

---

## *Output Format:*

### *GEO Evaluation Results*

| Factor | Score | Weight | Weighted Score | Comments |
|--------|-------|---------|----------------|----------|
| Content Structure & Answer Format | X/10 | 30% | X.XX | Brief explanation with examples |
| Schema Markup & Technical Foundation | X/10 | 25% | X.XX | Brief explanation + evaluation limitations if any |
| Semantic Clarity & Topic Authority | X/10 | 20% | X.XX | Brief explanation with examples |
| Content Freshness & Conversational Optimization | X/10 | 15% | X.XX | Brief explanation with examples |
| Citation Worthiness & Multimedia Integration | X/10 | 10% | X.XX | Brief explanation with examples |
| *TOTAL GEO SCORE* | | *100%* | *X.XX/10* | |

### *GEO Readiness Assessment:*
- *8.5-10.0: **Excellent* - High likelihood of AI search visibility
- *7.0-8.4: **Strong* - Good potential for AI inclusion  
- *5.5-6.9: **Moderate* - Needs improvement for consistent visibility
- *4.0-5.4: **Poor* - Significant optimization required
- *Below 4.0: **Critical* - Complete overhaul needed

### *Summary & Top 3 Recommendations:*
[Provide overall assessment and the 3 most impactful improvements needed]

### *Actionable Recommendations:*
Provide 5 specific, actionable recommendations for improving this blog's GEO performance:

1. **SEO Improvements**: [Specific technical or content SEO recommendations]
2. **Content Optimization**: [Content structure, readability, or engagement improvements]
3. **User Engagement**: [Strategies to increase user interaction and time on page]
4. **Technical Enhancements**: [Schema markup, performance, or accessibility improvements]
5. **Marketing Opportunities**: [Ways to increase visibility and reach]

### *Evaluation Limitations:*
[Note any factors you couldn't fully verify and explain why]`;
  }

  async scrapeBlogContent(url) {
    try {
      console.log(`🔍 Scraping blog content from: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false
        })
      });

      const html = response.data;
      
      // Extract basic content using regex (simplified extraction)
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : '';
      
      // Extract meta description
      const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : '';
      
      // Extract main content (simplified - remove scripts, styles, etc.)
      let content = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 5000); // Limit content length
      
      return {
        url,
        title,
        metaDescription,
        content,
        scrapedAt: new Date()
      };
      
    } catch (error) {
      console.error(`❌ Error scraping blog content: ${error.message}`);
      return {
        url,
        title: '',
        metaDescription: '',
        content: '',
        error: error.message,
        scrapedAt: new Date()
      };
    }
  }

  async scoreBlog(blogUrl) {
    try {
      console.log(`📊 Starting GEO scoring for blog: ${blogUrl}`);
      
      // Step 1: Scrape blog content
      const scrapedData = await this.scrapeBlogContent(blogUrl);
      
      if (scrapedData.error) {
        throw new Error(`Failed to scrape blog content: ${scrapedData.error}`);
      }
      
      // Step 2: Prepare the prompt with the blog URL
      const prompt = this.scoringPrompt.replace('{BLOG_URL}', blogUrl);
      
      // Step 3: Call OpenAI API for scoring
      console.log('🤖 Calling OpenAI API for GEO scoring...');
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert SEO and AI content evaluation specialist. Analyze blogs for Generative Engine Optimization (GEO) effectiveness using the provided framework."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.1
      });
      
      const aiResponse = completion.choices[0].message.content;
      
      // Log token usage and cost for blog scoring
      const systemPrompt = "You are an expert SEO and AI content evaluation specialist. Analyze blogs for Generative Engine Optimization (GEO) effectiveness using the provided framework.";
      const fullPrompt = `${systemPrompt}\n\n${prompt}`;
      
      tokenLogger.logOpenAICall(
        'Blog GEO Scoring',
        fullPrompt,
        aiResponse,
        'gpt-3.5-turbo'
      );
      
      console.log('✅ OpenAI API response received');
      
      // Step 4: Parse the AI response to extract scores and recommendations
      const parsedResults = this.parseAIResponse(aiResponse);
      
      // Step 5: Combine results
      const finalResult = {
        blogUrl,
        scrapedData: {
          title: scrapedData.title,
          metaDescription: scrapedData.metaDescription,
          contentPreview: scrapedData.content.substring(0, 200) + '...',
          scrapedAt: scrapedData.scrapedAt
        },
        geoScore: parsedResults.totalScore,
        geoReadiness: parsedResults.readiness,
        factorScores: parsedResults.factorScores,
        recommendations: parsedResults.recommendations,
        limitations: parsedResults.limitations,
        summary: parsedResults.summary,
        rawAIResponse: aiResponse,
        scoredAt: new Date()
      };
      
      console.log(`✅ GEO scoring completed. Score: ${finalResult.geoScore}/10`);
      return finalResult;
      
    } catch (error) {
      console.error('❌ Error in blog scoring:', error);
      throw error;
    }
  }

  parseAIResponse(aiResponse) {
    try {
      console.log('🔍 Parsing AI response for scores and recommendations...');
      
      // Initialize default values
      const result = {
        totalScore: 0,
        readiness: 'Unknown',
        factorScores: {},
        factorDetails: [], // New array to store detailed factor information
        recommendations: [],
        limitations: [],
        summary: ''
      };
      
      // Extract total score
      const totalScoreMatch = aiResponse.match(/\*TOTAL GEO SCORE\*.*?\*(\d+\.?\d*)\/10\*/);
      if (totalScoreMatch) {
        result.totalScore = parseFloat(totalScoreMatch[1]);
      }
      
      // Extract detailed factor information from the table
      const tableMatch = aiResponse.match(/\*GEO Evaluation Results\*([\s\S]*?)(?=\*GEO Readiness Assessment:\*|$)/);
      if (tableMatch) {
        const tableContent = tableMatch[1];
        const rows = tableContent.split('\n').filter(row => row.includes('|'));
        
        rows.forEach(row => {
          const columns = row.split('|').map(col => col.trim()).filter(col => col.length > 0);
          if (columns.length >= 5 && !columns[0].includes('Factor') && !columns[0].includes('---')) {
            const factor = columns[0];
            const scoreMatch = columns[1].match(/(\d+\.?\d*)\/10/);
            const weightMatch = columns[2].match(/(\d+)%/);
            const weightedScoreMatch = columns[3].match(/(\d+\.?\d*)/);
            const comments = columns[4];
            
            if (scoreMatch && weightMatch && weightedScoreMatch) {
              const score = parseFloat(scoreMatch[1]);
              const weight = parseInt(weightMatch[1]);
              const weightedScore = parseFloat(weightedScoreMatch[1]);
              
              result.factorScores[factor] = { 
                score, 
                weight: `${weight}%`,
                weightedScore 
              };
              
              result.factorDetails.push({
                factor,
                score,
                weight,
                weightedScore,
                comments
              });
            }
          }
        });
      }
      
      // Fallback: Extract factor scores from the old format if table parsing failed
      if (result.factorDetails.length === 0) {
        const factorMatches = aiResponse.match(/\|([^|]+)\|(\d+\.?\d*)\/10\|(\d+%)/g);
        if (factorMatches) {
          factorMatches.forEach(match => {
            const parts = match.split('|');
            if (parts.length >= 4) {
              const factorName = parts[1].trim();
              const score = parseFloat(parts[2]);
              const weight = parts[3].trim();
              result.factorScores[factorName] = { score, weight };
            }
          });
        }
      }
      
      // Determine readiness level
      if (result.totalScore >= 8.5) result.readiness = 'Excellent';
      else if (result.totalScore >= 7.0) result.readiness = 'Strong';
      else if (result.totalScore >= 5.5) result.readiness = 'Moderate';
      else if (result.totalScore >= 4.0) result.readiness = 'Poor';
      else result.readiness = 'Critical';
      
      // Extract recommendations
      const recommendationsMatch = aiResponse.match(/\*Actionable Recommendations:\*([\s\S]*?)(?=\*Evaluation Limitations:\*|$)/);
      if (recommendationsMatch) {
        const recommendationsText = recommendationsMatch[1].trim();
        // Split by numbered lists or bullet points
        const recs = recommendationsText.split(/\d+\.|•|\*/).filter(rec => rec.trim().length > 0);
        result.recommendations = recs.slice(0, 5).map(rec => rec.trim());
      }
      
      // If no actionable recommendations found, try the old format
      if (result.recommendations.length === 0) {
        const oldRecommendationsMatch = aiResponse.match(/\*Summary & Top 3 Recommendations:\*([\s\S]*?)(?=\*Evaluation Limitations:\*|$)/);
        if (oldRecommendationsMatch) {
          const recommendationsText = oldRecommendationsMatch[1].trim();
          const recs = recommendationsText.split(/\d+\.|•|\*/).filter(rec => rec.trim().length > 0);
          result.recommendations = recs.slice(0, 3).map(rec => rec.trim());
        }
      }
      
      // Extract limitations
      const limitationsMatch = aiResponse.match(/\*Evaluation Limitations:\*([\s\S]*?)$/);
      if (limitationsMatch) {
        const limitationsText = limitationsMatch[1].trim();
        result.limitations = [limitationsText];
      }
      
      // Extract summary
      const summaryMatch = aiResponse.match(/\*Summary & Top 3 Recommendations:\*([\s\S]*?)(?=\d+\.|•|\*|$)/);
      if (summaryMatch) {
        result.summary = summaryMatch[1].trim();
      }
      
      console.log('✅ AI response parsed successfully');
      console.log('📊 Factor details:', result.factorDetails);
      return result;
      
    } catch (error) {
      console.error('❌ Error parsing AI response:', error);
      return {
        totalScore: 0,
        readiness: 'Unknown',
        factorScores: {},
        factorDetails: [],
        recommendations: ['Unable to parse AI response'],
        limitations: ['Error parsing AI response'],
        summary: 'Error occurred while parsing the AI response'
      };
    }
  }
}

// Export the class and a singleton instance
const blogScorer = new BlogScorer();

module.exports = {
  BlogScorer,
  blogScorer
}; 