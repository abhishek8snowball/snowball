import React, { useState } from "react";
import { apiService } from "../utils/api";

const BlogScorer = ({ brandId }) => {
  const [blogUrl, setBlogUrl] = useState("");
  const [scoring, setScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScoreBlog = async (e) => {
    e.preventDefault();
    
    if (!blogUrl.trim()) {
      setError("Please enter a blog URL");
      return;
    }

    if (!brandId) {
      setError("Brand ID is required");
      return;
    }

    setScoring(true);
    setError(null);
    setScoreResult(null);

    try {
      console.log(`📊 Scoring blog: ${blogUrl}`);
      const response = await apiService.scoreSingleBlog(brandId, blogUrl);
      console.log(`✅ Blog scored:`, response.data);
      
      setScoreResult(response.data.blogScore);
    } catch (error) {
      console.error(`❌ Error scoring blog:`, error);
      setError(error.response?.data?.msg || 'Failed to score blog');
    } finally {
      setScoring(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8.5) return 'text-green-600 bg-green-100';
    if (score >= 7.0) return 'text-blue-600 bg-blue-100';
    if (score >= 5.5) return 'text-yellow-600 bg-yellow-100';
    if (score >= 4.0) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getReadinessColor = (readiness) => {
    switch (readiness) {
      case 'Excellent': return 'text-green-600 bg-green-100';
      case 'Strong': return 'text-blue-600 bg-blue-100';
      case 'Moderate': return 'text-yellow-600 bg-yellow-100';
      case 'Poor': return 'text-orange-600 bg-orange-100';
      case 'Critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Blog GEO Scorer</h3>
          <p className="text-sm text-gray-500">Score any blog URL using the 5-factor GEO framework</p>
        </div>
      </div>

      {/* URL Input Form */}
      <form onSubmit={handleScoreBlog} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="url"
              value={blogUrl}
              onChange={(e) => setBlogUrl(e.target.value)}
              placeholder="Enter blog URL (e.g., https://example.com/blog-post)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={scoring}
            />
          </div>
          <button
            type="submit"
            disabled={scoring || !blogUrl.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scoring ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2"></div>
                Scoring...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Score Blog
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Score Results */}
      {scoreResult && (
        <div className="space-y-6">
          {/* Header with Score */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">GEO Score Results</h4>
                <p className="text-sm text-gray-600">Generative Engine Optimization Analysis</p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${getScoreColor(scoreResult.geoScore)}`}>
                  {scoreResult.geoScore}/10
                </div>
                <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getReadinessColor(scoreResult.geoReadiness)}`}>
                  {scoreResult.geoReadiness}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Blog URL</h5>
                <a 
                  href={scoreResult.blogUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 break-all"
                >
                  {scoreResult.blogUrl}
                </a>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Scored At</h5>
                <p className="text-sm text-gray-600">
                  {new Date(scoreResult.scoredAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Factor Scores */}
          {scoreResult.factorScores && Object.keys(scoreResult.factorScores).length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Factor Breakdown</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Object.entries(scoreResult.factorScores).map(([factor, data]) => (
                  <div key={factor} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-medium text-gray-900 truncate">
                        {factor}
                      </h5>
                      <span className="text-sm font-bold text-gray-900">
                        {data.score}/10
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${(data.score / 10) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Weight: {data.weight}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {scoreResult.summary && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Assessment Summary</h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {scoreResult.summary}
                </p>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {scoreResult.recommendations && scoreResult.recommendations.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Recommendations</h4>
              <div className="space-y-3">
                {scoreResult.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start bg-purple-50 rounded-lg p-4">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Limitations */}
          {scoreResult.limitations && scoreResult.limitations.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Evaluation Limitations</h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                {scoreResult.limitations.map((limitation, index) => (
                  <p key={index} className="text-sm text-yellow-800 leading-relaxed mb-2 last:mb-0">
                    {limitation}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Scraped Data */}
          {scoreResult.scrapedData && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Blog Information</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scoreResult.scrapedData.title && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Title</h5>
                      <p className="text-sm text-gray-600">{scoreResult.scrapedData.title}</p>
                    </div>
                  )}
                  {scoreResult.scrapedData.metaDescription && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Meta Description</h5>
                      <p className="text-sm text-gray-600">{scoreResult.scrapedData.metaDescription}</p>
                    </div>
                  )}
                  {scoreResult.scrapedData.contentPreview && (
                    <div className="md:col-span-2">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Content Preview</h5>
                      <p className="text-sm text-gray-600">{scoreResult.scrapedData.contentPreview}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              <strong>GEO Framework:</strong> This scoring system evaluates blogs using 5 key factors for Generative Engine Optimization, helping you understand how well your content is optimized for AI search engines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogScorer; 