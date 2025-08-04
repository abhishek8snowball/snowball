import React from "react";

const CompetitorsAnalysis = ({ competitors }) => {
  // Validate and format data
  if (!competitors || !Array.isArray(competitors) || competitors.length === 0) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Competitors Analysis</h3>
        </div>
        <p className="text-gray-500 text-sm">No competitor data available</p>
      </div>
    );
  }

  // Handle both string array and object array formats
  const formatCompetitor = (competitor, index) => {
    if (typeof competitor === 'string') {
      return {
        name: competitor,
        domain: null,
        strength: getCompetitorStrength(competitor),
        description: getCompetitorDescription(competitor),
        industry: getCompetitorIndustry(competitor)
      };
    } else if (typeof competitor === 'object') {
      return {
        name: competitor.name || competitor.domain || `Competitor ${index + 1}`,
        domain: competitor.domain || null,
        strength: competitor.strength || getCompetitorStrength(competitor.name || competitor.domain),
        description: competitor.description || getCompetitorDescription(competitor.name || competitor.domain),
        industry: competitor.industry || getCompetitorIndustry(competitor.name || competitor.domain)
      };
    } else {
      return {
        name: `Competitor ${index + 1}`,
        domain: null,
        strength: 'Direct Competitor',
        description: `Identified as a direct competitor in the same market space`,
        industry: 'General'
      };
    }
  };

  const formattedCompetitors = competitors.map((competitor, index) => 
    formatCompetitor(competitor, index)
  );

  // Group competitors by industry
  const competitorsByIndustry = formattedCompetitors.reduce((acc, competitor) => {
    const industry = competitor.industry || 'General';
    if (!acc[industry]) {
      acc[industry] = [];
    }
    acc[industry].push(competitor);
    return acc;
  }, {});

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Competitors Analysis</h3>
      </div>

      <div className="space-y-4">
        {/* Summary */}
        <div className="bg-purple-50 rounded-lg p-3">
          <p className="text-sm text-purple-800">
            <strong>{formattedCompetitors.length}</strong> competitors identified across <strong>{Object.keys(competitorsByIndustry).length}</strong> industries
          </p>
        </div>

        {/* Competitors by Industry */}
        {Object.entries(competitorsByIndustry).map(([industry, industryCompetitors]) => (
          <div key={industry} className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              {industry} ({industryCompetitors.length})
            </h4>
            
            <div className="space-y-3">
              {industryCompetitors.map((competitor, index) => (
                <div key={index} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-purple-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">
                          {competitor.name}
                        </h5>
                        {competitor.domain && (
                          <p className="text-xs text-gray-500 font-mono">
                            {competitor.domain}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        competitor.strength === 'Direct Competitor' ? 'bg-red-100 text-red-800' :
                        competitor.strength === 'Indirect Competitor' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {competitor.strength}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-2">
                    {competitor.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper functions to categorize competitors
function getCompetitorStrength(competitorName) {
  if (!competitorName) return 'Direct Competitor';
  
  const name = competitorName.toLowerCase();
  
  // Direct competitors - major players in the same space
  const directCompetitors = ['google', 'microsoft', 'apple', 'amazon', 'facebook', 'meta', 'netflix', 'spotify', 'uber', 'airbnb'];
  
  // Indirect competitors - related but different focus
  const indirectCompetitors = ['slack', 'zoom', 'dropbox', 'salesforce', 'adobe', 'oracle', 'ibm', 'intel'];
  
  if (directCompetitors.some(comp => name.includes(comp))) {
    return 'Direct Competitor';
  } else if (indirectCompetitors.some(comp => name.includes(comp))) {
    return 'Indirect Competitor';
  }
  
  return 'Market Competitor';
}

function getCompetitorDescription(competitorName) {
  if (!competitorName) return 'Identified as a competitor in the same market space';
  
  const name = competitorName.toLowerCase();
  
  // Industry-specific descriptions
  if (name.includes('google') || name.includes('microsoft') || name.includes('apple')) {
    return 'Major technology company with diverse product offerings';
  } else if (name.includes('amazon') || name.includes('ebay') || name.includes('shopify')) {
    return 'E-commerce and retail platform competitor';
  } else if (name.includes('facebook') || name.includes('meta') || name.includes('twitter')) {
    return 'Social media and digital advertising platform';
  } else if (name.includes('netflix') || name.includes('disney') || name.includes('hulu')) {
    return 'Streaming and entertainment service provider';
  } else if (name.includes('uber') || name.includes('lyft') || name.includes('airbnb')) {
    return 'Sharing economy and transportation platform';
  } else if (name.includes('salesforce') || name.includes('hubspot') || name.includes('zoho')) {
    return 'Business software and CRM solution provider';
  } else if (name.includes('adobe') || name.includes('canva') || name.includes('figma')) {
    return 'Creative software and design tool provider';
  }
  
  return 'Identified as a competitor in the same market space';
}

function getCompetitorIndustry(competitorName) {
  if (!competitorName) return 'General';
  
  const name = competitorName.toLowerCase();
  
  // Industry categorization
  if (name.includes('google') || name.includes('microsoft') || name.includes('apple') || name.includes('amazon')) {
    return 'Technology';
  } else if (name.includes('facebook') || name.includes('meta') || name.includes('twitter') || name.includes('instagram')) {
    return 'Social Media';
  } else if (name.includes('netflix') || name.includes('disney') || name.includes('hulu') || name.includes('spotify')) {
    return 'Entertainment';
  } else if (name.includes('uber') || name.includes('lyft') || name.includes('airbnb')) {
    return 'Sharing Economy';
  } else if (name.includes('salesforce') || name.includes('hubspot') || name.includes('zoho')) {
    return 'Business Software';
  } else if (name.includes('adobe') || name.includes('canva') || name.includes('figma')) {
    return 'Creative Software';
  } else if (name.includes('amazon') || name.includes('ebay') || name.includes('shopify')) {
    return 'E-commerce';
  } else if (name.includes('seo') || name.includes('semrush') || name.includes('ahrefs')) {
    return 'SEO Tools';
  } else if (name.includes('mailchimp') || name.includes('constant') || name.includes('convertkit')) {
    return 'Email Marketing';
  }
  
  return 'General';
}

export default CompetitorsAnalysis; 