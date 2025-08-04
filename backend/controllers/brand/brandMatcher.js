class BrandMatcher {
  constructor() {
    this.brandAliases = new Map();
    this.initializeBrandAliases();
  }

  initializeBrandAliases() {
    // Define brand aliases for common companies
    this.brandAliases.set('google', ['google', 'google inc', 'google llc', 'google corporation', 'alphabet', 'alphabet inc']);
    this.brandAliases.set('microsoft', ['microsoft', 'microsoft corporation', 'ms', 'msft']);
    this.brandAliases.set('apple', ['apple', 'apple inc', 'apple computer', 'iphone', 'ipad', 'mac']);
    this.brandAliases.set('amazon', ['amazon', 'amazon.com', 'amazon inc', 'aws', 'amazon web services']);
    this.brandAliases.set('facebook', ['facebook', 'meta', 'meta platforms', 'instagram', 'whatsapp']);
    this.brandAliases.set('meta', ['meta', 'meta platforms', 'facebook', 'instagram', 'whatsapp']);
    this.brandAliases.set('twitter', ['twitter', 'x', 'x corp', 'tweet']);
    this.brandAliases.set('linkedin', ['linkedin', 'linkedin corporation', 'microsoft linkedin']);
    this.brandAliases.set('netflix', ['netflix', 'netflix inc', 'netflix streaming']);
    this.brandAliases.set('spotify', ['spotify', 'spotify technology', 'spotify music']);
    this.brandAliases.set('uber', ['uber', 'uber technologies', 'uber eats']);
    this.brandAliases.set('lyft', ['lyft', 'lyft inc', 'lyft ride']);
    this.brandAliases.set('airbnb', ['airbnb', 'airbnb inc', 'air bed and breakfast']);
    this.brandAliases.set('slack', ['slack', 'slack technologies', 'salesforce slack']);
    this.brandAliases.set('zoom', ['zoom', 'zoom video communications', 'zoom meeting']);
    this.brandAliases.set('dropbox', ['dropbox', 'dropbox inc', 'dropbox storage']);
    this.brandAliases.set('salesforce', ['salesforce', 'salesforce.com', 'salesforce inc', 'sfdc']);
    this.brandAliases.set('adobe', ['adobe', 'adobe inc', 'adobe systems', 'photoshop', 'illustrator']);
    this.brandAliases.set('oracle', ['oracle', 'oracle corporation', 'oracle database']);
    this.brandAliases.set('ibm', ['ibm', 'international business machines', 'ibm corporation']);
    this.brandAliases.set('intel', ['intel', 'intel corporation', 'intel processor']);
    this.brandAliases.set('cisco', ['cisco', 'cisco systems', 'cisco networking']);
    this.brandAliases.set('dell', ['dell', 'dell technologies', 'dell computer']);
    this.brandAliases.set('hp', ['hp', 'hewlett packard', 'hp inc', 'hewlett packard enterprise']);
    this.brandAliases.set('samsung', ['samsung', 'samsung electronics', 'samsung mobile']);
    this.brandAliases.set('sony', ['sony', 'sony corporation', 'sony electronics']);
    this.brandAliases.set('nike', ['nike', 'nike inc', 'nike shoes']);
    this.brandAliases.set('adidas', ['adidas', 'adidas ag', 'adidas sportswear']);
    this.brandAliases.set('coca-cola', ['coca-cola', 'coca cola', 'coke', 'coca cola company']);
    this.brandAliases.set('pepsi', ['pepsi', 'pepsico', 'pepsi cola']);
    this.brandAliases.set('mcdonalds', ['mcdonalds', 'mcdonalds corporation', 'mcdonalds restaurant']);
    this.brandAliases.set('starbucks', ['starbucks', 'starbucks corporation', 'starbucks coffee']);
    this.brandAliases.set('walmart', ['walmart', 'walmart inc', 'walmart store']);
    this.brandAliases.set('target', ['target', 'target corporation', 'target store']);
    this.brandAliases.set('home depot', ['home depot', 'the home depot', 'home depot store']);
    this.brandAliases.set('lowes', ['lowes', 'lowes companies', 'lowes home improvement']);
    this.brandAliases.set('best buy', ['best buy', 'best buy co', 'best buy store']);
    
    // Add specific aliases for the brands we're analyzing
    this.brandAliases.set('oneshot.ai', ['oneshot.ai', 'oneshot', 'one shot', 'one shot ai', 'oneshot ai', 'one-shot', 'one-shot.ai']);
    this.brandAliases.set('salesforce', ['salesforce', 'salesforce.com', 'salesforce inc', 'sfdc', 'sales force']);
    this.brandAliases.set('hubspot', ['hubspot', 'hub spot', 'hubspot inc', 'hub spot inc']);
    this.brandAliases.set('outreach', ['outreach', 'outreach.io', 'outreach inc']);
    this.brandAliases.set('zoominfo', ['zoominfo', 'zoom info', 'zoom.info', 'zoominfo inc', 'zoom info inc']);
    this.brandAliases.set('discoverorg', ['discoverorg', 'discover org', 'discoverorg inc', 'discover org inc']);
    
    // Add food delivery brand aliases
    this.brandAliases.set('swiggy', ['swiggy', 'swiggy.com', 'swiggy.in', 'swiggy app', 'swiggy food delivery']);
    this.brandAliases.set('zomato', ['zomato', 'zomato.com', 'zomato.in', 'zomato app', 'zomato food delivery']);
    this.brandAliases.set('uber eats', ['uber eats', 'ubereats', 'uber eats app', 'uber food delivery']);
    this.brandAliases.set('foodpanda', ['foodpanda', 'foodpanda.com', 'foodpanda app', 'food panda']);
    this.brandAliases.set('dunzo', ['dunzo', 'dunzo.com', 'dunzo app', 'dunzo delivery']);
    this.brandAliases.set('bigbasket', ['bigbasket', 'bigbasket.com', 'big basket', 'bigbasket grocery']);
    this.brandAliases.set('grofers', ['grofers', 'grofers.com', 'grofer', 'grofers grocery']);
    this.brandAliases.set('blinkit', ['blinkit', 'blinkit.com', 'blink it', 'blinkit grocery']);
    this.brandAliases.set('zepto', ['zepto', 'zepto.in', 'zepto grocery', 'zepto delivery']);
  }

  addBrandAliases(brandName, aliases) {
    const normalizedBrand = this.normalizeBrandName(brandName);
    const normalizedAliases = aliases.map(alias => this.normalizeBrandName(alias));
    
    if (!this.brandAliases.has(normalizedBrand)) {
      this.brandAliases.set(normalizedBrand, [normalizedBrand, ...normalizedAliases]);
    } else {
      // Add new aliases to existing brand
      const existingAliases = this.brandAliases.get(normalizedBrand);
      normalizedAliases.forEach(alias => {
        if (!existingAliases.includes(alias)) {
          existingAliases.push(alias);
        }
      });
    }
  }

  addDomainBrand(domain, brandName) {
    const normalizedBrand = this.normalizeBrandName(brandName);
    const domainVariations = [
      brandName.toLowerCase(),
      domain.replace(/\.(com|org|net|io|co|tech|app|ai)$/, ''),
      domain,
      `${brandName.toLowerCase()} ${domain}`,
      `${brandName.toLowerCase()} platform`,
      `${brandName.toLowerCase()} tool`,
      `${brandName.toLowerCase()} service`
    ];

    this.brandAliases.set(normalizedBrand, [...new Set(domainVariations)]);
  }

  normalizeBrandName(brandName) {
    if (!brandName) return '';
    
    return brandName
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  matchEntityToBrand(entity, targetBrands) {
    if (!entity || !targetBrands || targetBrands.length === 0) {
      return null;
    }

    const normalizedEntity = this.normalizeBrandName(entity);
    const matches = [];

    console.log(`🔍 Matching entity "${entity}" (normalized: "${normalizedEntity}") against brands: ${targetBrands.join(', ')}`);

    // Check against target brands and their aliases
    targetBrands.forEach(brand => {
      const normalizedBrand = this.normalizeBrandName(brand);
      
      console.log(`  Checking against brand: "${brand}" (normalized: "${normalizedBrand}")`);
      
      // Direct match
      if (normalizedEntity === normalizedBrand) {
        console.log(`  ✅ Exact match found for "${entity}" → "${brand}"`);
        matches.push({
          brand: brand,
          entity: entity,
          confidence: 1.0,
          matchType: 'exact'
        });
        return;
      }

      // Check aliases
      const aliases = this.brandAliases.get(normalizedBrand) || [normalizedBrand];
      console.log(`  Aliases for "${brand}": ${aliases.join(', ')}`);
      
      aliases.forEach(alias => {
        if (normalizedEntity === alias) {
          console.log(`  ✅ Alias match found for "${entity}" → "${brand}" (via alias "${alias}")`);
          matches.push({
            brand: brand,
            entity: entity,
            confidence: 0.9,
            matchType: 'alias'
          });
          return;
        }
      });

      // Partial match with improved logic
      if (normalizedEntity.includes(normalizedBrand) || normalizedBrand.includes(normalizedEntity)) {
        const similarity = this.calculateSimilarity(normalizedEntity, normalizedBrand);
        if (similarity > 0.6) { // Lowered threshold for better matching
          console.log(`  ✅ Partial match found for "${entity}" → "${brand}" (similarity: ${similarity.toFixed(2)})`);
          matches.push({
            brand: brand,
            entity: entity,
            confidence: similarity,
            matchType: 'partial'
          });
        }
      }

      // Word-based matching for multi-word brands
      const entityWords = normalizedEntity.split(' ');
      const brandWords = normalizedBrand.split(' ');
      
      if (entityWords.length > 1 || brandWords.length > 1) {
        const wordMatches = entityWords.filter(word => 
          brandWords.some(brandWord => 
            word === brandWord || 
            word.includes(brandWord) || 
            brandWord.includes(word)
          )
        );
        
        if (wordMatches.length > 0) {
          const wordSimilarity = wordMatches.length / Math.max(entityWords.length, brandWords.length);
          if (wordSimilarity > 0.5) {
            console.log(`  ✅ Word-based match found for "${entity}" → "${brand}" (word similarity: ${wordSimilarity.toFixed(2)})`);
            matches.push({
              brand: brand,
              entity: entity,
              confidence: wordSimilarity * 0.8, // Slightly lower confidence for word-based matches
              matchType: 'word-based'
            });
          }
        }
      }

      // Domain-based matching
      if (normalizedEntity.includes('.') || normalizedBrand.includes('.')) {
        const entityDomain = this.extractDomainFromEntity(normalizedEntity);
        const brandDomain = this.extractDomainFromEntity(normalizedBrand);
        
        if (entityDomain && brandDomain && entityDomain === brandDomain) {
          console.log(`  ✅ Domain match found for "${entity}" → "${brand}"`);
          matches.push({
            brand: brand,
            entity: entity,
            confidence: 0.85,
            matchType: 'domain'
          });
        }
      }
    });

    // Return the best match
    if (matches.length > 0) {
      const bestMatch = matches.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
      console.log(`  🎯 Best match: "${entity}" → "${bestMatch.brand}" (confidence: ${bestMatch.confidence.toFixed(2)})`);
      return bestMatch;
    }

    console.log(`  ❌ No match found for "${entity}"`);
    return null;
  }

  calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  extractDomainFromEntity(entity) {
    if (!entity) return null;
    
    // Extract domain part if it contains a dot
    if (entity.includes('.')) {
      const parts = entity.split('.');
      if (parts.length >= 2) {
        return parts[0].toLowerCase(); // Return the main domain part
      }
    }
    
    return null;
  }

  isBrandMention(entity, context = '') {
    if (!entity) return false;

    const normalizedEntity = this.normalizeBrandName(entity);
    
    // Check if it's a known brand
    for (const [brand, aliases] of this.brandAliases) {
      if (aliases.includes(normalizedEntity)) {
        return true;
      }
    }

    // Check for brand indicators in the entity itself
    const brandIndicators = [
      'inc', 'corp', 'corporation', 'company', 'co', 'llc', 'ltd', 'limited',
      'group', 'solutions', 'systems', 'technologies', 'tech', 'software',
      'services', 'consulting', 'partners', 'associates', 'enterprises',
      'industries', 'international', 'global', 'worldwide', 'digital',
      'online', 'web', 'internet', 'media', 'marketing', 'advertising',
      'agency', 'studio', 'lab', 'labs', 'works', 'factory', 'hub',
      'center', 'network', 'platform', 'marketplace', 'store', 'shop',
      'retail', 'e-commerce', 'commerce'
    ];

    const hasBrandIndicator = brandIndicators.some(indicator => 
      normalizedEntity.includes(indicator)
    );

    if (hasBrandIndicator) {
      return true;
    }

    // Check context for brand-related keywords
    if (context) {
      const brandKeywords = [
        'brand', 'company', 'firm', 'organization', 'business', 'enterprise',
        'platform', 'service', 'tool', 'software', 'app', 'application',
        'solution', 'system', 'technology', 'tech', 'digital', 'online'
      ];

      const hasBrandKeyword = brandKeywords.some(keyword => 
        context.toLowerCase().includes(keyword)
      );

      if (hasBrandKeyword) {
        return true;
      }
    }

    return false;
  }

  getBrandConfidence(entity, context = '') {
    if (!entity) return 0;

    let confidence = 0.3; // Base confidence

    const normalizedEntity = this.normalizeBrandName(entity);

    // Higher confidence for known brands
    for (const [brand, aliases] of this.brandAliases) {
      if (aliases.includes(normalizedEntity)) {
        confidence += 0.4;
        break;
      }
    }

    // Higher confidence for domain-like entities
    if (/\.(com|org|net|io|co|tech|app|ai|cloud)$/.test(normalizedEntity)) {
      confidence += 0.2;
    }

    // Higher confidence for entities with brand indicators
    const brandIndicators = ['inc', 'corp', 'llc', 'ltd', 'company', 'group', 'solutions', 'systems', 'technologies'];
    const hasBrandIndicator = brandIndicators.some(indicator => 
      normalizedEntity.includes(indicator)
    );
    if (hasBrandIndicator) {
      confidence += 0.15;
    }

    // Higher confidence for entities in important context
    if (context && this.isImportantContext(context)) {
      confidence += 0.1;
    }

    // Higher confidence for longer, more specific names
    if (normalizedEntity.length > 8) {
      confidence += 0.1;
    }

    return Math.min(1.0, confidence);
  }

  isImportantContext(context) {
    if (!context) return false;

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

module.exports = BrandMatcher;