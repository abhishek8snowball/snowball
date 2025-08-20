import React, { useState, useEffect } from 'react';
import { apiService } from '../../utils/api';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { MessageSquare, Sparkles, Check } from 'lucide-react';

const Step4Prompts = ({ onComplete, loading, error, progress }) => {
  const [prompts, setPrompts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (progress?.step4?.promptsGenerated) {
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

  const handleComplete = () => {
    onComplete({
      step4: {
        promptsGenerated: prompts.length > 0,
        completed: true
      }
    }, 5);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-semibold text-[#4a4a6a] mb-3">
          Generate Search Prompts
        </h2>
        <p className="text-[#4a4a6a]">
          We'll create specialized prompts to analyze your brand's visibility
        </p>
      </div>

      <div className="space-y-8">
        <Card className="border-[#b0b0d8] bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#7765e3]" />
                <CardTitle className="text-[#4a4a6a]">Search Prompts</CardTitle>
              </div>
              <Button
                onClick={handleGeneratePrompts}
                disabled={isGenerating}
                variant="outline"
                className="border-[#7765e3] text-[#7765e3] hover:bg-[#7765e3] hover:text-white"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Prompts
                  </>
                )}
              </Button>
            </div>
            <CardDescription className="text-[#4a4a6a]">
              These prompts will be used to analyze your brand's online presence
            </CardDescription>
          </CardHeader>
          <CardContent>
            {prompts.length === 0 ? (
              <div className="text-center py-12 text-[#4a4a6a]/70">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-[#b0b0d8]" />
                <p>Click "Generate Prompts" to create search queries</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    {prompts.length} prompts generated successfully!
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-sm text-[#4a4a6a]/70">
                    Prompts are ready for AI analysis
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complete Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleComplete}
            disabled={loading || prompts.length === 0}
            className="gradient-primary px-8 h-12 min-w-[120px]"
          >
            {loading ? 'Processing...' : 'Complete Setup'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step4Prompts;