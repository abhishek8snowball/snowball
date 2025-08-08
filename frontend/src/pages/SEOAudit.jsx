import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

const SEOAudit = ({ seoData }) => {
  if (!seoData) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
            <CheckCircle className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-lg">SEO & Performance Audit</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No SEO data available</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'excellent':
      case 'good':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'needs-improvement':
      case 'poor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'needs-improvement':
      case 'poor':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical':
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
          <CheckCircle className="w-5 h-5 text-primary" />
        </div>
        <CardTitle className="text-lg">SEO & Performance Audit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(seoData.overallStatus)}
              <div>
                <p className="text-sm font-medium text-foreground">Overall Status</p>
                <Badge className={`text-xs ${getStatusColor(seoData.overallStatus)}`}>
                  {seoData.overallStatus || 'Unknown'}
                </Badge>
              </div>
            </div>
            {seoData.score && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-2xl font-bold text-foreground">{seoData.score}/100</p>
              </div>
            )}
          </div>
        </div>

        {/* Explanation */}
        {seoData.explanation && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {seoData.explanation}
            </p>
          </div>
        )}

        {/* Issues */}
        {seoData.issues && seoData.issues.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <p className="text-sm font-medium text-foreground">
                Issues Found ({seoData.issues.length})
              </p>
            </div>
            
            <div className="space-y-2">
              {seoData.issues.map((issue, index) => (
                <div key={index} className="p-3 bg-muted/50 rounded-lg border-l-4 border-yellow-500">
                  <p className="text-sm text-foreground font-medium mb-1">Key Issues</p>
                  <p className="text-sm text-muted-foreground">
                    {typeof issue === 'string' ? issue : issue.description || 'Unknown issue'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {seoData.recommendations && seoData.recommendations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm font-medium text-foreground">Recommendations</p>
            </div>
            
            <div className="space-y-2">
              {seoData.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">
                    {typeof rec === 'string' ? rec : rec.text || 'Unknown recommendation'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SEOAudit;