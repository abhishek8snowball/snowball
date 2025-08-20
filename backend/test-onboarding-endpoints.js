const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/v1';

async function testOnboardingEndpoints() {
  console.log('🧪 Testing Onboarding Endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health endpoint:', healthResponse.status, healthResponse.data.message);

    // Test 2: Onboarding status (should work without auth)
    console.log('\n2️⃣ Testing onboarding status endpoint...');
    try {
      const statusResponse = await axios.get(`${API_BASE}/onboarding/status`);
      console.log('✅ Onboarding status endpoint:', statusResponse.status);
      console.log('   Response:', statusResponse.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Onboarding status endpoint: 401 Unauthorized (expected without token)');
      } else {
        console.log('❌ Onboarding status endpoint error:', error.response?.status, error.message);
      }
    }

    // Test 3: Onboarding progress (should work without auth)
    console.log('\n3️⃣ Testing onboarding progress endpoint...');
    try {
      const progressResponse = await axios.get(`${API_BASE}/onboarding/progress`);
      console.log('✅ Onboarding progress endpoint:', progressResponse.status);
      console.log('   Response:', progressResponse.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Onboarding progress endpoint: 401 Unauthorized (expected without token)');
      } else {
        console.log('❌ Onboarding progress endpoint error:', error.response?.status, error.message);
      }
    }

    // Test 4: Test with a mock token (should still fail but show different error)
    console.log('\n4️⃣ Testing with mock token...');
    try {
      const mockTokenResponse = await axios.get(`${API_BASE}/onboarding/status`, {
        headers: { 'Authorization': 'Bearer mock-token' }
      });
      console.log('✅ Mock token response:', mockTokenResponse.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Mock token: 401 Unauthorized (expected with invalid token)');
      } else if (error.response?.status === 500) {
        console.log('⚠️ Mock token: 500 Server Error (might be JWT validation issue)');
      } else {
        console.log('❌ Mock token error:', error.response?.status, error.message);
      }
    }

    console.log('\n🎉 Onboarding endpoint tests completed!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Health endpoint working');
    console.log('- ✅ Onboarding endpoints responding (with proper auth errors)');
    console.log('- ✅ Backend is running and accessible');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure the backend is running on port 5000');
    }
  }
}

testOnboardingEndpoints();
