const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api/v1/shopify';
const TEST_SHOP = 'your-test-shop.myshopify.com'; // Replace with your actual test shop

async function testShopifyEndpoints() {
  console.log('🧪 Testing Shopify OAuth Integration\n');

  try {
    // Test 1: Check connection status (should be disconnected initially)
    console.log('1️⃣ Testing connection status...');
    try {
      const statusResponse = await axios.get(`${BASE_URL}/status`);
      console.log('✅ Status endpoint working:', statusResponse.data);
    } catch (error) {
      console.log('❌ Status endpoint error:', error.response?.data || error.message);
    }

    // Test 2: Test connect-shopify endpoint (this will redirect, so we'll just check if it's accessible)
    console.log('\n2️⃣ Testing connect-shopify endpoint...');
    try {
      const connectResponse = await axios.get(`${BASE_URL}/connect-shopify?shop=${TEST_SHOP}`, {
        maxRedirects: 0, // Don't follow redirects
        validateStatus: (status) => status === 302 // Expect redirect
      });
      console.log('✅ Connect endpoint working (redirected)');
    } catch (error) {
      if (error.response?.status === 302) {
        console.log('✅ Connect endpoint working (redirected as expected)');
      } else {
        console.log('❌ Connect endpoint error:', error.response?.data || error.message);
      }
    }

    // Test 3: Test publish endpoint without connection (should fail)
    console.log('\n3️⃣ Testing publish endpoint without connection...');
    try {
      await axios.post(`${BASE_URL}/publish`);
      console.log('❌ Publish should have failed without connection');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Publish endpoint correctly rejects unconnected requests');
      } else {
        console.log('❌ Unexpected publish response:', error.response?.data || error.message);
      }
    }

    // Test 4: Test invalid shop parameter
    console.log('\n4️⃣ Testing invalid shop parameter...');
    try {
      await axios.get(`${BASE_URL}/connect-shopify?shop=invalid-shop`);
      console.log('❌ Should have rejected invalid shop');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected invalid shop parameter');
      } else {
        console.log('❌ Unexpected response for invalid shop:', error.response?.data || error.message);
      }
    }

    // Test 5: Test universal OAuth (no shop parameter)
    console.log('\n5️⃣ Testing universal OAuth (no shop parameter)...');
    try {
      const response = await axios.get(`${BASE_URL}/connect-shopify`, {
        maxRedirects: 0, // Don't follow redirects
        validateStatus: (status) => status === 302 // Expect redirect
      });
      console.log('✅ Universal OAuth endpoint working (redirected as expected)');
    } catch (error) {
      if (error.response?.status === 302) {
        console.log('✅ Universal OAuth endpoint working (redirected as expected)');
      } else {
        console.log('❌ Unexpected response for universal OAuth:', error.response?.data || error.message);
      }
    }

    console.log('\n🎯 Test Summary:');
    console.log('✅ All endpoint tests completed');
    console.log('📝 Next steps:');
    console.log('   1. Set up your .env file with Shopify credentials');
    console.log('   2. Click "Connect to Shopify" button (one-click process)');
    console.log('   3. Shopify will handle shop selection automatically');
    console.log('   4. Complete OAuth authorization and test publishing');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check if server is running
async function checkServerHealth() {
  try {
    const response = await axios.get('http://localhost:5000/api/v1/health');
    if (response.data.status === 'OK') {
      console.log('✅ Backend server is running');
      return true;
    }
  } catch (error) {
    console.log('❌ Backend server is not running. Please start it first with: npm run dev');
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Shopify OAuth Integration Test Script\n');
  
  const serverRunning = await checkServerHealth();
  if (!serverRunning) {
    process.exit(1);
  }
  
  await testShopifyEndpoints();
}

// Run tests
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testShopifyEndpoints, checkServerHealth };
