import React, { useState } from "react";
import { apiService } from "../utils/api";
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { BarChart3, ExternalLink, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const BlogScorer = ({ brandId }) => {
  const [blogUrl, setBlogUrl] = useState("");
  const [scoring, setScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScoreBlog = async (e) => {
    e.preventDefault();
    
    if (!blogUrl.trim()) {
      setError("Please enter a blog URL");
      return;
    }

    if (!brandId) {
      setError("Brand ID is required");
      return;
    }

    setScoring(true);
    setError(null);
    setScoreResult(null);

    try {
      console.log(`📊 Scoring blog: ${blogUrl}`);
      const response = await apiService.scoreSingleBlog(brandId, blogUrl);
      console.log(`✅ Blog scored:`, response.data);
      
      setScoreResult(response.data.blogScore);
    } catch (error) {
      console.error(`❌ Error scoring blog:`, error);
      setError(error.response?.data?.msg || 'Failed to score blog');
    } finally {
      setScoring(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8.5) return 'text-green-600 bg-green-100 border-green-200';
    if (score >= 7.0) return 'text-blue-600 bg-blue-100 border-blue-200';
    if (score >= 5.5) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    if (score >= 4.0) return 'text-orange-600 bg-orange-100 border-orange-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getReadinessColor = (readiness) => {
    switch (readiness) {
      case 'Excellent': return 'text-green-600 bg-green-100 border-green-200';
      case 'Strong': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'Moderate': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'Poor': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'Critical': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <CardTitle className="text-lg">Blog GEO Scorer</CardTitle>
          <p className="text-sm text-muted-foreground">Score any blog URL using the 5-factor GEO framework</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* URL Input Form */}
        <form onSubmit={handleScoreBlog} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                type="url"
                value={blogUrl}
                onChange={(e) => setBlogUrl(e.target.value)}
                placeholder="Enter blog URL (e.g., https://example.com/blog-post)"
                disabled={scoring}
                className="h-12 text-base"
              />
            </div>
            <Button
              type="submit"
              disabled={scoring || !blogUrl.trim()}
              className="h-12 px-6"
            >
              {scoring ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  <span>Scoring...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Score Blog</span>
                </div>
              )}
            </Button>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Score Results */}
        {scoreResult && (
          <div className="space-y-4">
            {/* Overall Score */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Overall GEO Score</h3>
                  </div>
                  <div className="text-4xl font-bold text-primary mb-2">
                    {scoreResult.overallScore?.toFixed(1) || 'N/A'}
                  </div>
                  <Badge className={`text-sm ${getScoreColor(scoreResult.overallScore)}`}>
                    {scoreResult.readiness || 'Unknown'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Factor Scores */}
            {scoreResult.factors && (
              <Card>
                <CardContent className="p-6">
                  <h4 className="text-base font-medium text-foreground mb-4">Factor Breakdown</h4>
                  <div className="space-y-4">
                    {Object.entries(scoreResult.factors).map(([factor, score]) => (
                      <div key={factor} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground capitalize">
                            {factor.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getFactorDescription(factor)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-semibold text-foreground">
                            {score?.toFixed(1) || 'N/A'}
                          </span>
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min((score || 0) * 10, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Analysis */}
            {scoreResult.analysis && (
              <Card>
                <CardContent className="p-6">
                  <h4 className="text-base font-medium text-foreground mb-4">Detailed Analysis</h4>
                  <div className="space-y-4">
                    {Object.entries(scoreResult.analysis).map(([aspect, details]) => (
                      <div key={aspect} className="border-b border-border pb-4 last:border-b-0">
                        <h5 className="text-sm font-medium text-foreground capitalize mb-2">
                          {aspect.replace(/([A-Z])/g, ' $1').trim()}
                        </h5>
                        <div className="space-y-2">
                          {Array.isArray(details) ? (
                            details.map((detail, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-muted-foreground">{detail}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">{details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {scoreResult.recommendations && (
              <Card>
                <CardContent className="p-6">
                  <h4 className="text-base font-medium text-foreground mb-4">Recommendations</h4>
                  <div className="space-y-3">
                    {scoreResult.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* External Link */}
            <div className="text-center">
              <a
                href={blogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
              >
                <span className="text-sm">View Original Blog Post</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* Loading State */}
        {scoring && !scoreResult && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Analyzing Blog Content</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  This may take a few moments as we analyze the content structure, relevance, and optimization factors.
                </p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to get factor descriptions
const getFactorDescription = (factor) => {
  const descriptions = {
    contentStructure: 'How well the content is structured to answer user queries',
    relevance: 'Content relevance to the target topic and accuracy',
    userExperience: 'Readability, engagement, and overall user experience',
    technicalSEO: 'Technical aspects like meta tags and page optimization',
    contentDepth: 'Comprehensiveness and depth of content coverage'
  };
  return descriptions[factor] || 'Factor analysis';
};

export default BlogScorer; 