const fs = require('fs');
const path = require('path');

// Token counting and cost calculation utility
class TokenCostLogger {
  constructor() {
    // Perplexity pricing (as of 2024) - Sonar Pro model
    this.perplexityPricing = {
      input: 0.0001,  // $0.0001 per 1K input tokens
      output: 0.0002  // $0.0002 per 1K output tokens
    };
    
    // OpenAI pricing (as of 2024) - GPT-3.5-turbo
    this.openaiPricing = {
      input: 0.0005,   // $0.0005 per 1K input tokens
      output: 0.0015   // $0.0015 per 1K output tokens
    };

    // Initialize log file
    this.logDir = path.join(__dirname, '..', 'logs');
    this.logFile = path.join(this.logDir, 'api-calls.log');
    this.ensureLogDirectory();
  }

  // Ensure log directory exists
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  // Write log to file
  writeToLogFile(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    try {
      fs.appendFileSync(this.logFile, logEntry);
    } catch (error) {
      console.error('Error writing to log file:', error.message);
    }
  }

  // Count tokens for a given text using GPT-4 tokenizer approximation
  countTokens(text) {
    if (!text || typeof text !== 'string') {
      return 0;
    }
    
    // GPT-4 tokenizer approximation
    // This is a rough estimation based on OpenAI's tokenizer behavior
    // For English text: ~1 token ≈ 4 characters
    // For code: ~1 token ≈ 3 characters
    // For Chinese/Japanese: ~1 token ≈ 1.5 characters
    
    let tokenCount = 0;
    const words = text.split(/\s+/);
    
    for (const word of words) {
      if (word.length === 0) continue;
      
      // Check if word contains non-ASCII characters (likely Chinese/Japanese)
      const hasNonAscii = /[^\x00-\x7F]/.test(word);
      
      if (hasNonAscii) {
        // For non-ASCII text, use ~1.5 characters per token
        tokenCount += Math.ceil(word.length / 1.5);
      } else {
        // For ASCII text, use ~4 characters per token
        tokenCount += Math.ceil(word.length / 4);
      }
    }
    
    // Add tokens for spaces and punctuation
    const spacesAndPunct = text.match(/[\s\p{P}]/gu) || [];
    tokenCount += Math.ceil(spacesAndPunct.length / 4);
    
    return Math.max(1, tokenCount); // Minimum 1 token
  }

  // Calculate cost for Perplexity API call
  calculatePerplexityCost(inputTokens, outputTokens) {
    const inputCost = (inputTokens / 1000) * this.perplexityPricing.input;
    const outputCost = (outputTokens / 1000) * this.perplexityPricing.output;
    return {
      inputCost: parseFloat(inputCost.toFixed(6)),
      outputCost: parseFloat(outputCost.toFixed(6)),
      totalCost: parseFloat((inputCost + outputCost).toFixed(6))
    };
  }

  // Calculate cost for OpenAI API call
  calculateOpenAICost(inputTokens, outputTokens) {
    const inputCost = (inputTokens / 1000) * this.openaiPricing.input;
    const outputCost = (outputTokens / 1000) * this.openaiPricing.output;
    return {
      inputCost: parseFloat(inputCost.toFixed(6)),
      outputCost: parseFloat(outputCost.toFixed(6)),
      totalCost: parseFloat((inputCost + outputCost).toFixed(6))
    };
  }

  // Log Perplexity API call details
  logPerplexityCall(service, prompt, response, model = 'sonar-pro') {
    const inputTokens = this.countTokens(prompt);
    const outputTokens = this.countTokens(response);
    const cost = this.calculatePerplexityCost(inputTokens, outputTokens);

    const logMessage = `💰 PERPLEXITY API CALL - ${service}
   Model: ${model}
   Input Tokens: ${inputTokens}
   Output Tokens: ${outputTokens}
   Total Tokens: ${inputTokens + outputTokens}
   Cost: $${cost.totalCost} (Input: $${cost.inputCost}, Output: $${cost.outputCost})
   Prompt: ${prompt.substring(0, 200)}${prompt.length > 200 ? '...' : ''}
   Response: ${response.substring(0, 200)}${response.length > 200 ? '...' : ''}`;

    // Write to file
    this.writeToLogFile(logMessage);
    
    // Also log to console
    console.log(logMessage);
    console.log('');

    return {
      service,
      model,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      cost
    };
  }

  // Log OpenAI API call details
  logOpenAICall(service, prompt, response, model = 'gpt-3.5-turbo') {
    const inputTokens = this.countTokens(prompt);
    const outputTokens = this.countTokens(response);
    const cost = this.calculateOpenAICost(inputTokens, outputTokens);

    const logMessage = `🤖 OPENAI API CALL - ${service}
   Model: ${model}
   Input Tokens: ${inputTokens}
   Output Tokens: ${outputTokens}
   Total Tokens: ${inputTokens + outputTokens}
   Cost: $${cost.totalCost} (Input: $${cost.inputCost}, Output: $${cost.outputCost})
   Prompt: ${prompt.substring(0, 200)}${prompt.length > 200 ? '...' : ''}
   Response: ${response.substring(0, 200)}${response.length > 200 ? '...' : ''}`;

    // Write to file
    this.writeToLogFile(logMessage);
    
    // Also log to console
    console.log(logMessage);
    console.log('');

    return {
      service,
      model,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      cost
    };
  }

  // Log analysis session start
  logAnalysisStart(domain, brandName) {
    const logMessage = `=== 🚀 STARTING ANALYSIS SESSION ===
   Domain: ${domain}
   Brand: ${brandName}
   Timestamp: ${new Date().toISOString()}`;
    
    this.writeToLogFile(logMessage);
    console.log(logMessage);
    console.log('');
  }

  // Log analysis session end with summary
  logAnalysisEnd(totalCost = 0) {
    const logMessage = `=== 🎉 ANALYSIS SESSION COMPLETE ===
   Total Estimated Cost: $${totalCost.toFixed(6)}
   Timestamp: ${new Date().toISOString()}
   Log File: ${this.logFile}`;
    
    this.writeToLogFile(logMessage);
    console.log(logMessage);
    console.log('');
  }

  // Get summary of all API calls
  getSummary() {
    return {
      perplexityPricing: this.perplexityPricing,
      openaiPricing: this.openaiPricing,
      logFile: this.logFile,
      note: 'Pricing based on 2024 rates. Token counting uses approximation (not exact). Check current pricing at https://www.perplexity.ai/pricing and https://openai.com/pricing'
    };
  }

  // Get log file path
  getLogFilePath() {
    return this.logFile;
  }

  // Read recent logs
  readRecentLogs(lines = 50) {
    try {
      if (!fs.existsSync(this.logFile)) {
        return 'No log file found.';
      }
      
      const content = fs.readFileSync(this.logFile, 'utf8');
      const logLines = content.split('\n').filter(line => line.trim());
      const recentLines = logLines.slice(-lines);
      
      return recentLines.join('\n');
    } catch (error) {
      return `Error reading log file: ${error.message}`;
    }
  }
}

module.exports = TokenCostLogger;
