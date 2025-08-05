import React, { useState, useEffect } from "react";
import { apiService } from "../utils/api";

const BlogAnalysis = ({ brandId, domain, blogAnalysis }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  if (!brandId && !blogAnalysis) {
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
          <h3 className="text-lg font-semibold text-gray-900">Top Blog Analysis</h3>
          <p className="text-sm text-gray-500">AI-extracted top 10 blogs from {domain}</p>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Extracting blogs...</p>
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

      {!loading && !error && blogs.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No blogs found for this domain</p>
          <p className="text-gray-400 text-xs mt-1">Blog extraction may not be available for this website</p>
        </div>
      )}

      {!loading && !error && blogs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              Found {blogs.length} top blogs
            </span>
            <span className="text-xs text-gray-500">
              Extracted via AI analysis
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
                      Blog Post {index + 1}
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
                    
                    {blog.title && (
                      <p className="text-xs text-gray-600 mt-1">
                        {blog.title}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Extracted: {new Date(blog.extractedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="ml-4 flex-shrink-0">
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
              
              {/* Blog Recommendations */}
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
                  
                  <div className="mt-3 p-2 bg-purple-50 rounded-md">
                    <p className="text-xs text-purple-700">
                      💡 These recommendations are AI-generated to help improve the blog's performance and engagement
                    </p>
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
                These blogs represent the most valuable content on the website with AI-generated recommendations
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogAnalysis; 