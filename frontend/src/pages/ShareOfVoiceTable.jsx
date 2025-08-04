import React, { useState } from "react";

const ShareOfVoiceTable = ({ 
  shareOfVoice, 
  mentionCounts, 
  totalMentions, 
  brandShare,
  aiVisibilityScore,
  channelBreakdown,
  coMentions,
  trendData,
  details
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedChannels, setExpandedChannels] = useState({});

  // Debug logging
  console.log("Enhanced ShareOfVoiceTable received props:", {
    shareOfVoice,
    mentionCounts,
    totalMentions,
    brandShare,
    aiVisibilityScore,
    channelBreakdown,
    coMentions,
    trendData,
    details
  });

  // Handle different data structures
  let shareData = [];
  let totalMentionsCount = 0;
  let brandsCount = 0;
  let isUsingFallback = false;

  // Check if data is in the new enhanced format
  if (shareOfVoice && mentionCounts) {
    shareData = Object.keys(mentionCounts).map(name => ({
      name,
      mentions: mentionCounts[name] || 0,
      share: shareOfVoice[name] || 0
    })).sort((a, b) => b.share - a.share);
    totalMentionsCount = totalMentions || shareData.reduce((sum, item) => sum + item.mentions, 0);
    brandsCount = shareData.length;
    
    // Check if using fallback (no actual mentions)
    if (totalMentionsCount === 0) {
      isUsingFallback = true;
    }
  }
  // Check if data is in the old format (nested object)
  else if (shareOfVoice && shareOfVoice.mentionCounts && shareOfVoice.shareOfVoice) {
    shareData = Object.keys(shareOfVoice.mentionCounts).map(name => ({
      name,
      mentions: shareOfVoice.mentionCounts[name] || 0,
      share: shareOfVoice.shareOfVoice[name] || 0
    })).sort((a, b) => b.share - a.share);
    totalMentionsCount = shareOfVoice.totalMentions || shareData.reduce((sum, item) => sum + item.mentions, 0);
    brandsCount = shareData.length;
    
    if (totalMentionsCount === 0) {
      isUsingFallback = true;
    }
  }
  // Check if data is a simple object
  else if (shareOfVoice && typeof shareOfVoice === 'object' && !Array.isArray(shareOfVoice)) {
    shareData = Object.entries(shareOfVoice).map(([name, share]) => ({
      name,
      mentions: Math.round((share / 100) * 10), // Estimate mentions based on share
      share: share
    })).sort((a, b) => b.share - a.share);
    totalMentionsCount = shareData.reduce((sum, item) => sum + item.mentions, 0);
    brandsCount = shareData.length;
    isUsingFallback = true; // Simple object format usually indicates fallback
  }

  // Validate and format data
  if (!shareData || shareData.length === 0) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Enhanced Share of Voice</h3>
        </div>
        <p className="text-gray-500 text-sm">No share of voice data available</p>
      </div>
    );
  }

  const toggleChannelExpansion = (channel) => {
    setExpandedChannels(prev => ({
      ...prev,
      [channel]: !prev[channel]
    }));
  };

  const renderOverviewTab = () => (
    <div className="space-y-4">
      {/* Enhanced Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Mentions</p>
            <p className="text-2xl font-bold text-gray-900">{totalMentionsCount}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Brands Analyzed</p>
            <p className="text-2xl font-bold text-gray-900">{brandsCount}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Your Brand Share</p>
            <p className="text-2xl font-bold text-green-600">{brandShare?.toFixed(1) || 0}%</p>
          </div>
        </div>
        
        {/* AI Visibility Score */}
        {aiVisibilityScore && (
          <div className="mt-4 p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">AI Visibility Score</span>
              <span className="text-lg font-bold text-purple-600">{aiVisibilityScore.toFixed(1)}%</span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(aiVisibilityScore, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Fallback Warning */}
        {isUsingFallback && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">Using Estimated Data</p>
                <p className="text-xs text-yellow-700">No actual mentions detected. Showing estimated market share distribution.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mentions
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Share (%)
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {shareData.map((item, index) => (
              <tr key={item.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.name}
                  {index === 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Leader
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {isUsingFallback ? (
                    <span className="text-gray-400 italic">Estimated</span>
                  ) : (
                    item.mentions.toLocaleString()
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="mr-2">{item.share.toFixed(1)}%</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === 0 ? 'bg-green-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(item.share, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {isUsingFallback ? (
                    <span className="text-yellow-600">Estimated</span>
                  ) : item.mentions > 0 ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-gray-400">No mentions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Data Quality Indicator */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Data Quality</p>
            <p className="text-xs text-gray-500">
              {isUsingFallback 
                ? "Based on estimated market distribution" 
                : "Based on actual mention analysis"
              }
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isUsingFallback 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {isUsingFallback ? 'Estimated' : 'Real Data'}
          </div>
        </div>
      </div>
    </div>
  );

  const renderChannelsTab = () => (
    <div className="space-y-4">
      {channelBreakdown && Object.keys(channelBreakdown).length > 0 ? (
        Object.entries(channelBreakdown).map(([channel, channelData]) => (
          <div key={channel} className="border rounded-lg p-4">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleChannelExpansion(channel)}
            >
              <h4 className="text-lg font-medium text-gray-900 capitalize">{channel}</h4>
              <svg 
                className={`w-5 h-5 text-gray-500 transition-transform ${expandedChannels[channel] ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {expandedChannels[channel] && (
              <div className="mt-4 space-y-2">
                {Object.entries(channelData).map(([brand, score]) => (
                  <div key={brand} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-700">{brand}</span>
                    <span className="text-sm text-gray-500">{score.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-sm">No channel breakdown data available</p>
      )}
    </div>
  );

  const renderCoMentionsTab = () => (
    <div className="space-y-4">
      {coMentions && coMentions.length > 0 ? (
        coMentions.map((coMention, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-wrap gap-2">
                {coMention.brands.map((brand, brandIndex) => (
                  <span 
                    key={brandIndex}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {brand}
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-500">{coMention.score.toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-600">{coMention.context}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(coMention.timestamp).toLocaleDateString()}
            </p>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-sm">No co-mentions data available</p>
      )}
    </div>
  );

  const renderTrendsTab = () => (
    <div className="space-y-4">
      {trendData && trendData.length > 0 ? (
        <div>
          <div className="mb-4">
            <h4 className="text-lg font-medium text-gray-900 mb-2">Score Trends</h4>
            <div className="h-32 bg-gray-50 rounded-lg flex items-end justify-between p-4">
              {trendData.map((dataPoint, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="bg-blue-500 rounded-t w-4"
                    style={{ height: `${(dataPoint.score / 100) * 100}%` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-1">
                    {new Date(dataPoint.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Latest Score</h5>
              <p className="text-2xl font-bold text-green-600">
                {trendData[trendData.length - 1]?.score.toFixed(1)}%
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Total Mentions</h5>
              <p className="text-2xl font-bold text-blue-600">
                {trendData[trendData.length - 1]?.mentions || 0}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No trend data available</p>
      )}
    </div>
  );

  const renderDetailsTab = () => (
    <div className="space-y-4">
      {details && (
        <>
          {/* Source Breakdown */}
          {details.sourceBreakdown && (
            <div className="border rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Source Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(details.sourceBreakdown).map(([source, score]) => (
                  <div key={source} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">{source}</span>
                    <span className="text-sm text-gray-500">{score.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Topic Relevance Stats */}
          {details.topicRelevanceStats && (
            <div className="border rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Topic Relevance</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Average Relevance</p>
                  <p className="text-lg font-bold text-purple-600">
                    {(details.topicRelevanceStats.averageRelevance * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">High Relevance</p>
                  <p className="text-lg font-bold text-green-600">
                    {details.topicRelevanceStats.highRelevanceCount}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Mentions</p>
                  <p className="text-lg font-bold text-blue-600">
                    {details.topicRelevanceStats.totalMentions}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sentiment Breakdown */}
          {details.sentimentBreakdown && (
            <div className="border rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Sentiment Analysis</h4>
              <div className="space-y-2">
                {Object.entries(details.sentimentBreakdown).map(([sentiment, count]) => (
                  <div key={sentiment} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">{sentiment}</span>
                    <span className="text-sm text-gray-500">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Enhanced Share of Voice</h3>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'channels', label: 'Channels' },
            { id: 'co-mentions', label: 'Co-Mentions' },
            { id: 'trends', label: 'Trends' },
            { id: 'details', label: 'Details' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'channels' && renderChannelsTab()}
        {activeTab === 'co-mentions' && renderCoMentionsTab()}
        {activeTab === 'trends' && renderTrendsTab()}
        {activeTab === 'details' && renderDetailsTab()}
      </div>
    </div>
  );
};

export default ShareOfVoiceTable;