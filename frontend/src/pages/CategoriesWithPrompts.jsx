import React, { useState, useEffect } from "react";
import { apiService } from "../utils/api";

const CategoriesWithPrompts = ({ categories, brandId }) => {
  const [categoryPrompts, setCategoryPrompts] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Debug logging
  console.log("CategoriesWithPrompts received props:", {
    categories,
    brandId,
    categoriesLength: categories?.length,
    categoriesType: typeof categories
  });

  useEffect(() => {
    if (categories && categories.length > 0 && brandId) {
      fetchCategoryPrompts();
    }
  }, [categories, brandId]);

  const fetchCategoryPrompts = async () => {
    setLoading(true);
    try {
      const promises = categories.map(async (category) => {
        try {
          console.log(`Fetching prompts for category: ${category._id} (${category.categoryName})`);
          const response = await apiService.getCategoryPrompts(category._id);
          console.log(`Response for category ${category._id}:`, response.data);
          
          // Handle different response structures
          let prompts = [];
          if (response.data && Array.isArray(response.data)) {
            // Direct array response
            prompts = response.data;
          } else if (response.data && Array.isArray(response.data.prompts)) {
            // Object with prompts property
            prompts = response.data.prompts;
          } else if (response.data && response.data.data && Array.isArray(response.data.data.prompts)) {
            // Nested data structure
            prompts = response.data.data.prompts;
          }
          
          console.log(`Extracted ${prompts.length} prompts for category ${category._id}`);
          return { categoryId: category._id, prompts: prompts };
        } catch (error) {
          console.error(`Error fetching prompts for category ${category._id}:`, error);
          return { categoryId: category._id, prompts: [] };
        }
      });

      const results = await Promise.all(promises);
      const promptsMap = {};
      results.forEach(result => {
        promptsMap[result.categoryId] = result.prompts;
        console.log(`Category ${result.categoryId}: ${result.prompts.length} prompts`);
      });
      console.log('Final prompts map:', promptsMap);
      setCategoryPrompts(promptsMap);
    } catch (error) {
      console.error("Error fetching category prompts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  if (!categories || categories.length === 0) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Brand Categories</h3>
        </div>
        <p className="text-gray-500 text-sm">No categories available</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Brand Categories</h3>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading categories...</p>
          </div>
        ) : (
          categories.map((category, index) => {
            // Safety check - ensure category is an object and has required properties
            if (!category || typeof category !== 'object') {
              console.warn('Invalid category object:', category);
              return null;
            }

            const categoryName = category.categoryName || category.name || 'Unknown Category';
            const categoryId = category._id || category.id || `category-${index}`;
            const aiSummary = category.aiSummary || '';

            return (
              <div key={categoryId} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => handleCategoryClick(categoryId)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-purple-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {categoryName}
                        </h4>
                        {aiSummary && (
                          <p className="text-xs text-gray-500 mt-1">
                            {aiSummary}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-2">
                        {loading ? (
                          <span className="inline-flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-purple-600 mr-1"></div>
                            Loading...
                          </span>
                        ) : (
                          `${categoryPrompts[categoryId]?.length || 0} prompts`
                        )}
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          expandedCategory === categoryId ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {expandedCategory === categoryId && (
                  <div className="px-4 pb-3 border-t border-gray-100">
                    <div className="pt-3">
                      <h5 className="text-xs font-medium text-gray-700 mb-2">AI Prompts for this category:</h5>
                      <div className="space-y-2">
                        {categoryPrompts[categoryId] && categoryPrompts[categoryId].length > 0 ? (
                          categoryPrompts[categoryId].map((prompt, promptIndex) => {
                            const promptText = prompt.promptText || prompt.text || 'No prompt text available';
                            const promptId = prompt._id || prompt.id || `prompt-${promptIndex}`;
                            
                            return (
                              <div key={promptId} className="bg-gray-50 rounded p-2">
                                <p className="text-xs text-gray-800">{promptText}</p>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-xs text-gray-500">No prompts available for this category</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {categories.length > 0 && (
        <div className="mt-4 bg-purple-50 rounded-lg p-3">
          <p className="text-sm text-purple-800">
            <strong>{categories.length}</strong> categories identified for this brand
          </p>
          <p className="text-xs text-purple-600 mt-1">
            Click on any category to view the AI prompts used for analysis
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoriesWithPrompts; 