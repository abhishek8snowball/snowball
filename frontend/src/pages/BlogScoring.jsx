import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BlogScorer from "../components/BlogScorer";
import { apiService } from "../utils/api";

const BlogScoring = () => {
  const { brandId } = useParams();
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (brandId) {
      fetchBrandInfo();
    }
  }, [brandId]);

  const fetchBrandInfo = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserBrands();
      const brandData = response.data.brands.find(b => b.id === brandId);
      
      if (brandData) {
        setBrand(brandData);
      } else {
        setError("Brand not found");
      }
    } catch (error) {
      console.error("Error fetching brand info:", error);
      setError("Failed to load brand information");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading brand information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Blog GEO Scoring</h1>
              <p className="text-gray-600 mt-2">
                Score any blog URL using the 5-factor Generative Engine Optimization framework
              </p>
            </div>
            {brand && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Brand</p>
                <p className="text-lg font-semibold text-gray-900">{brand.name}</p>
                <p className="text-sm text-gray-600">{brand.domain}</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Blog Scorer */}
          <div className="lg:col-span-2">
            <BlogScorer brandId={brandId} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* GEO Framework Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">GEO Framework</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">1. Content Structure & Answer Format (30%)</h4>
                  <p className="text-xs text-gray-600">
                    Clear headings, FAQ sections, direct answers, scannable content
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">2. Schema Markup & Technical Foundation (25%)</h4>
                  <p className="text-xs text-gray-600">
                    Article schema, FAQ/HowTo schema, JSON-LD, mobile-responsive
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">3. Semantic Clarity & Topic Authority (20%)</h4>
                  <p className="text-xs text-gray-600">
                    Comprehensive coverage, expert quotes, industry terminology
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">4. Content Freshness & Conversational Optimization (15%)</h4>
                  <p className="text-xs text-gray-600">
                    Recent updates, long-tail keywords, voice search optimization
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">5. Citation Worthiness & Multimedia Integration (10%)</h4>
                  <p className="text-xs text-gray-600">
                    Authoritative sources, original research, optimized multimedia
                  </p>
                </div>
              </div>
            </div>

            {/* Score Interpretation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Interpretation</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">8.5-10.0: Excellent</p>
                    <p className="text-xs text-gray-600">High likelihood of AI search visibility</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">7.0-8.4: Strong</p>
                    <p className="text-xs text-gray-600">Good potential for AI inclusion</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">5.5-6.9: Moderate</p>
                    <p className="text-xs text-gray-600">Needs improvement for consistent visibility</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">4.0-5.4: Poor</p>
                    <p className="text-xs text-gray-600">Significant optimization required</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Below 4.0: Critical</p>
                    <p className="text-xs text-gray-600">Complete overhaul needed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Tips for Better Scores</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Use clear, hierarchical headings (H1, H2, H3)</li>
                <li>• Include FAQ sections with direct answers</li>
                <li>• Implement proper schema markup</li>
                <li>• Write in conversational, natural language</li>
                <li>• Include authoritative sources and citations</li>
                <li>• Optimize for voice search queries</li>
                <li>• Keep content fresh and up-to-date</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogScoring; 