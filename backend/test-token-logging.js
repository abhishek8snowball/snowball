const TokenCostLogger = require('./utils/tokenCostLogger');

// Test the token logging functionality
async function testTokenLogging() {
  console.log('🧪 Testing Token Cost Logger...\n');
  
  const logger = new TokenCostLogger();
  
  // Test token counting
  const testText = "This is a test message for token counting.";
  const tokenCount = logger.countTokens(testText);
  console.log(`📝 Test text: "${testText}"`);
  console.log(`🔢 Token count: ${tokenCount}\n`);
  
  // Test Perplexity cost calculation
  const perplexityCost = logger.calculatePerplexityCost(100, 200);
  console.log('💰 Perplexity Cost Calculation:');
  console.log(`   Input tokens: 100, Output tokens: 200`);
  console.log(`   Cost: $${perplexityCost.totalCost} (Input: $${perplexityCost.inputCost}, Output: $${perplexityCost.outputCost})\n`);
  
  // Test OpenAI cost calculation
  const openaiCost = logger.calculateOpenAICost(150, 300);
  console.log('🤖 OpenAI Cost Calculation:');
  console.log(`   Input tokens: 150, Output tokens: 300`);
  console.log(`   Cost: $${openaiCost.totalCost} (Input: $${openaiCost.inputCost}, Output: $${openaiCost.outputCost})\n`);
  
  // Test logging functions
  console.log('📊 Testing Logging Functions:');
  logger.logPerplexityCall(
    'Test Service',
    'What does example.com do?',
    'Example.com is a test website that provides various services.',
    'sonar-pro'
  );
  
  logger.logOpenAICall(
    'Test OpenAI Service',
    'Generate a test response',
    'This is a test response from OpenAI.',
    'gpt-3.5-turbo'
  );
  
  // Show pricing summary
  console.log('📋 Pricing Summary:');
  const summary = logger.getSummary();
  console.log(JSON.stringify(summary, null, 2));
  
  console.log('\n✅ Token logging test completed!');
}

// Run the test
testTokenLogging().catch(console.error);
