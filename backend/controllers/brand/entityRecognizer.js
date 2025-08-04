const compromise = require('compromise');
const natural = require('natural');

class EntityRecognizer {
  constructor() {
    this.commonBrands = new Set([
      'google', 'microsoft', 'apple', 'amazon', 'facebook', 'meta', 'twitter', 'linkedin',
      'netflix', 'spotify', 'uber', 'lyft', 'airbnb', 'slack', 'zoom', 'dropbox',
      'salesforce', 'adobe', 'oracle', 'ibm', 'intel', 'cisco', 'dell', 'hp',
      'samsung', 'sony', 'nike', 'adidas', 'coca-cola', 'pepsi', 'mcdonalds',
      'starbucks', 'walmart', 'target', 'home depot', 'lowes', 'best buy'
    ]);

    this.brandIndicators = [
      'platform', 'service', 'tool', 'software', 'app', 'application',
      'solution', 'system', 'technology', 'tech', 'digital', 'online',
      'web', 'mobile', 'cloud', 'saas', 'api', 'sdk', 'framework'
    ];
  }

  extractEntities(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    try {
      const entities = new Set();
      const doc = compromise(text);

      // Extract organizations using NLP - with error handling
      try {
        const organizations = doc.organizations().out('array');
        organizations.forEach(org => {
          const cleaned = this.cleanEntity(org);
          if (cleaned && this.isValidEntity(cleaned)) {
            entities.add(cleaned);
          }
        });
      } catch (error) {
        console.log(`⚠️ Compromise organizations error: ${error.message}`);
      }

      // Extract companies using NLP - with error handling
      try {
        // Check if companies method exists
        if (typeof doc.companies === 'function') {
          const companies = doc.companies().out('array');
          companies.forEach(company => {
            const cleaned = this.cleanEntity(company);
            if (cleaned && this.isValidEntity(cleaned)) {
              entities.add(cleaned);
            }
          });
        } else {
          console.log(`⚠️ Compromise companies method not available`);
        }
      } catch (error) {
        console.log(`⚠️ Compromise companies error: ${error.message}`);
      }

      // Extract domain names using NLP - with error handling
      try {
        const urls = doc.urls().out('array');
        urls.forEach(url => {
          const domain = this.extractDomainFromUrl(url);
          if (domain) {
            const cleaned = this.cleanEntity(domain);
            if (cleaned && this.isValidEntity(cleaned)) {
              entities.add(cleaned);
            }
          }
        });
      } catch (error) {
        console.log(`⚠️ Compromise URLs error: ${error.message}`);
      }

      // Extract capitalized sequences that might be brands - with error handling
      try {
        const capitalizedSequences = doc.match('#ProperNoun+').out('array');
        capitalizedSequences.forEach(sequence => {
          const cleaned = this.cleanEntity(sequence);
          if (cleaned && this.isValidEntity(cleaned)) {
            entities.add(cleaned);
          }
        });
      } catch (error) {
        console.log(`⚠️ Compromise ProperNoun error: ${error.message}`);
      }

      // If no entities found with compromise, use fallback
      if (entities.size === 0) {
        console.log(`⚠️ No entities found with compromise, using fallback extraction`);
        const fallbackEntities = this.extractEntitiesFallback(text);
        fallbackEntities.forEach(entity => entities.add(entity));
      }

      // Always run fallback extraction as backup
      const fallbackEntities = this.extractEntitiesFallback(text);
      fallbackEntities.forEach(entity => entities.add(entity));

      return Array.from(entities);
    } catch (error) {
      console.log(`⚠️ Compromise error in extractEntities: ${error.message}`);
      // Fallback to basic entity extraction
      return this.extractEntitiesFallback(text);
    }
  }

  extractEntitiesFallback(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    const entities = new Set();

    // Enhanced regex patterns for better entity extraction
    const patterns = [
      // Company names with common suffixes
      /\b[A-Z][a-z]+ (Inc|Corp|Corporation|Company|Co|LLC|Ltd|Limited|Group|Solutions|Systems|Technologies|Tech|Software|Services|Consulting|Partners|Associates|Enterprises|Industries|International|Global|Worldwide|Digital|Online|Web|Internet|Media|Marketing|Advertising|Agency|Studio|Lab|Labs|Works|Factory|Hub|Center|Network|Platform|Marketplace|Store|Shop|Retail|E-commerce|Commerce)\b/g,
      // Two-word capitalized sequences
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
      // Domain names
      /\b[A-Za-z0-9-]+\.[A-Za-z]{2,}\b/g,
      // Three-word capitalized sequences
      /\b[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+\b/g,
      // Single capitalized words that might be brands
      /\b[A-Z][a-z]{2,}\b/g,
      // Words with common brand indicators
      /\b[A-Za-z]+(?:\.ai|\.com|\.io|\.co|\.tech|\.app|\.cloud|\.digital|\.online)\b/g,
      // Brand names in quotes
      /"([A-Z][a-zA-Z0-9\s&]+)"/g,
      // Brand names after "like" or "such as"
      /(?:like|such as|including|especially|notably)\s+([A-Z][a-zA-Z0-9\s&]+)/gi,
      // Brand names after "competitors" or "alternatives"
      /(?:competitors?|alternatives?|similar to|compared to)\s+([A-Z][a-zA-Z0-9\s&]+)/gi,
      // Brand names in comparison contexts
      /(?:vs\.?|versus|compared with)\s+([A-Z][a-zA-Z0-9\s&]+)/gi,
      // Brand names after "platforms" or "tools"
      /(?:platforms?|tools?|services?)\s+(?:like|such as|including)\s+([A-Z][a-zA-Z0-9\s&]+)/gi
    ];

    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = this.cleanEntity(match);
          if (cleaned && this.isValidEntity(cleaned)) {
            entities.add(cleaned);
          }
        });
      }
    });

    // Also look for specific brand mentions in the text
    const words = text.split(/\s+/);
    words.forEach(word => {
      const cleaned = this.cleanEntity(word);
      if (cleaned && this.isValidEntity(cleaned) && this.isLikelyBrand(cleaned)) {
        entities.add(cleaned);
      }
    });

    // Look for brand names in specific contexts
    const brandContextPatterns = [
      /(?:OneShot|oneshot|OneShot\.ai|oneshot\.ai)/gi,
      /(?:Salesforce|salesforce)/gi,
      /(?:HubSpot|hubspot)/gi,
      /(?:Outreach|outreach)/gi,
      /(?:ZoomInfo|zoominfo|Zoom\.info)/gi,
      /(?:DiscoverOrg|discoverorg)/gi,
      /(?:Google|google)/gi,
      // Food delivery brands
      /(?:Swiggy|swiggy)/gi,
      /(?:Zomato|zomato)/gi,
      /(?:Uber\s*Eats|ubereats|UberEats)/gi,
      /(?:Foodpanda|foodpanda|Food\s*Panda)/gi,
      /(?:Dunzo|dunzo)/gi,
      /(?:BigBasket|bigbasket|Big\s*Basket)/gi,
      /(?:Grofers|grofers)/gi,
      /(?:Blinkit|blinkit|Blink\s*It)/gi,
      /(?:Zepto|zepto)/gi,
      /(?:Microsoft|microsoft)/gi,
      /(?:Apple|apple)/gi,
      /(?:Amazon|amazon)/gi,
      /(?:Facebook|facebook)/gi,
      /(?:Twitter|twitter)/gi,
      /(?:LinkedIn|linkedin)/gi,
      /(?:Instagram|instagram)/gi,
      /(?:Netflix|netflix)/gi,
      /(?:Spotify|spotify)/gi,
      /(?:Uber|uber)/gi,
      /(?:Airbnb|airbnb)/gi,
      /(?:Slack|slack)/gi,
      /(?:Zoom|zoom)/gi,
      /(?:Dropbox|dropbox)/gi,
      /(?:Adobe|adobe)/gi,
      /(?:Oracle|oracle)/gi,
      /(?:IBM|ibm)/gi,
      /(?:Intel|intel)/gi,
      /(?:Cisco|cisco)/gi,
      /(?:Dell|dell)/gi,
      /(?:HP|hp)/gi,
      /(?:Samsung|samsung)/gi,
      /(?:Sony|sony)/gi,
      /(?:Nike|nike)/gi,
      /(?:Adidas|adidas)/gi,
      /(?:Coca-Cola|Coca Cola|coca-cola|coca cola)/gi,
      /(?:Pepsi|pepsi)/gi,
      /(?:McDonald's|McDonalds|mcdonald's|mcdonalds)/gi,
      /(?:Starbucks|starbucks)/gi,
      /(?:Walmart|walmart)/gi,
      /(?:Target|target)/gi,
      /(?:Home Depot|HomeDepot|home depot|homedepot)/gi,
      /(?:Lowe's|Lowes|lowes)/gi,
      /(?:Best Buy|BestBuy|best buy|bestbuy)/gi
    ];

    brandContextPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = this.cleanEntity(match);
          if (cleaned && this.isValidEntity(cleaned)) {
            entities.add(cleaned);
          }
        });
      }
    });

    return Array.from(entities);
  }

  cleanEntity(entity) {
    if (!entity) return null;

    try {
      // Use compromise for better entity cleaning
      const doc = compromise(entity);
      
      // Remove common words that aren't brand names
      const commonWords = [
        'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
        'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
        'after', 'above', 'below', 'between', 'among', 'within', 'without',
        'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be',
        'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
        'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall',
        'best', 'top', 'leading', 'popular', 'recommended', 'trusted', 'reliable',
        'alternative', 'competitor', 'similar', 'compare', 'vs', 'versus',
        'review', 'rating', 'score', 'rank', 'ranking', 'list', 'choice',
        'preferred', 'favorite', 'go-to', 'primary', 'main', 'major'
      ];

      let cleaned = doc.normalize().text().toLowerCase().trim();
      
      // Remove common words from the beginning and end
      const words = cleaned.split(' ');
      const filteredWords = words.filter(word => 
        word.length > 2 && !commonWords.includes(word)
      );

      if (filteredWords.length === 0) return null;

      return filteredWords.join(' ');
    } catch (error) {
      console.log(`⚠️ Compromise error in cleanEntity: ${error.message}`);
      // Fallback to basic cleaning
      if (!entity) return null;
      
      const commonWords = [
        'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
        'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
        'after', 'above', 'below', 'between', 'among', 'within', 'without',
        'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be',
        'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
        'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall',
        'best', 'top', 'leading', 'popular', 'recommended', 'trusted', 'reliable',
        'alternative', 'competitor', 'similar', 'compare', 'vs', 'versus',
        'review', 'rating', 'score', 'rank', 'ranking', 'list', 'choice',
        'preferred', 'favorite', 'go-to', 'primary', 'main', 'major'
      ];

      let cleaned = entity.toLowerCase().trim();
      
      const words = cleaned.split(' ');
      const filteredWords = words.filter(word => 
        word.length > 2 && !commonWords.includes(word)
      );

      if (filteredWords.length === 0) return null;

      return filteredWords.join(' ');
    }
  }

  extractDomainFromUrl(url) {
    if (!url) return null;

    try {
      // Remove protocol and www
      let domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
      
      // Extract the main part before the TLD
      const parts = domain.split('.');
      if (parts.length >= 2) {
        return parts[0]; // Return the main domain part
      }

      return domain;
    } catch (error) {
      console.log(`⚠️ Error extracting domain from URL: ${error.message}`);
      return null;
    }
  }

  isValidEntity(entity) {
    if (!entity || entity.length < 3) return false;

    // Must have at least 3 characters
    if (entity.length < 3) return false;

    // Must not be just numbers
    if (/^\d+$/.test(entity)) return false;

    // Must not be just common words
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
    if (commonWords.includes(entity.toLowerCase())) return false;

    // Must not be just punctuation
    if (/^[^\w]+$/.test(entity)) return false;

    return true;
  }

  isLikelyBrand(entity) {
    if (!entity) return false;

    const normalized = entity.toLowerCase();

    // Check if it's a known brand
    if (this.commonBrands.has(normalized)) {
      return true;
    }

    try {
      // Use compromise to check for brand indicators
      const doc = compromise(normalized);
      
      // Check for brand indicators
      const hasBrandIndicator = this.brandIndicators.some(indicator => 
        doc.has(indicator).found
      );

      // Check for domain-like patterns
      const hasDomainPattern = /\.(com|org|net|io|co|tech|app|ai|cloud)$/.test(normalized);

      // Check for company suffixes using NLP
      const companySuffixes = ['inc', 'corp', 'llc', 'ltd', 'co', 'company', 'group', 'solutions', 'systems', 'technologies'];
      const hasCompanySuffix = companySuffixes.some(suffix => 
        doc.has(suffix).found
      );

      return hasBrandIndicator || hasDomainPattern || hasCompanySuffix;
    } catch (error) {
      console.log(`⚠️ Compromise error in isLikelyBrand: ${error.message}`);
      // Fallback to basic brand detection
      const hasBrandIndicator = this.brandIndicators.some(indicator => 
        normalized.includes(indicator)
      );
      const hasDomainPattern = /\.(com|org|net|io|co|tech|app|ai|cloud)$/.test(normalized);
      const companySuffixes = ['inc', 'corp', 'llc', 'ltd', 'co', 'company', 'group', 'solutions', 'systems', 'technologies'];
      const hasCompanySuffix = companySuffixes.some(suffix => 
        normalized.includes(suffix)
      );
      return hasBrandIndicator || hasDomainPattern || hasCompanySuffix;
    }
  }

  getEntityConfidence(entity, context = '') {
    let confidence = 0.5; // Base confidence

    const normalized = entity.toLowerCase();

    // Higher confidence for known brands
    if (this.commonBrands.has(normalized)) {
      confidence += 0.3;
    }

    // Higher confidence for domain-like entities
    if (/\.(com|org|net|io|co|tech|app|ai|cloud)$/.test(normalized)) {
      confidence += 0.2;
    }

    try {
      // Higher confidence for entities with brand indicators using NLP
      const doc = compromise(normalized);
      const hasBrandIndicator = this.brandIndicators.some(indicator => 
        doc.has(indicator).found
      );
      if (hasBrandIndicator) {
        confidence += 0.15;
      }
    } catch (error) {
      console.log(`⚠️ Compromise error in getEntityConfidence: ${error.message}`);
      // Fallback to basic brand indicator checking
      const hasBrandIndicator = this.brandIndicators.some(indicator => 
        normalized.includes(indicator)
      );
      if (hasBrandIndicator) {
        confidence += 0.15;
      }
    }

    // Higher confidence for entities in important context
    if (context && this.isImportantContext(context)) {
      confidence += 0.1;
    }

    // Higher confidence for longer, more specific names
    if (entity.length > 8) {
      confidence += 0.1;
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
        'review', 'rating', 'score', 'rank', 'ranking', 'list'
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
        'review', 'rating', 'score', 'rank', 'ranking', 'list'
      ];
      return importantKeywords.some(keyword => 
        context.toLowerCase().includes(keyword)
      );
    }
  }

  // New NLP-based methods
  extractNamedEntitiesNLP(text) {
    if (!text) return [];

    try {
      const doc = compromise(text);
      
      // Extract all named entities using NLP
      const entities = [
        ...doc.organizations().out('array'),
        ...doc.companies().out('array'),
        ...doc.people().out('array'),
        ...doc.places().out('array')
      ];

      return entities.map(entity => ({
        text: entity,
        type: this.getEntityType(entity),
        confidence: this.getEntityConfidence(entity, text)
      }));
    } catch (error) {
      console.log(`⚠️ Compromise error in extractNamedEntitiesNLP: ${error.message}`);
      return [];
    }
  }

  getEntityType(entity) {
    try {
      const doc = compromise(entity);
      
      if (doc.organizations().found) return 'organization';
      if (doc.companies().found) return 'company';
      if (doc.people().found) return 'person';
      if (doc.places().found) return 'place';
      
      return 'unknown';
    } catch (error) {
      console.log(`⚠️ Compromise error in getEntityType: ${error.message}`);
      return 'unknown';
    }
  }

  extractDomainSpecificEntities(text, targetDomain, brandName) {
    const entities = new Set();

    // Look for domain variations
    const domainBase = targetDomain.replace(/\.(com|org|net|io|co|tech|app|ai)$/, '');
    const patterns = [
      new RegExp(`\\b${domainBase}\\b`, 'gi'),
      new RegExp(`\\b${brandName}\\b`, 'gi'),
      new RegExp(`\\b${domainBase}\\.(com|org|net|io|co|tech|app|ai)\\b`, 'gi'),
      new RegExp(`\\b${brandName}\\s+(platform|tool|service|app|software)\\b`, 'gi')
    ];

    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => entities.add(match.toLowerCase()));
      }
    });

    return Array.from(entities);
  }
}

module.exports = EntityRecognizer;