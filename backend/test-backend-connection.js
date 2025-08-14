const fetch = require('node-fetch');

async function testBackendConnection() {
  try {
    console.log("🧪 Testing Backend Connection...");
    
    // Test 1: Health check endpoint
    console.log("🔍 Testing health check endpoint...");
    try {
      const healthResponse = await fetch('http://localhost:5000/api/v1/health');
      console.log("✅ Health check status:", healthResponse.status);
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log("✅ Health check data:", healthData);
      }
    } catch (error) {
      console.log("❌ Health check failed:", error.message);
    }
    
    // Test 2: Test the mentions endpoint (without auth)
    console.log("\n🔍 Testing mentions endpoint (without auth)...");
    try {
      const mentionsResponse = await fetch('http://localhost:5000/api/v1/brand/mentions/company/SalesLoft?brandId=test');
      console.log("✅ Mentions endpoint status:", mentionsResponse.status);
      if (mentionsResponse.ok) {
        const mentionsData = await mentionsResponse.json();
        console.log("✅ Mentions data:", mentionsData);
      } else {
        const errorText = await mentionsResponse.text();
        console.log("⚠️ Mentions endpoint error (expected without auth):", errorText);
      }
    } catch (error) {
      console.log("❌ Mentions endpoint failed:", error.message);
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

if (require.main === module) {
  testBackendConnection();
}

module.exports = { testBackendConnection };
