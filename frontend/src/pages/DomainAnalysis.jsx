import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { apiService } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import DomainForm from "./DomainForm";
import BrandSummary from "./BrandSummary";
import ShareOfVoiceTable from "./ShareOfVoiceTable";
import SEOAudit from "./SEOAudit";
import CompetitorsAnalysis from "./CompetitorsAnalysis";
import CategoriesWithPrompts from "./CategoriesWithPrompts";
import BlogAnalysis from "../components/BlogAnalysis";

const DomainAnalysis = ({ onClose }) => {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showRawData, setShowRawData] = useState(false);
  const [error, setError] = useState(null);
  const [loadingTime, setLoadingTime] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [progressSteps, setProgressSteps] = useState([]);
  const [showConsole, setShowConsole] = useState(false);
  const [blogAnalysisLoading, setBlogAnalysisLoading] = useState(false);
  const [blogAnalysisTriggered, setBlogAnalysisTriggered] = useState(false);

  // Debug logging using useEffect
  useEffect(() => {
    if (result) {
      console.log('DomainAnalysis result:', {
        categories: result.categories,
        categoriesLength: result.categories?.length,
        categoriesType: typeof result.categories,
        brandId: result.brandId
      });
    }
  }, [result]);

  const analysisSteps = [
    { id: 1, name: "Creating brand profile", description: "Setting up brand information and domain details" },
    { id: 2, name: "Extracting categories", description: "Analyzing domain to identify business categories" },
    { id: 3, name: "Generating prompts", description: "Creating AI prompts for comprehensive analysis" },
    { id: 4, name: "Running AI analysis", description: "Processing domain through AI models" },
    { id: 5, name: "Parsing insights", description: "Extracting competitor and market insights" },
    { id: 6, name: "Calculating metrics", description: "Computing brand strength and performance metrics" },
    { id: 7, name: "Extracting competitors", description: "Identifying direct competitors in the market" },
    { id: 8, name: "Calculating Share of Voice", description: "Analyzing market share and brand mentions" },
    { id: 9, name: "Running SEO audit", description: "Performing comprehensive SEO analysis" },
    { id: 10, name: "Generating description", description: "Creating brand summary and description" }
  ];

  const handleAnalyze = async (e) => {
    e.preventDefault();
    
    if (!domain.trim()) {
      toast.error("Please enter a domain");
      return;
    }

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      toast.error("Please enter a valid domain (e.g., example.com)");
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
    }, 3000); // Update every 3 seconds
    
    try {
      console.log('Starting domain analysis for:', domain);
      const response = await apiService.analyzeBrand({ domain });
      console.log('Domain analysis completed:', response.data);
      setResult(response.data);
      setCurrentStep("Analysis complete!");
      toast.success("Domain analysis completed successfully!");
    } catch (error) {
      console.error('Domain analysis error:', error);
      
      // Handle different types of errors
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        setError("Analysis is taking longer than expected. Please try again or check if the domain is accessible.");
        toast.error("Analysis timed out. Domain analysis can take several minutes for complex domains.");
      } else if (error.response?.status === 404) {
        setError("Domain not found or not accessible. Please check the domain name.");
      } else if (error.response?.status === 500) {
        setError("Server error during analysis. Please try again later.");
      } else {
        setError(error.response?.data?.msg || "Failed to analyze domain. Please try again.");
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
    setShowRawData(false);
    setCurrentStep("");
    setProgressSteps([]);
    setShowConsole(false);
    setBlogAnalysisLoading(false);
    setBlogAnalysisTriggered(false);
    onClose();
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleTriggerBlogAnalysis = async () => {
    if (!result?.brandId) {
      toast.error("No brand ID available for blog analysis");
      return;
    }

    setBlogAnalysisLoading(true);
    try {
      console.log('Triggering blog analysis for brandId:', result.brandId);
      const response = await apiService.triggerBlogAnalysis(result.brandId);
      console.log('Blog analysis triggered successfully:', response.data);
      
      // Update the result with blog analysis data
      setResult(prev => ({
        ...prev,
        blogAnalysis: response.data.blogAnalysis
      }));
      
      setBlogAnalysisTriggered(true);
      toast.success("Blog analysis completed successfully!");
    } catch (error) {
      console.error('Blog analysis error:', error);
      toast.error("Blog analysis failed. Please try again.");
    } finally {
      setBlogAnalysisLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Domain Analysis</h2>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>
      </div>

      <DomainForm
        domain={domain}
        setDomain={setDomain}
        loading={loading}
        onSubmit={handleAnalyze}
        onClose={handleClose}
      />

      {loading && (
        <div className="flex flex-col items-center justify-center my-8">
          <LoadingSpinner size="large" message={currentStep || "Starting analysis..."} />
          
          {/* Progress Steps */}
          <div className="mt-6 w-full max-w-2xl">
            <div className="mb-4">
              <p className="text-sm text-gray-600 text-center mb-2">
                This process can take 2-5 minutes for comprehensive analysis
              </p>
              {loadingTime > 0 && (
                <p className="text-xs text-gray-500 text-center">
                  Elapsed time: {formatTime(loadingTime)}
                </p>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(progressSteps.length / analysisSteps.length) * 100}%` }}
              ></div>
            </div>

            {/* Current Step */}
            {currentStep && (
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse"></div>
                  <p className="text-sm font-medium text-blue-800">
                    Currently: {currentStep}
                  </p>
                </div>
              </div>
            )}

            {/* Completed Steps */}
            {progressSteps.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700 mb-2">Completed Steps:</p>
                {progressSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center text-xs">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3 flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-600">{step.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Upcoming Steps */}
            {progressSteps.length < analysisSteps.length && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-700 mb-2">Upcoming Steps:</p>
                <div className="space-y-1">
                  {analysisSteps.slice(progressSteps.length, progressSteps.length + 3).map((step) => (
                    <div key={step.id} className="flex items-center text-xs">
                      <div className="w-4 h-4 bg-gray-300 rounded-full mr-3"></div>
                      <span className="text-gray-400">{step.name}</span>
                    </div>
                  ))}
                  {analysisSteps.length - progressSteps.length > 3 && (
                    <div className="text-xs text-gray-400 ml-7">
                      +{analysisSteps.length - progressSteps.length - 3} more steps
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Backend Console Toggle */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowConsole(!showConsole)}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                {showConsole ? "Hide" : "Show"} Backend Console
              </button>
            </div>

            {/* Backend Console Display */}
            {showConsole && (
              <div className="mt-4 bg-gray-900 rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="text-xs text-green-400 font-mono">
                  <div className="mb-2">=== 🚀 Starting Brand Analysis ===</div>
                  <div className="mb-1">📋 Request body: {JSON.stringify({ domain, brandName: domain })}</div>
                  <div className="mb-1">📝 Step 1: Creating brand profile...</div>
                  <div className="mb-1 text-green-500">✅ Brand profile created: {domain}</div>
                  <div className="mb-1">🏷️ Step 2: Extracting categories...</div>
                  <div className="mb-1 text-green-500">✅ Categories extracted and saved</div>
                  <div className="mb-1">🤖 Step 3: Generating prompts...</div>
                  <div className="mb-1 text-green-500">✅ Prompts generated</div>
                  <div className="mb-1">🧠 Step 4: Running AI analysis...</div>
                  <div className="mb-1 text-green-500">✅ AI responses received</div>
                  <div className="mb-1">🔍 Step 5: Parsing insights...</div>
                  <div className="mb-1 text-green-500">✅ Insights and competitors parsed</div>
                  <div className="mb-1">📊 Step 6: Calculating metrics...</div>
                  <div className="mb-1 text-green-500">✅ Metrics calculated</div>
                  <div className="mb-1">🏢 Step 7: Extracting competitors...</div>
                  <div className="mb-1 text-green-500">✅ Competitors extracted</div>
                  <div className="mb-1">📈 Step 8: Calculating Share of Voice...</div>
                  <div className="mb-1 text-green-500">✅ Share of Voice calculated</div>
                  <div className="mb-1">🔧 Step 9: Running SEO audit...</div>
                  <div className="mb-1 text-green-500">✅ SEO audit completed</div>
                  <div className="mb-1">📝 Step 10: Generating description...</div>
                  <div className="mb-1 text-green-500">✅ Brand description generated</div>
                  <div className="text-yellow-400">=== 🎉 Brand Analysis Complete ===</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Analysis Failed</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Brand Analysis Result</h3>
            <p className="text-gray-600">Comprehensive analysis for {result.domain}</p>
          </div>

          {/* Main Analysis Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Brand Summary */}
            <div className="xl:col-span-1">
              <BrandSummary
                brand={result.brand}
                domain={result.domain}
                description={result.description}
                categories={result.categories}
              />
            </div>
            
            {/* Share of Voice */}
            <div className="xl:col-span-1">
              <ShareOfVoiceTable 
                shareOfVoice={result.shareOfVoice}
                mentionCounts={result.mentionCounts}
                totalMentions={result.totalMentions}
                brandShare={result.brandShare}
                aiVisibilityScore={result.aiVisibilityScore}
                channelBreakdown={result.channelBreakdown}
                coMentions={result.coMentions}
                trendData={result.trendData}
                details={result.details}
              />
            </div>
            
            {/* SEO Audit */}
            <div className="xl:col-span-1">
              <SEOAudit seoAudit={result.seoAudit} />
            </div>
          </div>

          {/* Competitors Analysis - Full Width */}
          {result.competitors && (
            <div className="mt-6">
              <CompetitorsAnalysis competitors={result.competitors} />
            </div>
          )}

          {/* Categories with Prompts - Full Width */}
          {result.categories && Array.isArray(result.categories) && result.categories.length > 0 && (
            <div className="mt-6">
              <CategoriesWithPrompts 
                categories={result.categories} 
                brandId={result.brandId} 
              />
              
              {/* Blog Analysis Trigger - Only show after AI prompts section */}
              <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-purple-900 mb-2">Blog Analysis</h3>
                  <p className="text-purple-700 mb-4">
                    Ready to analyze blogs from this domain with AI-powered GEO scoring?
                  </p>
                  
                  {!blogAnalysisTriggered && !result.blogAnalysis?.blogs?.length ? (
                    <button
                      onClick={handleTriggerBlogAnalysis}
                      disabled={blogAnalysisLoading}
                      className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {blogAnalysisLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Analyzing Blogs...
                        </div>
                      ) : (
                        'Start Blog Analysis'
                      )}
                    </button>
                  ) : (
                    <div className="text-green-600 font-medium">
                      ✅ Blog analysis completed
                    </div>
                  )}
                </div>
              </div>
              
              {/* Blog Analysis Results - Only show after blog analysis is triggered */}
              {(blogAnalysisTriggered || result.blogAnalysis?.blogs?.length > 0) && (
                <BlogAnalysis 
                  brandId={result.brandId}
                  domain={result.domain}
                  blogAnalysis={result.blogAnalysis}
                />
              )}
            </div>
          )}

          {/* Raw Data Toggle */}
          <div className="text-center mt-6">
            <button
              onClick={() => setShowRawData(!showRawData)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {showRawData ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Hide Raw Data
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Show Raw Data
                </>
              )}
            </button>
          </div>

          {/* Raw Data Display */}
          {showRawData && (
            <div className="mt-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Raw API Response</h4>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DomainAnalysis;