import React, { useState, useEffect } from 'react';
import { apiService } from '../../utils/api';

const Step4Prompts = ({ onComplete, loading, error, progress }) => {
  const [prompts, setPrompts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Load saved progress if available
    if (progress?.step4?.promptsGenerated) {
      // Prompts were already generated, we can proceed
      setPrompts(['Prompts generated successfully']);
    }
  }, [progress]);

  const handleGeneratePrompts = async () => {
    try {
      setIsGenerating(true);
      
      const response = await apiService.step4Prompts({});
      
      if (response.data.success) {
        setPrompts(response.data.prompts.map(p => p.promptText));
      }
    } catch (error) {
      console.error('Prompts generation failed:', error);
      alert('Failed to generate prompts. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompleteOnboarding = () => {
    onComplete({
      step4: {
        promptsGenerated: true,
        completed: true
      }
    }, 5); // This will trigger onboarding completion
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Generate Search Prompts
        </h2>
        <p className="text-gray-600">
          We'll create AI-powered search prompts for each of your business categories
        </p>
      </div>

      <div className="space-y-6">
        {/* Prompts Display */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Your Search Prompts</h3>
            <button
              onClick={handleGeneratePrompts}
              disabled={isGenerating}
              className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate Prompts'}
            </button>
          </div>

          {prompts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No prompts yet. Click "Generate Prompts" to create AI-powered search prompts for your categories.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {prompts.map((prompt, index) => (
                <div key={index} className="bg-white p-3 rounded-md border border-gray-200">
                  <p className="text-gray-900 text-sm">{prompt}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                These prompts will be used to analyze your brand and competitors across different business categories. 
                They help our AI understand your market position and generate relevant insights.
              </p>
            </div>
          </div>
        </div>

        {/* Completion Message */}
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                <strong>Almost there!</strong> Once you complete this step, we'll generate AI responses, analyze brand mentions, 
                and calculate your Share of Voice. Then you'll see your comprehensive brand analysis dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Complete Onboarding Button */}
        <div className="pt-4">
          <button
            onClick={handleCompleteOnboarding}
            disabled={loading || prompts.length === 0}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Completing...' : 'Complete Onboarding'}
          </button>
        </div>

        {/* What Happens Next */}
        <div className="text-center text-sm text-gray-500">
          <p>After completion, you'll be redirected to your brand analysis dashboard.</p>
        </div>
      </div>
    </div>
  );
};

export default Step4Prompts;
