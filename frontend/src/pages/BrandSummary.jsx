import React from "react";

const BrandSummary = ({ brand, domain, description, categories }) => {
  // Validate and format data
  const formattedBrand = brand || 'N/A';
  const formattedDomain = domain || 'N/A';
  const formattedDescription = description || 'No description available';
  const formattedCategories = Array.isArray(categories) ? categories : [];

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Brand Summary</h3>
      </div>

      <div className="space-y-4">
        {/* Brand Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
          <p className="text-gray-900 font-medium">{formattedBrand}</p>
        </div>

        {/* Domain */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
          <p className="text-gray-900 font-mono text-sm bg-gray-50 px-2 py-1 rounded">
            {formattedDomain}
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-800 text-sm leading-relaxed italic">
              {formattedDescription}
            </p>
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
          {formattedCategories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formattedCategories.map((category, index) => {
                // Handle both string and object categories
                const categoryName = typeof category === 'string' 
                  ? category 
                  : category?.categoryName || category?.name || 'Unknown Category';
                
                return (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {categoryName}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No categories identified</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandSummary;