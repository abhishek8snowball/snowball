import React, { useState } from "react";

const SEOAudit = ({ seoAudit }) => {
  const [showAll, setShowAll] = useState(false);
  
  // Validate and format data
  if (!seoAudit) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">SEO & Performance Audit</h3>
        </div>
        <p className="text-gray-500 text-sm">No SEO audit data available</p>
      </div>
    );
  }

  // Format status with color coding
  const getStatusColor = (status) => {
    if (!status) return 'gray';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('optimized') || lowerStatus.includes('good') || lowerStatus.includes('excellent')) return 'green';
    if (lowerStatus.includes('needs-improvement') || lowerStatus.includes('warning') || lowerStatus.includes('fair')) return 'yellow';
    if (lowerStatus.includes('not-optimized') || lowerStatus.includes('error') || lowerStatus.includes('poor')) return 'red';
    return 'gray';
  };

  const statusColor = getStatusColor(seoAudit.status);
  const statusColors = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800'
  };

  // Process issues - handle both old and new format
  const issues = Array.isArray(seoAudit.issues) ? seoAudit.issues : [];
  
  // Get issue messages for summary
  const issueMessages = issues
    .filter((issue) => typeof issue === "object" && (issue.message || issue.issue))
    .map((issue) => issue.message || issue.issue);

  // Get priority colors
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get type colors
  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">SEO & Performance Audit</h3>
      </div>

      <div className="space-y-4">
        {/* Status and Score */}
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Overall Status</label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[statusColor]}`}>
              {seoAudit.status || 'Unknown'}
            </span>
          </div>
          {seoAudit.score && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Score</label>
              <span className="text-lg font-bold text-gray-900">{seoAudit.score}/100</span>
            </div>
          )}
        </div>

        {/* Summary */}
        {seoAudit.summary && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">{seoAudit.summary}</p>
          </div>
        )}

        {/* Issues Summary */}
        {issues.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Issues Found ({issues.length})
              </label>
              {issues.length > 3 && !showAll && (
                <button
                  onClick={() => setShowAll(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Show All
                </button>
              )}
            </div>

            {/* Summary View */}
            {!showAll && issueMessages.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-blue-800">
                  <strong>Key Issues:</strong> {issueMessages.slice(0, 3).join(", ")}
                  {issueMessages.length > 3 && ` and ${issueMessages.length - 3} more`}
                </p>
              </div>
            )}

            {/* Detailed Issues */}
            {(showAll || issueMessages.length === 0) && (
              <div className="space-y-3">
                {issues.map((issue, idx) => (
                  <div key={idx} className="border rounded-lg p-3">
                    {typeof issue === "string" ? (
                      <p className="text-sm text-gray-800">{issue}</p>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(issue.priority)}`}>
                              {issue.priority || 'medium'}
                            </span>
                            <span className={`text-xs font-medium ${getTypeColor(issue.type)}`}>
                              {issue.type || 'info'}
                            </span>
                            {issue.category && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {issue.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-900 mb-1">
                          {issue.message || issue.issue}
                        </p>
                        {issue.detail && (
                          <p className="text-sm text-gray-600">{issue.detail}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Show Less Button */}
            {showAll && (
              <button
                onClick={() => setShowAll(false)}
                className="text-xs text-gray-600 hover:text-gray-800 underline"
              >
                Show Less
              </button>
            )}
          </div>
        )}

        {/* No Issues */}
        {issues.length === 0 && (
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-800 font-medium">No issues found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SEOAudit;