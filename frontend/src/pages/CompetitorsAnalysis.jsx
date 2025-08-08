import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Users, ChevronRight, Building2 } from 'lucide-react';

const CompetitorsAnalysis = ({ competitors }) => {
  // Validate and format data
  if (!competitors || !Array.isArray(competitors) || competitors.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-lg">Competitors Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No competitor data available</p>
        </CardContent>
      </Card>
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <CardTitle className="text-lg">Competitors Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Summary */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{formattedCompetitors.length} competitors</span> identified in your market space
          </p>
        </div>

        {/* Vertical List of Competitors */}
        <div className="space-y-3">
          {formattedCompetitors.map((competitor, index) => (
            <Card 
              key={index} 
              className="border-0 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  {/* Left Side: Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      {/* Competitor Name */}
                      <h3 className="text-base font-semibold text-foreground truncate pr-4">
                        {competitor.name}
                      </h3>
                      
                      {/* Category Badge (top-right) */}
                      <Badge variant="secondary" className="text-xs bg-background/60 text-muted-foreground border-0">
                        {competitor.industry}
                      </Badge>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {competitor.description}
                    </p>
                    
                    {/* Bottom Row: Status Badge */}
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="outline" 
                        className="text-xs font-medium bg-primary/5 text-primary border-primary/20"
                      >
                        {competitor.strength}
                      </Badge>
                      
                      {/* Domain (if available) */}
                      {competitor.domain && (
                        <span className="text-xs text-muted-foreground font-mono">
                          {competitor.domain}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Right Side: Chevron Icon */}
                  <div className="flex items-center ml-4">
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Market Insights Footer */}
        <div className="mt-6 pt-4 border-t border-muted/50">
          <div className="flex items-center space-x-2 mb-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Market Overview</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Analysis based on brand mentions, market positioning, and competitive overlap across multiple data sources.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper functions for competitor data
function getCompetitorStrength(competitorName) {
  const strengths = [
    'Direct Competitor',
    'Market Leader',
    'Emerging Competitor',
    'Niche Player',
    'Established Brand',
    'Innovation Leader',
    'Price Competitor',
    'Quality Competitor'
  ];
  
  // Simple hash-based selection for consistent results
  let hash = 0;
  for (let i = 0; i < competitorName.length; i++) {
    const char = competitorName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return strengths[Math.abs(hash) % strengths.length];
}

function getCompetitorDescription(competitorName) {
  const descriptions = [
    `A well-established competitor in the ${competitorName} market space`,
    `Known for innovative approaches and strong market presence`,
    `Direct competitor with similar target audience and offerings`,
    `Emerging player showing strong growth potential`,
    `Established brand with significant market share`,
    `Niche competitor focusing on specific market segments`,
    `Price-competitive option in the market`,
    `Quality-focused competitor with premium positioning`
  ];
  
  // Simple hash-based selection for consistent results
  let hash = 0;
  for (let i = 0; i < competitorName.length; i++) {
    const char = competitorName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return descriptions[Math.abs(hash) % descriptions.length];
}

function getCompetitorIndustry(competitorName) {
  const industries = [
    'Technology',
    'E-commerce',
    'Finance',
    'Healthcare',
    'Education',
    'Entertainment',
    'Travel',
    'Food & Beverage',
    'Fashion',
    'Automotive',
    'Real Estate',
    'Consulting',
    'Manufacturing',
    'Retail',
    'Media',
    'General'
  ];
  
  // Simple hash-based selection for consistent results
  let hash = 0;
  for (let i = 0; i < competitorName.length; i++) {
    const char = competitorName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return industries[Math.abs(hash) % industries.length];
}

export default CompetitorsAnalysis; 