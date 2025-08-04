const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');

class WebsiteScraper {
  constructor() {
    this.browser = null;
  }

  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-images',
          '--disable-javascript',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-field-trial-config',
          '--disable-ipc-flooding-protection',
          '--disable-hang-monitor',
          '--disable-prompt-on-repost',
          '--disable-client-side-phishing-detection',
          '--disable-component-extensions-with-background-pages',
          '--disable-default-apps',
          '--disable-sync',
          '--disable-translate',
          '--hide-scrollbars',
          '--mute-audio',
          '--no-default-browser-check',
          '--safebrowsing-disable-auto-update',
          '--disable-background-networking',
          '--disable-default-apps',
          '--disable-extensions',
          '--disable-sync',
          '--disable-translate',
          '--hide-scrollbars',
          '--metrics-recording-only',
          '--mute-audio',
          '--no-first-run',
          '--safebrowsing-disable-auto-update',
          '--ignore-certificate-errors',
          '--ignore-ssl-errors',
          '--ignore-certificate-errors-spki-list'
        ]
      });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrapeWebsite(url) {
    try {
      // Try Puppeteer first
      try {
        await this.init();
        const page = await this.browser.newPage();
      
      // Set user agent to avoid blocking
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });
      
      console.log(`🌐 Scraping website: ${url}`);
      
      // Navigate to the page
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Get page content
      const html = await page.content();
      const $ = cheerio.load(html);

      // Extract SEO data
      const seoData = {
        url: url,
        title: $('title').text().trim(),
        metaDescription: $('meta[name="description"]').attr('content') || '',
        metaKeywords: $('meta[name="keywords"]').attr('content') || '',
        canonical: $('link[rel="canonical"]').attr('href') || '',
        robots: $('meta[name="robots"]').attr('content') || '',
        viewport: $('meta[name="viewport"]').attr('content') || '',
        charset: $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content') || '',
        
        // Headings
        h1Count: $('h1').length,
        h2Count: $('h2').length,
        h3Count: $('h3').length,
        h4Count: $('h4').length,
        h5Count: $('h5').length,
        h6Count: $('h6').length,
        
        // Images
        imageCount: $('img').length,
        imagesWithoutAlt: $('img:not([alt])').length,
        
        // Links
        linkCount: $('a').length,
        internalLinks: $('a[href^="/"], a[href^="' + url + '"]').length,
        externalLinks: $('a[href^="http"]').length,
        
        // Content
        wordCount: $('body').text().trim().split(/\s+/).length,
        
        // Schema markup
        hasSchema: $('[itemtype]').length > 0 || $('script[type="application/ld+json"]').length > 0,
        
        // Social media
        hasOpenGraph: $('meta[property^="og:"]').length > 0,
        hasTwitterCard: $('meta[name^="twitter:"]').length > 0,
        
        // Performance indicators
        scriptCount: $('script').length,
        cssCount: $('link[rel="stylesheet"]').length,
        
        // Accessibility
        hasLang: $('html[lang]').length > 0,
        hasSkipLink: $('a[href^="#"]').filter((i, el) => $(el).text().toLowerCase().includes('skip')).length > 0,
        
        // Mobile responsiveness indicators
        hasViewport: $('meta[name="viewport"]').length > 0,
        hasResponsiveCSS: $('link[rel="stylesheet"][media*="max-width"]').length > 0 || $('link[rel="stylesheet"][media*="min-width"]').length > 0,
      };

      // Get performance metrics
      const performanceMetrics = await this.getPerformanceMetrics(page);
      
      // Get mobile responsiveness score
      const mobileScore = await this.getMobileResponsivenessScore(page);
      
      // Get accessibility score
      const accessibilityScore = await this.getAccessibilityScore(page);

        await page.close();
        
        return {
          ...seoData,
          performance: performanceMetrics,
          mobileScore,
          accessibilityScore
        };
        
      } catch (puppeteerError) {
        console.log('⚠️ Puppeteer failed, falling back to axios:', puppeteerError.message);
        return await this.scrapeWithAxios(url);
      }
      
    } catch (error) {
      console.error('❌ Error scraping website:', error);
      throw error;
    }
  }

  async getPerformanceMetrics(page) {
    try {
      // Get basic performance metrics
      const metrics = await page.metrics();
      
      // Get resource timing
      const resourceTiming = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        };
      });

      return {
        ...metrics,
        ...resourceTiming
      };
    } catch (error) {
      console.error('❌ Error getting performance metrics:', error);
      return {};
    }
  }

  async getMobileResponsivenessScore(page) {
    try {
      // Set mobile viewport
      await page.setViewport({ width: 375, height: 667 });
      
      // Check for mobile-specific issues
      const mobileIssues = await page.evaluate(() => {
        const issues = [];
        
        // Check for horizontal scrolling
        const bodyWidth = document.body.scrollWidth;
        const viewportWidth = window.innerWidth;
        if (bodyWidth > viewportWidth) {
          issues.push('horizontal-scroll');
        }
        
        // Check for small text
        const smallText = document.querySelectorAll('*').length;
        const computedStyles = getComputedStyle(document.body);
        const fontSize = parseInt(computedStyles.fontSize);
        if (fontSize < 16) {
          issues.push('small-text');
        }
        
        // Check for touch targets
        const touchTargets = document.querySelectorAll('a, button, input, select, textarea');
        let smallTouchTargets = 0;
        touchTargets.forEach(element => {
          const rect = element.getBoundingClientRect();
          if (rect.width < 44 || rect.height < 44) {
            smallTouchTargets++;
          }
        });
        
        if (smallTouchTargets > 0) {
          issues.push('small-touch-targets');
        }
        
        return issues;
      });
      
      // Calculate score based on issues
      const baseScore = 100;
      const deductions = mobileIssues.length * 20;
      const score = Math.max(0, baseScore - deductions);
      
      return {
        score,
        issues: mobileIssues
      };
    } catch (error) {
      console.error('❌ Error getting mobile responsiveness score:', error);
      return { score: 0, issues: [] };
    }
  }

  async scrapeWithAxios(url) {
    try {
      console.log(`🌐 Scraping with axios fallback: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 30000
      });
      
      const html = response.data;
      const $ = cheerio.load(html);

      // Extract basic SEO data
      const seoData = {
        url: url,
        title: $('title').text().trim(),
        metaDescription: $('meta[name="description"]').attr('content') || '',
        metaKeywords: $('meta[name="keywords"]').attr('content') || '',
        canonical: $('link[rel="canonical"]').attr('href') || '',
        robots: $('meta[name="robots"]').attr('content') || '',
        viewport: $('meta[name="viewport"]').attr('content') || '',
        charset: $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content') || '',
        
        // Headings
        h1Count: $('h1').length,
        h2Count: $('h2').length,
        h3Count: $('h3').length,
        h4Count: $('h4').length,
        h5Count: $('h5').length,
        h6Count: $('h6').length,
        
        // Images
        imageCount: $('img').length,
        imagesWithoutAlt: $('img:not([alt])').length,
        
        // Links
        linkCount: $('a').length,
        internalLinks: $('a[href^="/"], a[href^="' + url + '"]').length,
        externalLinks: $('a[href^="http"]').length,
        
        // Content
        wordCount: $('body').text().trim().split(/\s+/).length,
        
        // Schema markup
        hasSchema: $('[itemtype]').length > 0 || $('script[type="application/ld+json"]').length > 0,
        
        // Social media
        hasOpenGraph: $('meta[property^="og:"]').length > 0,
        hasTwitterCard: $('meta[name^="twitter:"]').length > 0,
        
        // Performance indicators
        scriptCount: $('script').length,
        cssCount: $('link[rel="stylesheet"]').length,
        
        // Accessibility
        hasLang: $('html[lang]').length > 0,
        hasSkipLink: $('a[href^="#"]').filter((i, el) => $(el).text().toLowerCase().includes('skip')).length > 0,
        
        // Mobile responsiveness indicators
        hasViewport: $('meta[name="viewport"]').length > 0,
        hasResponsiveCSS: $('link[rel="stylesheet"][media*="max-width"]').length > 0 || $('link[rel="stylesheet"][media*="min-width"]').length > 0,
      };

      return {
        ...seoData,
        performance: {},
        mobileScore: { score: 0, issues: [] },
        accessibilityScore: { score: 0, issues: [] }
      };
      
    } catch (error) {
      console.error('❌ Error scraping with axios:', error);
      throw error;
    }
  }

  async getAccessibilityScore(page) {
    try {
      const accessibilityData = await page.evaluate(() => {
        const issues = [];
        
        // Check for alt text on images
        const images = document.querySelectorAll('img');
        const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
        if (imagesWithoutAlt.length > 0) {
          issues.push('missing-alt-text');
        }
        
        // Check for form labels
        const inputs = document.querySelectorAll('input, textarea, select');
        const inputsWithoutLabels = Array.from(inputs).filter(input => {
          const id = input.id;
          if (!id) return true;
          const label = document.querySelector(`label[for="${id}"]`);
          return !label;
        });
        if (inputsWithoutLabels.length > 0) {
          issues.push('missing-form-labels');
        }
        
        // Check for heading structure
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let previousLevel = 0;
        let skipLevel = false;
        
        Array.from(headings).forEach(heading => {
          const level = parseInt(heading.tagName.charAt(1));
          if (level - previousLevel > 1) {
            skipLevel = true;
          }
          previousLevel = level;
        });
        
        if (skipLevel) {
          issues.push('heading-structure');
        }
        
        // Check for color contrast (basic check)
        const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
        let lowContrastElements = 0;
        
        textElements.forEach(element => {
          const style = window.getComputedStyle(element);
          const color = style.color;
          const backgroundColor = style.backgroundColor;
          
          // Basic contrast check (simplified)
          if (color === backgroundColor) {
            lowContrastElements++;
          }
        });
        
        if (lowContrastElements > 0) {
          issues.push('color-contrast');
        }
        
        return issues;
      });
      
      // Calculate score based on issues
      const baseScore = 100;
      const deductions = accessibilityData.length * 25;
      const score = Math.max(0, baseScore - deductions);
      
      return {
        score,
        issues: accessibilityData
      };
    } catch (error) {
      console.error('❌ Error getting accessibility score:', error);
      return { score: 0, issues: [] };
    }
  }
}

module.exports = WebsiteScraper; 