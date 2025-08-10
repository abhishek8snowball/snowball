const TokenCostLogger = require('./utils/tokenCostLogger');
const fs = require('fs');
const path = require('path');

// Utility to view API call logs
function viewLogs() {
  const logger = new TokenCostLogger();
  const logFile = logger.getLogFilePath();
  
  console.log('📋 API Call Logs Viewer');
  console.log('========================\n');
  
  if (!fs.existsSync(logFile)) {
    console.log('❌ No log file found at:', logFile);
    console.log('💡 Run some API calls first to generate logs.');
    return;
  }
  
  console.log('📁 Log file location:', logFile);
  console.log('📊 File size:', (fs.statSync(logFile).size / 1024).toFixed(2), 'KB');
  console.log('');
  
  // Read and display recent logs
  const recentLogs = logger.readRecentLogs(100);
  console.log('📝 Recent API Calls (last 100 entries):');
  console.log('=====================================\n');
  console.log(recentLogs);
  
  // Show summary
  console.log('\n📈 Summary:');
  console.log('==========');
  const summary = logger.getSummary();
  console.log('💰 Perplexity Pricing:', summary.perplexityPricing);
  console.log('🤖 OpenAI Pricing:', summary.openaiPricing);
  console.log('📝 Note:', summary.note);
}

// Command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'recent':
    // Show only recent logs
    const logger = new TokenCostLogger();
    const lines = parseInt(args[1]) || 20;
    console.log(`📝 Recent ${lines} log entries:\n`);
    console.log(logger.readRecentLogs(lines));
    break;
    
  case 'file':
    // Show log file location
    const logLogger = new TokenCostLogger();
    console.log('📁 Log file location:', logLogger.getLogFilePath());
    break;
    
  case 'clear':
    // Clear log file
    const clearLogger = new TokenCostLogger();
    const logFile = clearLogger.getLogFilePath();
    if (fs.existsSync(logFile)) {
      fs.writeFileSync(logFile, '');
      console.log('🗑️ Log file cleared:', logFile);
    } else {
      console.log('❌ No log file found to clear.');
    }
    break;
    
  default:
    // Show full logs
    viewLogs();
    console.log('\n💡 Usage:');
    console.log('  node view-logs.js          - Show all recent logs');
    console.log('  node view-logs.js recent   - Show last 20 entries');
    console.log('  node view-logs.js recent 50 - Show last 50 entries');
    console.log('  node view-logs.js file     - Show log file location');
    console.log('  node view-logs.js clear    - Clear log file');
}

module.exports = { viewLogs };
