import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { BarChart3 } from 'lucide-react';

const ShareOfVoiceTable = ({ 
  shareOfVoice, 
  mentionCounts, 
  totalMentions, 
  brandShare,
  aiVisibilityScore
}) => {
  // Debug logging
  console.log("ShareOfVoiceTable received props:", {
    shareOfVoice,
    mentionCounts,
    totalMentions,
    brandShare,
    aiVisibilityScore
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
                <p className="text-2xl font-bold text-primary">{brandShare?.toFixed(1) || 0}%</p>
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
  );
};

export default ShareOfVoiceTable;