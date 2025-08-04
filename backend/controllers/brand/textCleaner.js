const natural = require('natural');
const compromise = require('compromise');

class TextCleaner {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.sentimentAnalyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
  }

  cleanText(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    try {
      // Use compromise for better text cleaning
      const doc = compromise(text);
      
      // Remove HTML tags, URLs, emails using compromise with error handling
      let cleaned = doc.text(); // Use .text() instead of .html() to avoid the error
      
      // Manually remove URLs and emails if compromise fails
      cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, ' ');
      cleaned = cleaned.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, ' ');
      
      // Normalize whitespace
      cleaned = cleaned.replace(/\s+/g, ' ').trim();

      return cleaned;
    } catch (error) {
      console.log(`⚠️ Compromise error in cleanText: ${error.message}`);
      // Fallback to basic cleaning
      return text
        .replace(/<[^>]*>/g, ' ')
        .replace(/https?:\/\/[^\s]+/g, ' ')
        .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
  }

  normalizeText(text) {
    if (!text) return '';

    try {
      // Use compromise for better normalization
      const doc = compromise(text);
      return doc.normalize().text().toLowerCase().trim();
    } catch (error) {
      console.log(`⚠️ Compromise error in normalizeText: ${error.message}`);
      // Fallback to basic normalization
      return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
  }

  extractSentences(text) {
    if (!text) return [];

    try {
      // Use compromise for better sentence extraction
      const doc = compromise(text);
      const sentences = doc.sentences().out('array');
      
      return sentences
        .map(sentence => this.cleanText(sentence))
        .filter(sentence => sentence.length > 10);
    } catch (error) {
      console.log(`⚠️ Compromise error in extractSentences: ${error.message}`);
      // Fallback to basic sentence extraction
      const sentences = text.split(/[.!?]+/).filter(sentence => 
        sentence.trim().length > 10
      );
      return sentences.map(sentence => this.cleanText(sentence));
    }
  }

  extractParagraphs(text) {
    if (!text) return [];

    try {
      // Use compromise for paragraph extraction
      const doc = compromise(text);
      const paragraphs = doc.match('*').out('array');
      
      return paragraphs
        .map(paragraph => this.cleanText(paragraph))
        .filter(paragraph => paragraph.length > 20);
    } catch (error) {
      console.log(`⚠️ Compromise error in extractParagraphs: ${error.message}`);
      // Fallback to basic paragraph extraction
      const paragraphs = text.split(/\n\s*\n|<\/p>\s*<p>/).filter(paragraph => 
        paragraph.trim().length > 20
      );
      return paragraphs.map(paragraph => this.cleanText(paragraph));
    }
  }

  isTitleOrHeading(text, context = '') {
    try {
      // Use NLP to detect title-like patterns
      const doc = compromise(text);
      
      // Check for title indicators using NLP
      const titleIndicators = [
        text.length < 100,
        doc.has('welcome|about|services|contact|home|products|solutions').found,
        /^[A-Z][^.!?]*$/.test(text), // Starts with capital, no sentence endings
        text.split(' ').length <= 8 && text.length > 10
      ];

      return titleIndicators.some(indicator => indicator);
    } catch (error) {
      console.log(`⚠️ Compromise error in isTitleOrHeading: ${error.message}`);
      // Fallback to basic title detection
      const titleIndicators = [
        text.length < 100,
        text.includes('Welcome') || text.includes('About') || text.includes('Services'),
        /^[A-Z][^.!?]*$/.test(text),
        text.split(' ').length <= 8 && text.length > 10
      ];
      return titleIndicators.some(indicator => indicator);
    }
  }

  getTextWeight(text, context = '') {
    let weight = 1;

    // Higher weight for titles/headings using NLP
    if (this.isTitleOrHeading(text, context)) {
      weight *= 3;
    }

    // Higher weight for shorter, punchy text (likely important)
    if (text.length < 200 && text.length > 20) {
      weight *= 1.5;
    }

    // Higher weight for text with numbers (likely factual)
    if (/\d/.test(text)) {
      weight *= 1.2;
    }

    // Higher weight for text with specific keywords using NLP
    try {
      const doc = compromise(text.toLowerCase());
      const importantKeywords = ['best', 'top', 'leading', 'popular', 'recommended', 'trusted', 'reliable'];
      const hasImportantKeywords = importantKeywords.some(keyword => 
        doc.has(keyword).found
      );
      if (hasImportantKeywords) {
        weight *= 1.3;
      }
    } catch (error) {
      console.log(`⚠️ Compromise error in getTextWeight: ${error.message}`);
      // Fallback to basic keyword checking
      const importantKeywords = ['best', 'top', 'leading', 'popular', 'recommended', 'trusted', 'reliable'];
      const hasImportantKeywords = importantKeywords.some(keyword => 
        text.toLowerCase().includes(keyword)
      );
      if (hasImportantKeywords) {
        weight *= 1.3;
      }
    }

    return weight;
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

  extractNamedEntities(text) {
    if (!text) return [];

    try {
      const doc = compromise(text);
      
      // Extract organizations, companies, people, places
      const organizations = doc.organizations().out('array');
      const companies = doc.companies().out('array');
      const people = doc.people().out('array');
      const places = doc.places().out('array');

      return [...organizations, ...companies, ...people, ...places];
    } catch (error) {
      console.log(`⚠️ Compromise error in extractNamedEntities: ${error.message}`);
      return [];
    }
  }

  getEntityConfidenceNLP(entity, context = '') {
    if (!entity) return 0;

    try {
      const doc = compromise(context);
      const entityDoc = compromise(entity);
      
      let confidence = 0.5; // Base confidence

      // Higher confidence for entities found in context
      if (doc.has(entity).found) {
        confidence += 0.3;
      }

      // Higher confidence for organization/company entities
      if (entityDoc.organizations().found || entityDoc.companies().found) {
        confidence += 0.2;
      }

      // Higher confidence for longer, more specific names
      if (entity.length > 8) {
        confidence += 0.1;
      }

      // Higher confidence for entities in important context
      if (this.isImportantContext(context)) {
        confidence += 0.1;
      }

      return Math.min(1.0, confidence);
    } catch (error) {
      console.log(`⚠️ Compromise error in getEntityConfidenceNLP: ${error.message}`);
      return 0.5; // Return base confidence on error
    }
  }

  isImportantContext(context) {
    if (!context) return false;

    try {
      const doc = compromise(context.toLowerCase());
      const importantKeywords = [
        'best', 'top', 'leading', 'popular', 'recommended', 'trusted', 'reliable',
        'alternative', 'competitor', 'similar', 'compare', 'vs', 'versus',
        'review', 'rating', 'score', 'rank', 'ranking', 'list'
      ];

      return importantKeywords.some(keyword => doc.has(keyword).found);
    } catch (error) {
      console.log(`⚠️ Compromise error in isImportantContext: ${error.message}`);
      // Fallback to basic keyword checking
      const importantKeywords = [
        'best', 'top', 'leading', 'popular', 'recommended', 'trusted', 'reliable',
        'alternative', 'competitor', 'similar', 'compare', 'vs', 'versus',
        'review', 'rating', 'score', 'rank', 'ranking', 'list'
      ];
      return importantKeywords.some(keyword => context.toLowerCase().includes(keyword));
    }
  }
}

module.exports = TextCleaner; 