import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';

const PromptsSetup = () => {
  const { categories, prompts, setPrompts, nextStep, prevStep, setLoading, setError } = useOnboarding();
  const [localPrompts, setLocalPrompts] = useState(prompts);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);

  useEffect(() => {
    setLocalPrompts(prompts);
  }, [prompts]);

  useEffect(() => {
    // Auto-generate prompts when component mounts
    if (categories.length > 0 && prompts.length === 0) {
      generatePromptsWithAI();
    }
  }, [categories]);

  const generatePromptsWithAI = async () => {
    setIsGeneratingPrompts(true);
    setLoading(true);
    
    try {
      const response = await fetch('/api/v1/onboarding/generate-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth')}`
        },
        body: JSON.stringify({ categories })
      });

      if (!response.ok) throw new Error('Failed to generate prompts');

      const promptsData = await response.json();
      console.log('🔍 Received prompts data:', promptsData);
      
      // The API returns prompts with promptDoc and catDoc structure
      const promptsList = promptsData.prompts || [];
      console.log('🔍 Processed prompts list:', promptsList);
      
      setLocalPrompts(promptsList);
      setPrompts(promptsList);

    } catch (error) {
      setError('Failed to generate prompts. Please try again.');
      console.error('Prompts generation error:', error);
    } finally {
      setIsGeneratingPrompts(false);
      setLoading(false);
    }
  };

  const handlePromptEdit = (index, value) => {
    const newPrompts = [...localPrompts];
    // Handle both old and new data structures
    if (newPrompts[index].promptDoc) {
      // New structure: { promptDoc: {...}, catDoc: {...} }
      newPrompts[index] = { 
        ...newPrompts[index], 
        promptDoc: { ...newPrompts[index].promptDoc, promptText: value }
      };
    } else {
      // Old structure: { prompt: "...", category: "..." }
      newPrompts[index] = { ...newPrompts[index], prompt: value };
    }
    setLocalPrompts(newPrompts);
  };

  const handleSave = () => {
    setPrompts(localPrompts);
    nextStep();
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Review and Edit AI-Generated Prompts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Information Box */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-800 font-medium mb-2">
            These prompts will be used to generate content for your business.
          </p>
          <p className="text-sm text-purple-700">
            Feel free to edit them to better match your brand voice and requirements.
          </p>
        </div>

        {/* Generate Prompts Button */}
        <div className="text-center">
          <Button
            onClick={generatePromptsWithAI}
            disabled={isGeneratingPrompts || categories.length === 0}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isGeneratingPrompts ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Generating Prompts...
              </div>
            ) : (
              '🎯 Generate Prompts with AI'
            )}
          </Button>
        </div>

        {/* Prompts List */}
        <div className="space-y-4">
          {localPrompts.map((promptData, index) => {
            // Handle the actual structure from backend: { promptDoc: {...}, catDoc: {...} }
            const promptText = promptData.promptDoc?.promptText || promptData.prompt || '';
            const categoryName = promptData.catDoc?.categoryName || promptData.category || 'Unknown Category';
            const promptId = promptData.promptDoc?._id || index;
            
            return (
              <div key={promptId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Category: {categoryName}
                  </span>
                  <span className="text-xs text-gray-500">
                    Type: AI Generated
                  </span>
                </div>
                <Textarea
                  value={promptText}
                  onChange={(e) => handlePromptEdit(index, e.target.value)}
                  placeholder="Enter your prompt..."
                  rows={3}
                  className="w-full"
                />
              </div>
            );
          })}
          
          {localPrompts.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">
              No prompts generated yet. Click the button above to generate them with AI.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            onClick={prevStep}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            ← Previous
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={localPrompts.length === 0}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptsSetup;
