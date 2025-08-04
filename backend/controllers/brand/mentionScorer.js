const natural = require('natural');
const compromise = require('compromise');

class MentionScorer {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.sentimentAnalyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    
    this.contextWeights = {
      title: 3.0,
      heading: 2.5,
      firstParagraph: 2.0,
      listItem: 1.5,
      comparison: 1.8,
      recommendation: 2.2,
      review: 1.7,
      normal: 1.0
    };
  }

  scoreMention(entity, context, textWeight = 1.0) {
    if (!entity || !context) {
      return { score: 0, confidence: 0, sentiment: 'neutral' };
    }

    const contextType = this.determineContextType(context);
    const contextWeight = this.contextWeights[contextType] || 1.0;
    
    const sentiment = this.analyzeSentiment(context);
    const sentimentMultiplier = this.getSentimentMultiplier(sentiment);
    
    const confidence = this.calculateConfidence(entity, context);
    
    // Base score calculation
    let baseScore = textWeight * contextWeight * sentimentMultiplier;
    
    // Apply confidence adjustment
    const finalScore = baseScore * confidence;

    return {
      score: finalScore,
      confidence: confidence,
      sentiment: sentiment,
      contextType: contextType,
      textWeight: textWeight,
      contextWeight: contextWeight,
      sentimentMultiplier: sentimentMultiplier
    };
  }

  determineContextType(context) {
    if (!context) return 'normal';

    try {
      const doc = compromise(context.toLowerCase());

      // Check for title-like patterns using NLP
      if (this.isTitleContext(doc)) {
        return 'title';
      }

      // Check for heading patterns using NLP
      if (this.isHeadingContext(doc)) {
        return 'heading';
      }

      // Check for first paragraph (often contains key information)
      if (this.isFirstParagraphContext(context)) {
        return 'firstParagraph';
      }

      // Check for list items using NLP
      if (this.isListItemContext(doc)) {
        return 'listItem';
      }

      // Check for comparison context using NLP
      if (this.isComparisonContext(doc)) {
        return 'comparison';
      }

      // Check for recommendation context using NLP
      if (this.isRecommendationContext(doc)) {
        return 'recommendation';
      }

      // Check for review context using NLP
      if (this.isReviewContext(doc)) {
        return 'review';
      }

      return 'normal';
    } catch (error) {
      console.log(`⚠️ Compromise error in determineContextType: ${error.message}`);
      return 'normal';
    }
  }

  isTitleContext(doc) {
    try {
      const titleIndicators = [
        doc.text().length < 100,
        doc.has('welcome|about|services|contact|home|products|solutions').found,
        /^[A-Z][^.!?]*$/.test(doc.text()), // Starts with capital, no sentence endings
        doc.text().split(' ').length <= 8 && doc.text().length > 10
      ];

      return titleIndicators.some(indicator => indicator);
    } catch (error) {
      console.log(`⚠️ Compromise error in isTitleContext: ${error.message}`);
      return false;
    }
  }

  isHeadingContext(doc) {
    try {
      const headingIndicators = [
        doc.text().length < 200,
        doc.has('features|benefits|advantages|why|how|what|when|where|types|categories|options|alternatives').found
      ];

      return headingIndicators.some(indicator => indicator);
    } catch (error) {
      console.log(`⚠️ Compromise error in isHeadingContext: ${error.message}`);
      return false;
    }
  }

  isFirstParagraphContext(context) {
    // Simple heuristic: if it's the first substantial text block
    return context.length > 50 && context.length < 500;
  }

  isListItemContext(doc) {
    try {
      const listIndicators = [
        doc.text().startsWith('•'),
        doc.text().startsWith('-'),
        doc.text().startsWith('*'),
        doc.match(/^\d+\./).found,
        doc.match(/^[a-z]\./).found,
        doc.has('first|second|third|finally|additionally').found
      ];

      return listIndicators.some(indicator => indicator);
    } catch (error) {
      console.log(`⚠️ Compromise error in isListItemContext: ${error.message}`);
      return false;
    }
  }

  isComparisonContext(doc) {
    try {
      const comparisonKeywords = [
        'vs', 'versus', 'compared', 'comparison', 'alternative', 'instead',
        'rather', 'better', 'worse', 'similar', 'different', 'same',
        'both', 'either', 'neither', 'while', 'whereas', 'however'
      ];

      return comparisonKeywords.some(keyword => doc.has(keyword).found);
    } catch (error) {
      console.log(`⚠️ Compromise error in isComparisonContext: ${error.message}`);
      return false;
    }
  }

  isRecommendationContext(doc) {
    try {
      const recommendationKeywords = [
        'recommend', 'suggest', 'advise', 'prefer', 'choose', 'select',
        'best', 'top', 'leading', 'preferred', 'favorite', 'go-to',
        'should', 'must', 'need', 'essential', 'important', 'crucial'
      ];

      return recommendationKeywords.some(keyword => doc.has(keyword).found);
    } catch (error) {
      console.log(`⚠️ Compromise error in isRecommendationContext: ${error.message}`);
      return false;
    }
  }

  isReviewContext(doc) {
    try {
      const reviewKeywords = [
        'review', 'rating', 'score', 'opinion', 'experience', 'test',
        'evaluate', 'assess', 'analyze', 'examine', 'check', 'verify',
        'pros', 'cons', 'advantages', 'disadvantages', 'benefits', 'drawbacks'
      ];

      return reviewKeywords.some(keyword => doc.has(keyword).found);
    } catch (error) {
      console.log(`⚠️ Compromise error in isReviewContext: ${error.message}`);
      return false;
    }
  }

  analyzeSentiment(text) {
    if (!text) return 'neutral';

    try {
      // Use natural.js for better sentiment analysis
      const tokens = this.tokenizer.tokenize(text);
      const score = this.sentimentAnalyzer.getSentiment(tokens);
      
      // Determine sentiment based on score
      if (score > 0.1) return 'positive';
      else if (score < -0.1) return 'negative';
      else return 'neutral';
    } catch (error) {
      console.log(`⚠️ Natural.js error in analyzeSentiment: ${error.message}`);
      return 'neutral';
    }
  }

  getSentimentMultiplier(sentiment) {
    switch (sentiment) {
      case 'positive':
        return 1.2; // Slightly boost positive mentions
      case 'negative':
        return 0.8; // Reduce weight for negative mentions
      case 'neutral':
      default:
        return 1.0; // Normal weight for neutral mentions
    }
  }

  calculateConfidence(entity, context) {
    if (!entity || !context) return 0;

    let confidence = 0.5; // Base confidence

    // Higher confidence for longer, more specific entities
    if (entity.length > 8) {
      confidence += 0.1;
    }

    // Higher confidence for entities in important context
    if (this.isImportantContext(context)) {
      confidence += 0.2;
    }

    try {
      // Higher confidence for entities that appear multiple times using NLP
      const doc = compromise(context);
      const entityMatches = doc.match(entity).out('array');
      if (entityMatches.length > 1) {
        confidence += Math.min(0.2, entityMatches.length * 0.05);
      }
    } catch (error) {
      console.log(`⚠️ Compromise error in calculateConfidence: ${error.message}`);
      // Fallback to basic entity counting
      const entityRegex = new RegExp(`\\b${entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = context.match(entityRegex);
      if (matches && matches.length > 1) {
        confidence += Math.min(0.2, matches.length * 0.05);
      }
    }

    try {
      // Higher confidence for entities with brand indicators using NLP
      const entityDoc = compromise(entity.toLowerCase());
      const brandIndicators = ['inc', 'corp', 'llc', 'ltd', 'company', 'group', 'solutions', 'systems'];
      const hasBrandIndicator = brandIndicators.some(indicator => 
        entityDoc.has(indicator).found
      );
      if (hasBrandIndicator) {
        confidence += 0.1;
      }
    } catch (error) {
      console.log(`⚠️ Compromise error in calculateConfidence brand indicators: ${error.message}`);
      // Fallback to basic brand indicator checking
      const brandIndicators = ['inc', 'corp', 'llc', 'ltd', 'company', 'group', 'solutions', 'systems'];
      const hasBrandIndicator = brandIndicators.some(indicator => 
        entity.toLowerCase().includes(indicator)
      );
      if (hasBrandIndicator) {
        confidence += 0.1;
      }
    }

    // Higher confidence for domain-like entities
    if (/\.(com|org|net|io|co|tech|app|ai|cloud)$/.test(entity.toLowerCase())) {
      confidence += 0.15;
    }

    return Math.min(1.0, confidence);
  }

  isImportantContext(context) {
    if (!context) return false;

    try {
      const doc = compromise(context.toLowerCase());
      const importantKeywords = [
        'best', 'top', 'leading', 'popular', 'recommended', 'trusted', 'reliable',
        'alternative', 'competitor', 'similar', 'compare', 'vs', 'versus',
        'review', 'rating', 'score', 'rank', 'ranking', 'list', 'choice',
        'preferred', 'favorite', 'go-to', 'primary', 'main', 'major'
      ];

      return importantKeywords.some(keyword => 
        doc.has(keyword).found
      );
    } catch (error) {
      console.log(`⚠️ Compromise error in isImportantContext: ${error.message}`);
      // Fallback to basic keyword checking
      const importantKeywords = [
        'best', 'top', 'leading', 'popular', 'recommended', 'trusted', 'reliable',
        'alternative', 'competitor', 'similar', 'compare', 'vs', 'versus',
        'review', 'rating', 'score', 'rank', 'ranking', 'list', 'choice',
        'preferred', 'favorite', 'go-to', 'primary', 'main', 'major'
      ];
      return importantKeywords.some(keyword => 
        context.toLowerCase().includes(keyword)
      );
    }
  }

  aggregateMentions(mentions) {
    if (!mentions || mentions.length === 0) {
      return {
        totalScore: 0,
        totalMentions: 0,
        averageConfidence: 0,
        sentimentBreakdown: { positive: 0, negative: 0, neutral: 0 },
        contextBreakdown: {}
      };
    }

    let totalScore = 0;
    let totalMentions = mentions.length;
    let totalConfidence = 0;
    const sentimentBreakdown = { positive: 0, negative: 0, neutral: 0 };
    const contextBreakdown = {};

    mentions.forEach(mention => {
      totalScore += mention.score;
      totalConfidence += mention.confidence;
      
      // Count sentiment
      sentimentBreakdown[mention.sentiment]++;
      
      // Count context types
      const contextType = mention.contextType || 'normal';
      contextBreakdown[contextType] = (contextBreakdown[contextType] || 0) + 1;
    });

    return {
      totalScore: totalScore,
      totalMentions: totalMentions,
      averageConfidence: totalConfidence / totalMentions,
      sentimentBreakdown: sentimentBreakdown,
      contextBreakdown: contextBreakdown
    };
  }

  // New NLP-based methods
  analyzeSentimentNLP(text) {
    if (!text) return { sentiment: 'neutral', score: 0 };

    try {
      const tokens = this.tokenizer.tokenize(text);
      const score = this.sentimentAnalyzer.getSentiment(tokens);
      
      let sentiment = 'neutral';
      if (score > 0.1) sentiment = 'positive';
      else if (score < -0.1) sentiment = 'negative';

      return { sentiment, score };
    } catch (error) {
      console.log(`⚠️ Natural.js error in analyzeSentimentNLP: ${error.message}`);
      return { sentiment: 'neutral', score: 0 };
    }
  }

  extractContextFeatures(text) {
    if (!text) return {};

    try {
      const doc = compromise(text);
      
      return {
        hasNumbers: /\d/.test(text),
        hasUrls: doc.urls().found,
        hasEmails: doc.emails().found,
        hasOrganizations: doc.organizations().found,
        hasCompanies: doc.companies().found,
        hasPeople: doc.people().found,
        hasPlaces: doc.places().found,
        sentenceCount: doc.sentences().length,
        wordCount: doc.words().length
      };
    } catch (error) {
      console.log(`⚠️ Compromise error in extractContextFeatures: ${error.message}`);
      return {
        hasNumbers: /\d/.test(text),
        hasUrls: false,
        hasEmails: false,
        hasOrganizations: false,
        hasCompanies: false,
        hasPeople: false,
        hasPlaces: false,
        sentenceCount: 0,
        wordCount: text.split(' ').length
      };
    }
  }
}

module.exports = MentionScorer; 