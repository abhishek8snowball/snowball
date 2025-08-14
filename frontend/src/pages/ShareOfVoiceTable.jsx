import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { BarChart3, MessageSquare, FileText, X, Building2 } from 'lucide-react';

const ShareOfVoiceTable = ({ 
  shareOfVoice, 
  mentionCounts, 
  totalMentions, 
  brandShare,
  aiVisibilityScore,
  brandId,
  brandName
}) => {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [mentionData, setMentionData] = useState(null);
  const [loadingMentions, setLoadingMentions] = useState(false);

  // Debug logging
  console.log("ShareOfVoiceTable received props:", {
    shareOfVoice,
    mentionCounts,
    totalMentions,
    brandShare,
    aiVisibilityScore,
    brandId,
    brandName
  });

  // Function to fetch mention data for a brand
  const handleBrandClick = async (brandNameToFetch) => {
    if (!brandId) {
      console.log("❌ No brandId available");
      return;
    }
    
    console.log("🔍 Clicked brand:", brandNameToFetch);
    console.log("🏢 Brand ID:", brandId);
    
    // Debug authentication token
    const token = localStorage.getItem('auth');
    console.log("🔑 Token available:", !!token);
    console.log("🔑 Token length:", token ? token.length : 0);
    console.log("🔑 Token starts with:", token ? token.substring(0, 20) + '...' : 'N/A');
    
    setSelectedBrand(brandNameToFetch);
    setLoadingMentions(true);
    
    try {
      const apiUrl = `/api/v1/brand/mentions/company/${encodeURIComponent(brandNameToFetch)}?brandId=${brandId}`;
      console.log("📡 API URL:", apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response ok:", response.ok);
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log("📡 Response data:", data);
        setMentionData(data.mentions || []);
      } else {
        const errorText = await response.text();
        console.error("❌ API Error:", errorText);
        setMentionData([]);
      }
    } catch (error) {
      console.error('❌ Error fetching mention data:', error);
      setMentionData([]);
    } finally {
      setLoadingMentions(false);
    }
  };

  // Function to close mention details
  const closeMentionDetails = () => {
    setSelectedBrand(null);
    setMentionData(null);
  };

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
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-lg">Share of Voice</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No share of voice data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-lg">Share of Voice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Mentions</p>
                  <p className="text-2xl font-bold text-foreground">{totalMentionsCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Brands Analyzed</p>
                  <p className="text-2xl font-bold text-foreground">{brandsCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Your Brand Share</p>
                  <button
                    onClick={() => handleBrandClick(brandName || 'Your Brand')}
                    className="text-2xl font-bold text-primary hover:text-primary/80 transition-all duration-300 cursor-pointer relative group"
                    title="Click to see prompts where your brand was mentioned"
                  >
                    {brandShare?.toFixed(1) || 0}%
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
                  </button>
                  <div className="text-xs text-muted-foreground mt-1 transition-all duration-300 group-hover:opacity-100 opacity-0">
                    Click to view mentions
                  </div>
                </div>
              </div>
              
              {/* AI Visibility Score */}
              {aiVisibilityScore && (
                <div className="mt-6 p-4 bg-background rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">AI Visibility Score</span>
                    <span className="text-lg font-bold text-primary">{aiVisibilityScore.toFixed(1)}%</span>
                  </div>
                  <div className="bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(aiVisibilityScore, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-sm">Brand</TableHead>
                    <TableHead className="text-sm">Mentions</TableHead>
                    <TableHead className="text-sm">Share (%)</TableHead>
                    <TableHead className="text-sm">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shareData.map((item, index) => (
                    <TableRow key={item.name}>
                      <TableCell className="font-medium text-sm">
                        {item.name}
                        {index === 0 && (
                          <Badge className="ml-2 bg-green-100 text-green-800 border-green-200 text-xs">
                            Leader
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {isUsingFallback ? (
                          <span className="text-muted-foreground italic">Estimated</span>
                        ) : (
                          item.mentions.toLocaleString()
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center">
                          <span className="mr-3">{item.share.toFixed(1)}%</span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                index === 0 ? 'bg-green-600' : 'bg-primary'
                              }`}
                              style={{ width: `${Math.min(item.share, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {isUsingFallback ? (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-200 text-xs">Estimated</Badge>
                        ) : item.mentions > 0 ? (
                          <Badge variant="outline" className="text-green-600 border-green-200 text-xs">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-xs">No mentions</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Data Quality Indicator */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Data Quality</p>
                  <p className="text-xs text-muted-foreground">
                    {isUsingFallback 
                      ? "Based on estimated market distribution" 
                      : "Based on actual mention analysis"
                    }
                  </p>
                </div>
                <Badge
                  variant={isUsingFallback ? "outline" : "default"}
                  className={`text-xs ${
                    isUsingFallback 
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                      : 'bg-green-100 text-green-800 border-green-200'
                  }`}
                >
                  {isUsingFallback ? 'Estimated' : 'Real Data'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Mention Details Modal */}
      {selectedBrand && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-8 h-8 text-primary" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedBrand}</h2>
                    <p className="text-gray-600">Mention Analysis & Prompt Traceability</p>
                  </div>
                </div>
                <Button variant="outline" onClick={closeMentionDetails} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Loading State */}
              {loadingMentions && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Loading mention data...</span>
                </div>
              )}

              {/* Mention Data */}
              {!loadingMentions && mentionData && (
                <div className="space-y-4">
                  {mentionData.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-gray-500 mb-2">No mentions found</div>
                      <div className="text-sm text-gray-600">
                        This brand hasn't been mentioned in any AI responses yet.
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Summary Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{mentionData.length}</div>
                          <div className="text-sm text-blue-600">Total Mentions</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {new Set(mentionData.map(m => m.categoryId?.categoryName)).size}
                          </div>
                          <div className="text-sm text-green-600">Categories</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {new Set(mentionData.map(m => m.promptId?._id)).size}
                          </div>
                          <div className="text-sm text-purple-600">Unique Prompts</div>
                        </div>
                      </div>

                      {/* Mentions List */}
                      <div className="space-y-4">
                        {mentionData.map((mention, index) => (
                          <Card key={mention._id || index} className="border-l-4 border-l-primary">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {mention.categoryId?.categoryName || 'Unknown Category'}
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    {new Date(mention.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Prompt */}
                              <div className="mb-3">
                                <div className="flex items-center space-x-2 mb-1">
                                  <MessageSquare className="w-4 h-4 text-blue-500" />
                                  <span className="text-sm font-medium text-gray-700">Prompt</span>
                                </div>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                                  {mention.promptId?.promptText || 'Prompt not available'}
                                </p>
                              </div>

                              {/* AI Response */}
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <FileText className="w-4 h-4 text-green-500" />
                                  <span className="text-sm font-medium text-gray-700">AI Response</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-md">
                                  <p className="text-sm text-gray-600">
                                    {mention.responseId?.responseText?.substring(0, 300) || 'Response not available'}
                                    {(mention.responseId?.responseText?.length || 0) > 300 && '...'}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareOfVoiceTable;