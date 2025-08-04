import React from "react";

const DomainForm = ({ domain, setDomain, loading, onSubmit, onClose }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Domain Analysis</h3>
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
          Enter Domain
        </label>
        <input
          id="domain"
          type="text"
          value={domain}
          onChange={e => setDomain(e.target.value)}
          placeholder="Enter brand domain (e.g. example.com)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        />
        <p className="mt-1 text-sm text-gray-500">
          Enter a domain without http:// or www (e.g., google.com, amazon.com)
        </p>
      </div>
      
      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={loading || !domain.trim()}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Analyzing...
            </div>
          ) : (
            'Analyze Domain'
          )}
        </button>
        
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
);

export default DomainForm;