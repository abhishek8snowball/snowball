class SEOScoreCalculator {
  constructor() {
    this.weights = {
      // Technical SEO (30%)
      title: 0.05,
      metaDescription: 0.05,
      canonical: 0.03,
      robots: 0.02,
      charset: 0.02,
      hasSchema: 0.03,
      hasOpenGraph: 0.02,
      hasTwitterCard: 0.02,
      hasLang: 0.02,
      hasSkipLink: 0.02,
      
      // Content & Structure (25%)
      h1Count: 0.03,
      h2Count: 0.02,
      h3Count: 0.02,
      wordCount: 0.05,
      linkCount: 0.03,
      internalLinks: 0.03,
      externalLinks: 0.02,
      
      // Performance (20%)
      performance: 0.20,
      
      // Mobile & Accessibility (15%)
      mobileScore: 0.08,
      accessibilityScore: 0.07,
      
      // Images & Media (10%)
      imageCount: 0.02,
      imagesWithoutAlt: 0.04,
      hasViewport: 0.02,
      hasResponsiveCSS: 0.02,
    };
  }

  calculateScore(scrapedData) {
    let totalScore = 0;
    const issues = [];
    const recommendations = [];

    // 1. Title Analysis
    const titleScore = this.analyzeTitle(scrapedData.title);
    totalScore += titleScore.score * this.weights.title;
    if (titleScore.issues.length > 0) {
      issues.push(...titleScore.issues);
    }
    if (titleScore.recommendations.length > 0) {
      recommendations.push(...titleScore.recommendations);
    }

    // 2. Meta Description Analysis
    const metaScore = this.analyzeMetaDescription(scrapedData.metaDescription);
    totalScore += metaScore.score * this.weights.metaDescription;
    if (metaScore.issues.length > 0) {
      issues.push(...metaScore.issues);
    }
    if (metaScore.recommendations.length > 0) {
      recommendations.push(...metaScore.recommendations);
    }

    // 3. Canonical URL Analysis
    const canonicalScore = this.analyzeCanonical(scrapedData.canonical);
    totalScore += canonicalScore.score * this.weights.canonical;
    if (canonicalScore.issues.length > 0) {
      issues.push(...canonicalScore.issues);
    }

    // 4. Robots Meta Analysis
    const robotsScore = this.analyzeRobots(scrapedData.robots);
    totalScore += robotsScore.score * this.weights.robots;
    if (robotsScore.issues.length > 0) {
      issues.push(...robotsScore.issues);
    }

    // 5. Charset Analysis
    const charsetScore = this.analyzeCharset(scrapedData.charset);
    totalScore += charsetScore.score * this.weights.charset;
    if (charsetScore.issues.length > 0) {
      issues.push(...charsetScore.issues);
    }

    // 6. Schema Markup Analysis
    const schemaScore = this.analyzeSchema(scrapedData.hasSchema);
    totalScore += schemaScore.score * this.weights.hasSchema;
    if (schemaScore.issues.length > 0) {
      issues.push(...schemaScore.issues);
    }

    // 7. Social Media Analysis
    const socialScore = this.analyzeSocialMedia(scrapedData.hasOpenGraph, scrapedData.hasTwitterCard);
    totalScore += socialScore.score * (this.weights.hasOpenGraph + this.weights.hasTwitterCard);
    if (socialScore.issues.length > 0) {
      issues.push(...socialScore.issues);
    }

    // 8. Language Declaration Analysis
    const langScore = this.analyzeLanguage(scrapedData.hasLang);
    totalScore += langScore.score * this.weights.hasLang;
    if (langScore.issues.length > 0) {
      issues.push(...langScore.issues);
    }

    // 9. Skip Link Analysis
    const skipLinkScore = this.analyzeSkipLink(scrapedData.hasSkipLink);
    totalScore += skipLinkScore.score * this.weights.hasSkipLink;
    if (skipLinkScore.issues.length > 0) {
      issues.push(...skipLinkScore.issues);
    }

    // 10. Heading Structure Analysis
    const headingScore = this.analyzeHeadings(scrapedData);
    totalScore += headingScore.score * (this.weights.h1Count + this.weights.h2Count + this.weights.h3Count);
    if (headingScore.issues.length > 0) {
      issues.push(...headingScore.issues);
    }

    // 11. Content Analysis
    const contentScore = this.analyzeContent(scrapedData.wordCount);
    totalScore += contentScore.score * this.weights.wordCount;
    if (contentScore.issues.length > 0) {
      issues.push(...contentScore.issues);
    }

    // 12. Link Analysis
    const linkScore = this.analyzeLinks(scrapedData);
    totalScore += linkScore.score * (this.weights.linkCount + this.weights.internalLinks + this.weights.externalLinks);
    if (linkScore.issues.length > 0) {
      issues.push(...linkScore.issues);
    }

    // 13. Performance Analysis
    const performanceScore = this.analyzePerformance(scrapedData.performance);
    totalScore += performanceScore.score * this.weights.performance;
    if (performanceScore.issues.length > 0) {
      issues.push(...performanceScore.issues);
    }

    // 14. Mobile Responsiveness Analysis
    const mobileScore = this.analyzeMobileResponsiveness(scrapedData.mobileScore, scrapedData);
    totalScore += mobileScore.score * this.weights.mobileScore;
    if (mobileScore.issues.length > 0) {
      issues.push(...mobileScore.issues);
    }

    // 15. Accessibility Analysis
    const accessibilityScore = this.analyzeAccessibility(scrapedData.accessibilityScore);
    totalScore += accessibilityScore.score * this.weights.accessibilityScore;
    if (accessibilityScore.issues.length > 0) {
      issues.push(...accessibilityScore.issues);
    }

    // 16. Image Analysis
    const imageScore = this.analyzeImages(scrapedData);
    totalScore += imageScore.score * (this.weights.imageCount + this.weights.imagesWithoutAlt);
    if (imageScore.issues.length > 0) {
      issues.push(...imageScore.issues);
    }

    // 17. Viewport Analysis
    const viewportScore = this.analyzeViewport(scrapedData.hasViewport, scrapedData.hasResponsiveCSS);
    totalScore += viewportScore.score * (this.weights.hasViewport + this.weights.hasResponsiveCSS);
    if (viewportScore.issues.length > 0) {
      issues.push(...viewportScore.issues);
    }

    // Calculate final score (0-100)
    const finalScore = Math.round(Math.min(100, Math.max(0, totalScore * 100)));

    // Determine status based on score
    let status = 'excellent';
    if (finalScore < 60) status = 'needs-improvement';
    else if (finalScore < 80) status = 'good';
    else if (finalScore < 90) status = 'very-good';

    return {
      score: finalScore,
      status,
      issues,
      recommendations,
      details: {
        title: titleScore,
        metaDescription: metaScore,
        canonical: canonicalScore,
        robots: robotsScore,
        charset: charsetScore,
        schema: schemaScore,
        social: socialScore,
        language: langScore,
        skipLink: skipLinkScore,
        headings: headingScore,
        content: contentScore,
        links: linkScore,
        performance: performanceScore,
        mobile: mobileScore,
        accessibility: accessibilityScore,
        images: imageScore,
        viewport: viewportScore
      }
    };
  }

  analyzeTitle(title) {
    const issues = [];
    const recommendations = [];
    let score = 0;

    if (!title) {
      issues.push({ type: 'error', category: 'meta', message: 'Missing title tag', priority: 'high' });
      recommendations.push('Add a descriptive title tag');
    } else {
      score += 50; // Base score for having a title
      
      if (title.length < 30) {
        issues.push({ type: 'warning', category: 'meta', message: 'Title is too short', priority: 'medium' });
        recommendations.push('Make title more descriptive (30-60 characters)');
      } else if (title.length > 60) {
        issues.push({ type: 'warning', category: 'meta', message: 'Title is too long', priority: 'medium' });
        recommendations.push('Shorten title to under 60 characters');
      } else {
        score += 50; // Perfect length
      }
    }

    return { score: score / 100, issues, recommendations };
  }

  analyzeMetaDescription(description) {
    const issues = [];
    const recommendations = [];
    let score = 0;

    if (!description) {
      issues.push({ type: 'warning', category: 'meta', message: 'Missing meta description', priority: 'medium' });
      recommendations.push('Add a compelling meta description');
    } else {
      score += 50; // Base score for having description
      
      if (description.length < 120) {
        issues.push({ type: 'warning', category: 'meta', message: 'Meta description is too short', priority: 'low' });
        recommendations.push('Make description more detailed (120-160 characters)');
      } else if (description.length > 160) {
        issues.push({ type: 'warning', category: 'meta', message: 'Meta description is too long', priority: 'low' });
        recommendations.push('Shorten description to under 160 characters');
      } else {
        score += 50; // Perfect length
      }
    }

    return { score: score / 100, issues, recommendations };
  }

  analyzeCanonical(canonical) {
    const issues = [];
    let score = 0;

    if (!canonical) {
      issues.push({ type: 'warning', category: 'technical', message: 'Missing canonical URL', priority: 'medium' });
    } else {
      score = 1; // Perfect score
    }

    return { score, issues };
  }

  analyzeRobots(robots) {
    const issues = [];
    let score = 0;

    if (!robots) {
      issues.push({ type: 'info', category: 'technical', message: 'No robots meta tag found', priority: 'low' });
      score = 0.8; // Not critical but good to have
    } else {
      score = 1; // Perfect score
    }

    return { score, issues };
  }

  analyzeCharset(charset) {
    const issues = [];
    let score = 0;

    if (!charset) {
      issues.push({ type: 'warning', category: 'technical', message: 'Missing charset declaration', priority: 'medium' });
    } else {
      score = 1; // Perfect score
    }

    return { score, issues };
  }

  analyzeSchema(hasSchema) {
    const issues = [];
    let score = 0;

    if (!hasSchema) {
      issues.push({ type: 'info', category: 'technical', message: 'No schema markup found', priority: 'low' });
      score = 0.7; // Not critical but beneficial
    } else {
      score = 1; // Perfect score
    }

    return { score, issues };
  }

  analyzeSocialMedia(hasOpenGraph, hasTwitterCard) {
    const issues = [];
    let score = 0;

    if (!hasOpenGraph && !hasTwitterCard) {
      issues.push({ type: 'info', category: 'social', message: 'No social media meta tags found', priority: 'low' });
      score = 0.6; // Not critical but beneficial
    } else if (hasOpenGraph && hasTwitterCard) {
      score = 1; // Perfect score
    } else {
      score = 0.8; // Partial implementation
    }

    return { score, issues };
  }

  analyzeLanguage(hasLang) {
    const issues = [];
    let score = 0;

    if (!hasLang) {
      issues.push({ type: 'warning', category: 'accessibility', message: 'Missing language declaration', priority: 'medium' });
    } else {
      score = 1; // Perfect score
    }

    return { score, issues };
  }

  analyzeSkipLink(hasSkipLink) {
    const issues = [];
    let score = 0;

    if (!hasSkipLink) {
      issues.push({ type: 'info', category: 'accessibility', message: 'No skip link found', priority: 'low' });
      score = 0.8; // Not critical but good for accessibility
    } else {
      score = 1; // Perfect score
    }

    return { score, issues };
  }

  analyzeHeadings(data) {
    const issues = [];
    let score = 0;

    // Check for H1
    if (data.h1Count === 0) {
      issues.push({ type: 'error', category: 'headings', message: 'Missing H1 tag', priority: 'high' });
    } else if (data.h1Count > 1) {
      issues.push({ type: 'warning', category: 'headings', message: 'Multiple H1 tags found', priority: 'medium' });
    } else {
      score += 0.4; // Good H1 structure
    }

    // Check for heading hierarchy
    if (data.h2Count > 0 || data.h3Count > 0) {
      score += 0.3; // Good heading hierarchy
    }

    // Check for excessive headings
    const totalHeadings = data.h1Count + data.h2Count + data.h3Count + data.h4Count + data.h5Count + data.h6Count;
    if (totalHeadings > 20) {
      issues.push({ type: 'warning', category: 'headings', message: 'Too many headings', priority: 'low' });
    }

    return { score, issues };
  }

  analyzeContent(wordCount) {
    const issues = [];
    let score = 0;

    if (wordCount < 300) {
      issues.push({ type: 'warning', category: 'content', message: 'Content is too short', priority: 'medium' });
      score = 0.3;
    } else if (wordCount < 600) {
      score = 0.6;
    } else {
      score = 1; // Good content length
    }

    return { score, issues };
  }

  analyzeLinks(data) {
    const issues = [];
    let score = 0;

    // Check for internal links
    if (data.internalLinks === 0) {
      issues.push({ type: 'warning', category: 'links', message: 'No internal links found', priority: 'medium' });
    } else {
      score += 0.5;
    }

    // Check for external links
    if (data.externalLinks > 0) {
      score += 0.3;
    }

    // Check for total links
    if (data.linkCount > 0) {
      score += 0.2;
    }

    return { score, issues };
  }

  analyzePerformance(performance) {
    const issues = [];
    let score = 0;

    if (!performance || Object.keys(performance).length === 0) {
      issues.push({ type: 'warning', category: 'speed', message: 'Performance metrics unavailable', priority: 'medium' });
      score = 0.5;
    } else {
      // Basic performance scoring based on available metrics
      score = 0.8; // Default good score
    }

    return { score, issues };
  }

  analyzeMobileResponsiveness(mobileScore, data) {
    const issues = [];
    let score = mobileScore.score / 100;

    if (mobileScore.issues.length > 0) {
      mobileScore.issues.forEach(issue => {
        issues.push({ 
          type: 'warning', 
          category: 'mobile', 
          message: `Mobile issue: ${issue}`, 
          priority: 'medium' 
        });
      });
    }

    if (!data.hasViewport) {
      issues.push({ type: 'error', category: 'mobile', message: 'Missing viewport meta tag', priority: 'high' });
    }

    return { score, issues };
  }

  analyzeAccessibility(accessibilityScore) {
    const issues = [];
    let score = accessibilityScore.score / 100;

    if (accessibilityScore.issues.length > 0) {
      accessibilityScore.issues.forEach(issue => {
        issues.push({ 
          type: 'warning', 
          category: 'accessibility', 
          message: `Accessibility issue: ${issue}`, 
          priority: 'medium' 
        });
      });
    }

    return { score, issues };
  }

  analyzeImages(data) {
    const issues = [];
    let score = 0;

    if (data.imageCount === 0) {
      score = 0.5; // No images is not necessarily bad
    } else {
      score += 0.3; // Base score for having images
      
      if (data.imagesWithoutAlt > 0) {
        issues.push({ 
          type: 'warning', 
          category: 'accessibility', 
          message: `${data.imagesWithoutAlt} images missing alt text`, 
          priority: 'medium' 
        });
        score -= (data.imagesWithoutAlt / data.imageCount) * 0.3;
      } else {
        score += 0.7; // Perfect alt text
      }
    }

    return { score, issues };
  }

  analyzeViewport(hasViewport, hasResponsiveCSS) {
    const issues = [];
    let score = 0;

    if (!hasViewport) {
      issues.push({ type: 'error', category: 'mobile', message: 'Missing viewport meta tag', priority: 'high' });
    } else {
      score += 0.6;
    }

    if (hasResponsiveCSS) {
      score += 0.4;
    } else {
      issues.push({ type: 'warning', category: 'mobile', message: 'No responsive CSS detected', priority: 'medium' });
    }

    return { score, issues };
  }
}

module.exports = SEOScoreCalculator; 