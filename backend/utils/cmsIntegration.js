const axios = require('axios');

class CMSIntegration {
  constructor() {
    this.platforms = {
      wordpress: this.publishToWordPress.bind(this),
      webflow: this.publishToWebflow.bind(this),
      shopify: this.publishToShopify.bind(this),
      wix: this.publishToWix.bind(this)
    };
  }

  async publishContent(platform, credentials, content) {
    try {
      if (!this.platforms[platform]) {
        throw new Error(`Unsupported platform: ${platform}`);
      }

      const result = await this.platforms[platform](credentials, content);
      return {
        success: true,
        platform,
        postId: result.postId,
        url: result.url,
        message: `Successfully published to ${platform}`
      };
    } catch (error) {
      console.error(`Error publishing to ${platform}:`, error);
      return {
        success: false,
        platform,
        error: error.message
      };
    }
  }

  async publishToWordPress(credentials, content) {
    const { siteUrl, username, applicationPassword } = credentials.authDetails;
    
    if (!siteUrl || !username || !applicationPassword) {
      throw new Error('Missing WordPress credentials');
    }

    const auth = Buffer.from(`${username}:${applicationPassword}`).toString('base64');
    
    const postData = {
      title: content.title,
      content: content.description,
      status: 'publish',
      excerpt: content.description.substring(0, 150),
      categories: content.keywords.split(',').map(k => k.trim()),
      meta: {
        target_audience: content.targetAudience,
        seo_keywords: content.keywords
      }
    };

    const response = await axios.post(`${siteUrl}/wp-json/wp/v2/posts`, postData, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      postId: response.data.id,
      url: response.data.link
    };
  }

  async publishToWebflow(credentials, content) {
    const { apiKey, siteId } = credentials.authDetails;
    
    if (!apiKey || !siteId) {
      throw new Error('Missing Webflow credentials');
    }

    const postData = {
      name: content.title,
      slug: content.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      'post-body': content.description,
      'post-summary': content.description.substring(0, 150),
      'post-category': content.keywords.split(',').map(k => k.trim())[0],
      'post-meta-title': content.title,
      'post-meta-description': content.description.substring(0, 160),
      'post-meta-keywords': content.keywords
    };

    const response = await axios.post(`https://api.webflow.com/sites/${siteId}/collections/posts/items`, postData, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      postId: response.data._id,
      url: `https://${siteId}.webflow.io/posts/${response.data.slug}`
    };
  }

  async publishToShopify(credentials, content) {
    const { shopDomain, accessToken, apiVersion = '2024-01' } = credentials.authDetails;
    
    if (!shopDomain || !accessToken) {
      throw new Error('Missing Shopify credentials');
    }

    const postData = {
      article: {
        title: content.title,
        body_html: content.description,
        summary_html: content.description.substring(0, 150),
        tags: content.keywords.split(',').map(k => k.trim()),
        author: 'AI Content Generator',
        published: true
      }
    };

    const response = await axios.post(`https://${shopDomain}/admin/api/${apiVersion}/blogs/1/articles.json`, postData, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    return {
      postId: response.data.article.id,
      url: `https://${shopDomain}/blogs/news/${response.data.article.handle}`
    };
  }

  async publishToWix(credentials, content) {
    const { siteId, apiKey, accessToken } = credentials.authDetails;
    
    if (!siteId || !apiKey || !accessToken) {
      throw new Error('Missing Wix credentials');
    }

    const postData = {
      post: {
        title: content.title,
        excerpt: content.description.substring(0, 150),
        content: content.description,
        tags: content.keywords.split(',').map(k => k.trim()),
        status: 'PUBLISHED'
      }
    };

    const response = await axios.post(`https://www.wixapis.com/blog/v3/posts`, postData, {
      headers: {
        'Authorization': accessToken,
        'wix-site-id': siteId,
        'Content-Type': 'application/json'
      }
    });

    return {
      postId: response.data.post.id,
      url: `https://${siteId}.wixsite.com/blog/${response.data.post.slug}`
    };
  }

  async testConnection(platform, credentials) {
    try {
      switch (platform) {
        case 'wordpress':
          return await this.testWordPressConnection(credentials);
        case 'webflow':
          return await this.testWebflowConnection(credentials);
        case 'shopify':
          return await this.testShopifyConnection(credentials);
        case 'wix':
          return await this.testWixConnection(credentials);
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async testWordPressConnection(credentials) {
    const { siteUrl, username, applicationPassword } = credentials.authDetails;
    const auth = Buffer.from(`${username}:${applicationPassword}`).toString('base64');
    
    const response = await axios.get(`${siteUrl}/wp-json/wp/v2/users/me`, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    return {
      success: true,
      user: response.data.name,
      site: siteUrl
    };
  }

  async testWebflowConnection(credentials) {
    const { apiKey, siteId } = credentials.authDetails;
    
    const response = await axios.get(`https://api.webflow.com/sites/${siteId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    return {
      success: true,
      site: response.data.name,
      siteId: response.data._id
    };
  }

  async testShopifyConnection(credentials) {
    const { shopDomain, accessToken } = credentials.authDetails;
    
    const response = await axios.get(`https://${shopDomain}/admin/api/2024-01/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken
      }
    });

    return {
      success: true,
      shop: response.data.shop.name,
      domain: shopDomain
    };
  }

  async testWixConnection(credentials) {
    const { siteId, apiKey, accessToken } = credentials.authDetails;
    
    const response = await axios.get(`https://www.wixapis.com/site/v1/site`, {
      headers: {
        'Authorization': accessToken,
        'wix-site-id': siteId
      }
    });

    return {
      success: true,
      site: response.data.site.displayName,
      siteId: response.data.site.id
    };
  }
}

module.exports = new CMSIntegration();
