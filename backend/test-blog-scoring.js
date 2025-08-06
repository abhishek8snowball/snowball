const { blogScorer } = require('./controllers/brand/blogScorer');

async function testBlogScoring() {
  console.log('🧪 Testing Blog Scoring Functionality...\n');
  
  const testUrl = 'https://www.oneshot.ai/blog/revops-experts';
  
  try {
    console.log(`📊 Testing with URL: ${testUrl}`);
    console.log('⏳ This may take a few minutes...\n');
    
    const result = await blogScorer.scoreBlog(testUrl);
    
    console.log('✅ Blog scoring completed successfully!');
    console.log('\n📋 Results:');
    console.log(`   Blog URL: ${result.blogUrl}`);
    console.log(`   GEO Score: ${result.geoScore}/10`);
    console.log(`   Readiness: ${result.geoReadiness}`);
    console.log(`   Scored At: ${result.scoredAt}`);
    
    if (result.factorScores) {
      console.log('\n📊 Factor Scores:');
      Object.entries(result.factorScores).forEach(([factor, data]) => {
        console.log(`   ${factor}: ${data.score}/10 (${data.weight})`);
      });
    }
    
    if (result.recommendations && result.recommendations.length > 0) {
      console.log('\n💡 Top Recommendations:');
      result.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }
    
    if (result.summary) {
      console.log('\n📝 Summary:');
      console.log(`   ${result.summary}`);
    }
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
  }
}

// Run the test
testBlogScoring(); 