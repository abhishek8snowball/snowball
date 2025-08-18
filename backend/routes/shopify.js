const express = require('express');
const axios = require('axios');
const router = express.Router();

// Global variable to store Shopify access token (in production, use database)
let shopifyAccessToken = null;
let shopifyShopDomain = null;

// Step 1: Redirect user to Shopify OAuth authorization URL
router.get('/connect-shopify', (req, res) => {
  const { shop } = req.query;
  const shopifyApiKey = process.env.SHOPIFY_API_KEY;
  const appUrl = process.env.APP_URL || 'http://localhost:5000';
  
  if (!shopifyApiKey) {
    console.error('❌ SHOPIFY_API_KEY environment variable is not set');
    return res.status(500).json({ 
      error: 'SHOPIFY_API_KEY environment variable not configured. Please check your .env file.',
      debug: {
        SHOPIFY_API_KEY: shopifyApiKey ? 'Set' : 'NOT SET',
        SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET ? 'Set' : 'NOT SET',
        APP_URL: process.env.APP_URL || 'Using default: http://localhost:5000'
      }
    });
  }

  // Log the API key for debugging (only first few characters for security)
  console.log(`🔑 Shopify API Key: ${shopifyApiKey.substring(0, 8)}...`);
  console.log(`🌐 App URL: ${appUrl}`);

  // Required scopes for content management
  const scopes = 'read_content,write_content';
  
  if (shop) {
    // If shop parameter is provided, validate and redirect to specific shop
    if (!shop.includes('.myshopify.com')) {
      return res.status(400).json({ 
        error: 'Invalid shop domain. Must be in format: your-shop-name.myshopify.com' 
      });
    }
    
         // Build OAuth authorization URL for specific shop
     const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${shopifyApiKey}&scope=${scopes}&redirect_uri=${appUrl}/api/v1/shopify/auth/shopify/callback&state=${shop}&response_type=code`;
    
    console.log(`🔗 Redirecting to Shopify OAuth for specific shop: ${shop}`);
    console.log(`📝 Authorization URL: ${authUrl}`);
    
    res.redirect(authUrl);
          } else {
      // No shop parameter - redirect to Shopify's app installation page
      // This will let Shopify handle the shop selection automatically
      const appInstallUrl = `https://accounts.shopify.com/oauth/authorize?client_id=${shopifyApiKey}&scope=${scopes}&redirect_uri=${appUrl}/api/v1/shopify/auth/shopify/callback&response_type=code`;
      
      console.log(`🔗 Redirecting to Shopify app installation page`);
      console.log(`📝 App Installation URL: ${appInstallUrl}`);
      
      res.redirect(appInstallUrl);
    }
});

// Step 2: Handle Shopify OAuth callback
router.get('/auth/shopify/callback', async (req, res) => {
  const { code, shop, state } = req.query;
  
  if (!code || !shop || !state) {
    return res.status(400).json({ 
      error: 'Missing required OAuth parameters: code, shop, or state' 
    });
  }

  console.log(`🔄 Shopify OAuth callback received for shop: ${shop}`);
  console.log(`📝 Authorization code: ${code.substring(0, 10)}...`);

  try {
    const shopifyApiKey = process.env.SHOPIFY_API_KEY;
    const shopifyApiSecret = process.env.SHOPIFY_API_SECRET;
    
    if (!shopifyApiKey || !shopifyApiSecret) {
      throw new Error('SHOPIFY_API_KEY or SHOPIFY_API_SECRET environment variables not configured');
    }

    // Exchange authorization code for access token
    const tokenResponse = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: shopifyApiKey,
      client_secret: shopifyApiSecret,
      code: code
    });

    const { access_token } = tokenResponse.data;
    
    if (!access_token) {
      throw new Error('No access token received from Shopify');
    }

    // Store token and shop domain in memory (in production, store in database)
    shopifyAccessToken = access_token;
    shopifyShopDomain = shop;
    
    console.log(`✅ Successfully obtained Shopify access token for shop: ${shop}`);
    console.log(`🔑 Access token: ${access_token.substring(0, 10)}...`);

    // Return success response
    res.json({
      status: 'connected',
      message: `Successfully connected to Shopify store: ${shop}`,
      shop: shop,
      scopes: 'read_content,write_content'
    });

  } catch (error) {
    console.error('❌ Error during Shopify OAuth callback:', error);
    
    res.status(500).json({
      error: 'Failed to complete Shopify OAuth',
      details: error.message
    });
  }
});

// Step 3: Test publish endpoint
router.post('/publish', async (req, res) => {
  if (!shopifyAccessToken || !shopifyShopDomain) {
    return res.status(401).json({ 
      error: 'Not connected to Shopify. Please complete OAuth flow first.' 
    });
  }

  console.log(`📝 Publishing test article to Shopify shop: ${shopifyShopDomain}`);

  try {
    // Test blog post data
    const testPostData = {
      article: {
        title: 'Hello from Node.js',
        body_html: `
          <div class="test-article">
            <h1>Hello from Node.js!</h1>
            <p>This is a test article published via the Shopify API integration.</p>
            <p><strong>Published at:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Integration:</strong> Snowball SEO Platform</p>
            <p>This article was automatically generated and published to test the Shopify OAuth integration.</p>
          </div>
        `,
        summary_html: 'A test article published via Node.js Shopify API integration',
        tags: ['test', 'integration', 'nodejs', 'shopify'],
        author: 'Test Publisher',
        published: true
      }
    };

    // First, check if we have a blog, create one if not
    let blogId = 1;
    try {
      const blogsResponse = await axios.get(`https://${shopifyShopDomain}/admin/api/2024-10/blogs.json`, {
        headers: {
          'X-Shopify-Access-Token': shopifyAccessToken,
          'Content-Type': 'application/json'
        }
      });
      
      if (blogsResponse.data.blogs && blogsResponse.data.blogs.length > 0) {
        blogId = blogsResponse.data.blogs[0].id;
        console.log(`📚 Using existing blog with ID: ${blogId}`);
      } else {
        // Create a new blog if none exists
        const createBlogResponse = await axios.post(`https://${shopifyShopDomain}/admin/api/2024-10/blogs.json`, {
          blog: {
            title: 'Test Blog',
            handle: 'test-blog',
            commentable: 'moderate'
          }
        }, {
          headers: {
            'X-Shopify-Access-Token': shopifyAccessToken,
            'Content-Type': 'application/json'
          }
        });
        
        blogId = createBlogResponse.data.blog.id;
        console.log(`📝 Created new blog with ID: ${blogId}`);
      }
    } catch (error) {
      console.error('⚠️ Error checking/creating blog, using default ID:', error.message);
      blogId = 1;
    }

    // Publish the test article
    const response = await axios.post(`https://${shopifyShopDomain}/admin/api/2024-10/blogs/${blogId}/articles.json`, testPostData, {
      headers: {
        'X-Shopify-Access-Token': shopifyAccessToken,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Successfully published test article to Shopify:`, response.data.article.id);

    res.json({
      status: 'published',
      message: 'Test article published successfully to Shopify',
      article: {
        id: response.data.article.id,
        title: response.data.article.title,
        url: `https://${shopifyShopDomain}/blogs/test-blog/${response.data.article.handle}`,
        published_at: response.data.article.published_at
      }
    });

  } catch (error) {
    console.error('❌ Error publishing test article:', error);
    
    res.status(500).json({
      error: 'Failed to publish test article',
      details: error.message,
      shopify_response: error.response?.data
    });
  }
});

// Get connection status
router.get('/status', (req, res) => {
  if (shopifyAccessToken && shopifyShopDomain) {
    res.json({
      status: 'connected',
      shop: shopifyShopDomain,
      scopes: 'read_content,write_content',
      connected_at: 'In-memory storage (restart will disconnect)'
    });
  } else {
    res.json({
      status: 'disconnected',
      message: 'Not connected to Shopify. Complete OAuth flow to connect.'
    });
  }
});

// Debug endpoint to check environment variables
router.get('/debug-env', (req, res) => {
  res.json({
    SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY ? `${process.env.SHOPIFY_API_KEY.substring(0, 8)}...` : 'NOT SET',
    SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET ? 'Set (hidden for security)' : 'NOT SET',
    APP_URL: process.env.APP_URL || 'Using default: http://localhost:5000',
    NODE_ENV: process.env.NODE_ENV || 'Not set'
  });
});

module.exports = router;
