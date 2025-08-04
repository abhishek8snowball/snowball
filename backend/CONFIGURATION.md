# Backend Configuration Guide

## Environment Variables Setup

Create a `.env` file in the backend directory with the following variables:

### Required Environment Variables

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/snowball

# API Keys
PERPLEXITY_API_KEY=your_perplexity_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
SERPAPI_KEY=your_serpapi_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

## API Keys Required

### 1. Perplexity API Key
- **Purpose**: Used for category extraction and AI-powered analysis
- **Get it from**: https://www.perplexity.ai/
- **Required for**: Brand category extraction, competitor analysis

### 2. OpenAI API Key
- **Purpose**: Used for brand analysis and SEO insights
- **Get it from**: https://platform.openai.com/
- **Required for**: Brand analysis, SEO audit, AI responses

### 3. SERP API Key
- **Purpose**: Used for competitor discovery and search results
- **Get it from**: https://serpapi.com/
- **Required for**: Competitor discovery, search engine results

## Current Issue

The category extraction is currently falling back to these default categories because `OPENAI_API_KEY` is not set:

- "Business Solutions"
- "Digital Services" 
- "Technology Platform"
- "Professional Services"

## How to Fix

1. **Get an OpenAI API Key**:
   - Sign up at https://platform.openai.com/
   - Generate an API key from your dashboard
   - Copy the API key

2. **Create .env file**:
   ```bash
   # In the backend directory
   touch .env
   ```

3. **Add your API key**:
   ```env
   OPENAI_API_KEY=your_actual_api_key_here
   ```

4. **Restart the server**:
   ```bash
   npm start
   ```

## Verification

After setting up the API key, the category extraction should:
- Successfully call the OpenAI API
- Extract specific, relevant categories based on the website content
- Return 4-6 precise business categories instead of the generic fallback ones

## Troubleshooting

- **"Perplexity API key not found"**: Make sure the `.env` file is in the backend directory
- **API errors**: Verify your API key is valid and has sufficient credits
- **CORS issues**: Check that `FRONTEND_URL` matches your frontend URL 