import React, { useState } from "react";
import { toast } from "react-toastify";
import { apiService } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import BlogAnalysisResults from "../components/BlogAnalysis";
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { X, FileText, Globe } from 'lucide-react';

const BlogAnalysis = ({ onClose, initialDomain = "", inline = false }) => {
  const [domain, setDomain] = useState(initialDomain);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loadingTime, setLoadingTime] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [progressSteps, setProgressSteps] = useState([]);
  const [showConsole, setShowConsole] = useState(false);

  const analysisSteps = [
    { id: 1, name: "Extracting blog URLs", description: "Finding blog posts from the domain" },
    { id: 2, name: "Analyzing content", description: "Evaluating blog content quality" },
    { id: 3, name: "Calculating GEO scores", description: "Computing content optimization scores" },
    { id: 4, name: "Generating insights", description: "Creating content recommendations" },
    { id: 5, name: "Finalizing report", description: "Compiling analysis results" }
  ];

  const handleAnalyze = async (e) => {
    e.preventDefault();
    
    if (!domain.trim()) {
      toast.error("Please enter a domain or website URL");
      return;
    }

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/;
    
    if (!domainRegex.test(domain) && !urlRegex.test(domain)) {
      toast.error("Please enter a valid domain (e.g., example.com) or URL (e.g., https://example.com)");
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingTime(0);
    setCurrentStep("");
    setProgressSteps([]);
    setShowConsole(true);
    
    // Start loading timer
    const startTime = Date.now();
    const timer = setInterval(() => {
      setLoadingTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgressSteps(prev => {
        if (prev.length < analysisSteps.length) {
          const nextStep = analysisSteps[prev.length];
          setCurrentStep(nextStep.name);
          return [...prev, nextStep];
        }
        return prev;
      });
    }, 2000); // Update every 2 seconds
    
    try {
      console.log('Starting blog analysis for:', domain);
      
      // First, check if we need to analyze the brand first
      let brandId = null;
      try {
        const brandsResponse = await apiService.getUserBrands();
        const userBrands = brandsResponse.data.brands || [];
        
        // Look for existing brand with this domain
        const existingBrand = userBrands.find(brand => 
          brand.domain === domain || 
          brand.domain.replace(/^https?:\/\//, '') === domain ||
          brand.domain === `https://${domain}` ||
          brand.domain === `http://${domain}`
        );
        
        if (existingBrand) {
          brandId = existingBrand.id;
          console.log('Using existing brand for blog analysis:', existingBrand);
        } else {
          // Create a new brand analysis first
          console.log('No existing brand found, creating new brand analysis...');
          const brandResponse = await apiService.analyzeBrand({ domain: domain });
          brandId = brandResponse.data.brandId;
          console.log('New brand created for blog analysis:', brandId);
        }
      } catch (brandError) {
        console.error('Error with brand analysis:', brandError);
        // Continue with blog analysis even if brand analysis fails
      }

      // Now perform blog analysis - ensure we have a brandId
      if (!brandId) {
        throw new Error("Failed to get or create brand ID for blog analysis");
      }

      const response = await apiService.triggerBlogAnalysis(brandId);
      console.log('Blog analysis completed:', response.data);
      
      // Check if we have actual blog data
      if (response.data && response.data.blogAnalysis && response.data.blogAnalysis.blogs && response.data.blogAnalysis.blogs.length > 0) {
        // Transform the data to match what the component expects
        const blogs = response.data.blogAnalysis.blogs;
        console.log('Blogs data structure:', blogs);
        
        // Transform each individual blog to ensure proper factor details structure
        const transformedBlogs = blogs.map(blog => {
          const transformedBlog = { ...blog };
          
          // Ensure each blog has proper factorDetails
          if (blog.factorDetails && blog.factorDetails.length > 0) {
            transformedBlog.factorDetails = blog.factorDetails.map(factor => ({
              factor: factor.factor || factor.name,
              score: typeof factor.score === 'number' ? factor.score : parseFloat(factor.score) || 0
            }));
          } else if (blog.factorScores) {
            transformedBlog.factorDetails = Object.entries(blog.factorScores).map(([factor, score]) => ({
              factor: factor,
              score: typeof score === 'number' ? score : parseFloat(score) || 0
            }));
          }
          
          return transformedBlog;
        });
        
        console.log('Transformed blogs with factor details:', transformedBlogs);
        
        // Calculate aggregated scores
        const validScores = transformedBlogs.filter(blog => blog.geoScore && blog.geoScore > 0);
        const avgGeoScore = validScores.length > 0 
          ? validScores.reduce((sum, blog) => sum + blog.geoScore, 0) / validScores.length 
          : 0;
        
        // Aggregate recommendations
        const allRecommendations = transformedBlogs
          .filter(blog => blog.recommendations && blog.recommendations.length > 0)
          .flatMap(blog => blog.recommendations)
          .slice(0, 10); // Limit to top 10 recommendations
        
        // Aggregate factor details for overall summary
        const factorDetails = [];
        if (validScores.length > 0) {
          const firstBlog = validScores[0];
          console.log('First blog factorScores:', firstBlog.factorScores);
          console.log('First blog factorDetails:', firstBlog.factorDetails);
          
          // Use the transformed factorDetails from the first blog
          if (firstBlog.factorDetails && firstBlog.factorDetails.length > 0) {
            factorDetails.push(...firstBlog.factorDetails);
          }
        }
        
        console.log('Transformed factorDetails:', factorDetails);
        
        const transformedResult = {
          blogs: transformedBlogs,
          geoScore: avgGeoScore,
          geoReadiness: avgGeoScore >= 8.5 ? 'Excellent' : 
                       avgGeoScore >= 7.0 ? 'Good' : 
                       avgGeoScore >= 5.5 ? 'Moderate' : 
                       avgGeoScore >= 4.0 ? 'Poor' : 'Critical',
          recommendations: allRecommendations,
          factorDetails: factorDetails,
          summary: `Analyzed ${transformedBlogs.length} blog posts with an average GEO score of ${avgGeoScore.toFixed(1)}/10.`,
          domain: response.data.domain
        };
        
        console.log('Final transformed result:', transformedResult);
        setResult(transformedResult);
        setCurrentStep("Blog analysis complete!");
        toast.success("Blog analysis completed successfully!");
      } else {
        // No blog data found
        setResult({ 
          message: "No blog content found on this domain",
          domain: response.data.domain
        });
        setCurrentStep("Blog analysis complete!");
        toast.info("Analysis completed but no blog content was found on this domain.");
      }
    } catch (error) {
      console.error('Blog analysis error:', error);
      
      // Handle different types of errors
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        setError("Blog analysis is taking longer than expected. Please try again.");
        toast.error("Blog analysis timed out. This process can take several minutes.");
      } else if (error.response?.status === 404) {
        setError("Domain not found or no blogs detected. Please check the domain name.");
      } else if (error.response?.status === 500) {
        setError("Server error during blog analysis. Please try again later.");
      } else {
        setError(error.response?.data?.msg || error.message || "Failed to analyze blog content. Please try again.");
      }
    } finally {
      clearInterval(timer);
      clearInterval(progressInterval);
      setLoading(false);
      setLoadingTime(0);
    }
  };

  const handleClose = () => {
    setResult(null);
    setError(null);
    setDomain("");
    if (onClose) onClose();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Shared body content for inline or modal
  const body = (
    <div className="flex-1 overflow-y-auto p-6">
      {!result && !loading && (
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 bg-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Blog Content Analysis</CardTitle>
              <CardDescription>
                Enter a domain or website URL to analyze its blog content using our GEO framework
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleAnalyze} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Domain or Website URL
                  </label>
                  <Input
                    type="text"
                    placeholder="example.com or https://example.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="h-12 text-base"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll analyze all blog content found on this domain
                  </p>
                </div>
                
                <Button type="submit" className="w-full h-12 text-base">
                  <Globe className="w-4 h-4 mr-2" />
                  Start Blog Analysis
                </Button>
              </form>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  This analysis will:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Extract blog URLs from the domain</li>
                  <li>• Analyze content quality and structure</li>
                  <li>• Calculate GEO optimization scores</li>
                  <li>• Provide content improvement recommendations</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center my-8">
          <LoadingSpinner size="large" message={currentStep || "Starting blog analysis..."} />
          
          {/* Progress Steps */}
          <div className="mt-6 w-full max-w-2xl">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground text-center mb-2">
                Blog analysis can take 3-5 minutes for comprehensive content evaluation
              </p>
              {loadingTime > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Elapsed time: {formatTime(loadingTime)}
                </p>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${(progressSteps.length / analysisSteps.length) * 100}%` }}
              ></div>
            </div>

            {/* Progress Steps List */}
            <div className="space-y-2">
              {analysisSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    index < progressSteps.length
                      ? 'bg-primary/10 border border-primary/20'
                      : 'bg-muted/30'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    index < progressSteps.length
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {index < progressSteps.length ? '✓' : step.id}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      index < progressSteps.length ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 bg-destructive/10 border-destructive/20">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
                  <X className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Analysis Failed</h3>
                  <p className="text-sm text-muted-foreground mb-4">{error}</p>
                  <Button onClick={() => setError(null)}>
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

             {result && (
         <div className="w-full">
           <BlogAnalysisResults 
             blogAnalysis={result} 
             domain={domain}
             onClose={!inline ? handleClose : undefined}
           />
         </div>
       )}
    </div>
  );

  if (inline) {
    return (
      <div className="w-full">{body}</div>
    );
  }

  // Default: modal overlay
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg border border-border w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Blog Analysis</h2>
              <p className="text-sm text-muted-foreground">Analyze blog content quality and optimization</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {body}
      </div>
    </div>
  );
};

export default BlogAnalysis;
