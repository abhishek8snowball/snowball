import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { 
  FileText, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  Star,
  Target,
  Lightbulb,
  BarChart3,
  ArrowLeft
} from 'lucide-react';

const BlogAnalysis = ({ blogAnalysis, onClose, domain }) => {
  const [expandedBlogs, setExpandedBlogs] = useState(new Set());

  if (!blogAnalysis) {
    return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
           
            <p className="text-muted-foreground">Analyze blog content quality and optimization</p>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose} className="inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          )}
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Blog Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No blog analysis data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle case where analysis completed but no blog content was found
  if (blogAnalysis.message && blogAnalysis.message.includes("No blog content found")) {
    return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
  
          {onClose && (
            <Button variant="outline" onClick={onClose} className="inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          )}
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Blog Analysis Complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-2">No Blog Content Detected</p>
                <p className="text-sm text-muted-foreground">
                  The analysis completed successfully, but no blog content was found on this domain. 
                  This could mean:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• The domain doesn't have a blog section</li>
                  <li>• Blog content is not publicly accessible</li>
                  <li>• The blog URLs couldn't be automatically detected</li>
                  <li>• The domain structure is different from expected</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle case where we have some data but it might be empty
  if (!blogAnalysis.geoScore && !blogAnalysis.recommendations && !blogAnalysis.factorDetails) {
    return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
         
          {onClose && (
            <Button variant="outline" onClick={onClose} className="inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          )}
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <CardTitle className="text-lg">Blog Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Limited Data Available</p>
                <p className="text-sm text-muted-foreground">
                  The analysis completed, but limited blog data was found. This might be due to:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Few blog posts available for analysis</li>
                  <li>• Content that couldn't be properly analyzed</li>
                  <li>• Technical issues during the analysis process</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 8.5) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 7.0) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 5.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (score >= 4.0) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getScoreIcon = (score) => {
    if (score >= 7.0) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (score >= 5.5) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <AlertTriangle className="w-4 h-4 text-red-600" />;
  };

  const getStatusText = (score) => {
    if (score >= 8.5) return 'Excellent';
    if (score >= 7.0) return 'Good';
    if (score >= 5.5) return 'Moderate';
    if (score >= 4.0) return 'Poor';
    return 'Critical';
  };

  const toggleBlogExpansion = (blogIndex) => {
    const newExpanded = new Set(expandedBlogs);
    if (newExpanded.has(blogIndex)) {
      newExpanded.delete(blogIndex);
    } else {
      newExpanded.add(blogIndex);
    }
    setExpandedBlogs(newExpanded);
  };

  const getDomainFavicon = (url) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const CircularProgress = ({ score, size = 60 }) => {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 10) * circumference;
    const strokeDasharray = `${progress} ${circumference}`;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="text-primary transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-foreground">{score.toFixed(1)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
       
        {onClose && (
          <Button variant="outline" onClick={onClose} className="inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        )}
      </div>

      {/* Overall Summary Card */}
      {blogAnalysis.geoScore && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Overall Blog Analysis</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {blogAnalysis.blogs?.length || 0} blogs analyzed
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <CircularProgress score={blogAnalysis.geoScore} size={80} />
                <div className="text-right">
                  <Badge className={`text-sm ${getScoreColor(blogAnalysis.geoScore)}`}>
                    {blogAnalysis.geoReadiness || getStatusText(blogAnalysis.geoScore)}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Average Score</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Individual Blog Cards */}
      {blogAnalysis.blogs && blogAnalysis.blogs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Details</h3>
          </div>
          
          {blogAnalysis.blogs.map((blog, index) => {
            const isExpanded = expandedBlogs.has(index);
            const blogUrl = blog.url || blog.blogUrl || blog;
            const blogTitle = blog.title || blogUrl.split('/').pop()?.replace(/-/g, ' ') || 'Untitled';
            const favicon = getDomainFavicon(blogUrl);
            
            return (
              <Card 
                key={index} 
                className={`border border-border shadow-sm card-hover cursor-pointer glow-primary ${
                  isExpanded ? 'ring-2 ring-primary/20' : ''
                }`}
                onClick={() => toggleBlogExpansion(index)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      {favicon && (
                        <img 
                          src={favicon} 
                          alt="favicon" 
                          className="w-6 h-6 rounded"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-base font-medium truncate">
                            {blogTitle}
                          </CardTitle>
                          <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {blogUrl}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <CircularProgress score={blog.geoScore || 0} size={50} />
                      <div className="text-right">
                        <Badge className={`text-xs ${getScoreColor(blog.geoScore || 0)}`}>
                          {getStatusText(blog.geoScore || 0)}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBlogExpansion(index);
                        }}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Expanded Content */}
                {isExpanded && (
                  <CardContent className="pt-0 space-y-6">
                    {/* Factor Analysis Table */}
                    {(blog.factorDetails && blog.factorDetails.length > 0) && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-primary" />
                          <h4 className="text-sm font-medium text-foreground">Factor Analysis</h4>
                        </div>
                        <Card>
                          <CardContent className="p-0">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-sm">Factor</TableHead>
                                  <TableHead className="text-sm">Score</TableHead>
                                  <TableHead className="text-sm">Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {blog.factorDetails.map((factor, factorIndex) => (
                                  <TableRow key={factorIndex}>
                                    <TableCell className="font-medium text-sm">
                                      {factor.factor || factor.name}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                      <div className="flex items-center space-x-2">
                                        <span>{typeof factor.score === 'number' ? factor.score.toFixed(1) : 'N/A'}/10</span>
                                        <div className="w-16 bg-muted rounded-full h-2">
                                          <div
                                            className="bg-primary h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min((typeof factor.score === 'number' ? factor.score : 0) * 10, 100)}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${getScoreColor(typeof factor.score === 'number' ? factor.score : 0)}`}
                                      >
                                        {typeof factor.score === 'number' ? getStatusText(factor.score) : 'N/A'}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Fallback: Factor Analysis from factorScores (if factorDetails not available) */}
                    {(!blog.factorDetails || blog.factorDetails.length === 0) && blog.factorScores && Object.keys(blog.factorScores).length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-primary" />
                          <h4 className="text-sm font-medium text-foreground">Factor Analysis</h4>
                        </div>
                        <Card>
                          <CardContent className="p-0">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-sm">Factor</TableHead>
                                  <TableHead className="text-sm">Score</TableHead>
                                  <TableHead className="text-sm">Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {Object.entries(blog.factorScores).map(([factor, score], factorIndex) => (
                                  <TableRow key={factorIndex}>
                                    <TableCell className="font-medium text-sm">
                                      {factor}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                      <div className="flex items-center space-x-2">
                                        <span>{typeof score === 'number' ? score.toFixed(1) : 'N/A'}/10</span>
                                        <div className="w-16 bg-muted rounded-full h-2">
                                          <div
                                            className="bg-primary h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min((typeof score === 'number' ? score : 0) * 10, 100)}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${getScoreColor(typeof score === 'number' ? score : 0)}`}
                                      >
                                        {typeof score === 'number' ? getStatusText(score) : 'N/A'}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* AI Recommendations */}
                    {blog.recommendations && blog.recommendations.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Lightbulb className="w-4 h-4 text-primary" />
                          <h4 className="text-sm font-medium text-foreground">AI Recommendations</h4>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                          {blog.recommendations.map((rec, recIndex) => (
                            <div key={recIndex} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {typeof rec === 'string' ? rec : rec.text || 'Unknown recommendation'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    {blog.summary && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-primary" />
                          <h4 className="text-sm font-medium text-foreground">Summary</h4>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 rounded-lg p-3">
                          {blog.summary}
                        </p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Aggregated Recommendations */}
      {blogAnalysis.recommendations && blogAnalysis.recommendations.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Overall Recommendations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {blogAnalysis.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {typeof rec === 'string' ? rec : rec.text || 'Unknown recommendation'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BlogAnalysis; 