import React, { useState, useEffect } from "react";
import { apiService } from "../utils/api";

const BlogAnalysis = ({ brandId, domain, blogAnalysis }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scoringBlog, setScoringBlog] = useState(null);

  useEffect(() => {
    if (blogAnalysis && blogAnalysis.blogs) {
      // Use blog analysis from props if available (from brand analysis)
      setBlogs(blogAnalysis.blogs);
    } else if (brandId) {
      // Fetch blog analysis from API if not provided in props
      fetchBlogAnalysis();
    }
  }, [brandId, blogAnalysis]);

  const fetchBlogAnalysis = async () => {
    if (!brandId) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`🔍 Fetching blog analysis for brand: ${brandId}`);
      const response = await apiService.getBlogAnalysis(brandId);
      console.log(`✅ Blog analysis received:`, response.data);

      if (response.data && response.data.blogs) {
        setBlogs(response.data.blogs);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error(`❌ Error fetching blog analysis:`, error);
      setError('Failed to load blog analysis');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const scoreSingleBlog = async (blogUrl) => {
    if (!brandId || !blogUrl) return;

    setScoringBlog(blogUrl);
    try {
      console.log(`📊 Scoring blog: ${blogUrl}`);
      const response = await apiService.scoreSingleBlog(brandId, blogUrl);
      console.log(`✅ Blog scored:`, response.data);

      // Update the blog in the list with the new score
      setBlogs(prevBlogs => 
        prevBlogs.map(blog => 
          blog.url === blogUrl 
            ? { ...blog, ...response.data.blogScore }
            : blog
        )
      );
    } catch (error) {
      console.error(`❌ Error scoring blog:`, error);
      setError('Failed to score blog');
    } finally {
      setScoringBlog(null);
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

  if (!brandId && !blogAnalysis) {
    return null;
  }

  // Only show component if blogs are available
  if (!loading && !error && (!blogs || blogs.length === 0)) {
    return null;
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Blog Analysis & GEO Scoring</h3>
          <p className="text-sm text-gray-500">AI-extracted blogs with Generative Engine Optimization scoring from {domain}</p>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Extracting and scoring blogs...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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

      {!loading && !error && blogs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              Found {blogs.length} top blogs with GEO scoring
            </span>
            <span className="text-xs text-gray-500">
              AI-powered analysis & recommendations
            </span>
          </div>

          {blogs.map((blog, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-green-600">
                        {index + 1}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {blog.title || `Blog Post ${index + 1}`}
                    </h4>
                  </div>
                  
                  <div className="ml-9">
                    <a 
                      href={blog.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 break-all"
                    >
                      {blog.url}
                    </a>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Extracted: {new Date(blog.extractedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                  {/* GEO Score Display */}
                  {blog.geoScore !== undefined && blog.geoScore > 0 ? (
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getScoreColor(blog.geoScore)}`}>
                        {blog.geoScore}/10
                      </div>
                      <div className={`mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getReadinessColor(blog.geoReadiness)}`}>
                        {blog.geoReadiness}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => scoreSingleBlog(blog.url)}
                      disabled={scoringBlog === blog.url}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {scoringBlog === blog.url ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-1"></div>
                          Scoring...
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Score
                        </>
                      )}
                    </button>
                  )}
                  
                  <a 
                    href={blog.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visit
                  </a>
                </div>
              </div>
              
              {/* GEO Factor Scores */}
              {blog.factorScores && Object.keys(blog.factorScores).length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center mb-3">
                    <svg className="w-4 h-4 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h5 className="text-sm font-medium text-gray-900">GEO Factor Scores</h5>
                  </div>
                  
                  {/* Detailed GEO Evaluation Results Table */}
                  {blog.factorDetails && blog.factorDetails.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                              Factor
                            </th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                              Score
                            </th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                              Weight
                            </th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                              Weighted Score
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                              Comments
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {blog.factorDetails.map((factor, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-xs font-medium text-gray-900">
                                {factor.factor}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {factor.score}/10
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center text-xs text-gray-600">
                                {factor.weight}%
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {factor.weightedScore.toFixed(2)}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-xs text-gray-700 leading-relaxed">
                                {factor.comments}
                              </td>
                            </tr>
                          ))}
                          {/* Total Score Row */}
                          <tr className="bg-gray-50 font-semibold">
                            <td className="px-3 py-2 text-xs font-bold text-gray-900">
                              TOTAL GEO SCORE
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                                {blog.geoScore}/10
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center text-xs font-bold text-gray-600">
                              100%
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                                {blog.geoScore.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-xs font-bold text-gray-700">
                              {blog.geoReadiness} GEO Readiness
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* Fallback to old format if factorDetails not available */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(blog.factorScores).map(([factor, data]) => (
                        <div key={factor} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-700 truncate">
                              {factor}
                            </span>
                            <span className="text-xs font-bold text-gray-900">
                              {data.score}/10
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(data.score / 10) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Weight: {data.weight}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* GEO Summary */}
              {blog.summary && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center mb-3">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h5 className="text-sm font-medium text-gray-900">GEO Assessment</h5>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed bg-green-50 p-3 rounded-md">
                    {blog.summary}
                  </p>
                </div>
              )}
              
              {/* GEO Recommendations */}
              {blog.recommendations && blog.recommendations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center mb-3">
                    <svg className="w-4 h-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h5 className="text-sm font-medium text-gray-900">AI Recommendations</h5>
                    <span className="ml-2 text-xs text-gray-500">({blog.recommendations.length} suggestions)</span>
                  </div>
                  
                  <div className="space-y-2">
                    {blog.recommendations.map((recommendation, recIndex) => (
                      <div key={recIndex} className="flex items-start">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Limitations */}
              {blog.limitations && blog.limitations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center mb-3">
                    <svg className="w-4 h-4 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h5 className="text-sm font-medium text-gray-900">Evaluation Limitations</h5>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-md">
                    {blog.limitations.map((limitation, limIndex) => (
                      <p key={limIndex} className="text-xs text-yellow-800 leading-relaxed">
                        {limitation}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {blogs.length > 0 && (
        <div className="mt-6 bg-green-50 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">
                <strong>Blog Analysis Complete:</strong> Successfully extracted {blogs.length} top blogs from {domain}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Each blog is scored using the 5-factor GEO framework for Generative Engine Optimization
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogAnalysis; 