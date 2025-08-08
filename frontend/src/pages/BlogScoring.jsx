import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BlogScorer from "../components/BlogScorer";
import { apiService } from "../utils/api";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { FileText, Target, TrendingUp, Users, Zap } from 'lucide-react';

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading brand information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Error</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">Blog GEO Scoring</h1>
              <p className="text-muted-foreground">
                Score any blog URL using the 5-factor Generative Engine Optimization framework
              </p>
            </div>
            {brand && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Brand</p>
                <p className="text-lg font-semibold text-foreground">{brand.name}</p>
                <p className="text-sm text-muted-foreground">{brand.domain}</p>
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">GEO Framework</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-medium text-foreground">1. Content Structure & Answer Format (30%)</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Evaluates how well content is structured to answer user queries and match search intent
                  </p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-medium text-foreground">2. Relevance & Accuracy (25%)</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Measures content relevance to the target topic and accuracy of information provided
                  </p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-medium text-foreground">3. User Experience (20%)</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Assesses readability, engagement, and overall user experience of the content
                  </p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-medium text-foreground">4. Technical SEO (15%)</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Evaluates technical aspects like meta tags, schema markup, and page optimization
                  </p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-medium text-foreground">5. Content Depth (10%)</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Measures the comprehensiveness and depth of content coverage
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Scoring Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scoring Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">9.0 - 10.0</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Excellent</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">7.0 - 8.9</span>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">Strong</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">5.0 - 6.9</span>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">Moderate</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">3.0 - 4.9</span>
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">Poor</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">0.0 - 2.9</span>
                  <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Critical</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pro Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground space-y-2">
                  <p>• Use clear headings and subheadings for better structure</p>
                  <p>• Include relevant keywords naturally throughout the content</p>
                  <p>• Provide comprehensive answers to user queries</p>
                  <p>• Optimize for featured snippets with concise answers</p>
                  <p>• Ensure mobile-friendly and fast-loading content</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogScoring; 