import React, { useState, useEffect } from 'react';
import { apiService } from '../../utils/api';
import { Button } from '../ui/button';
import { MessageSquare, Sparkles, Check, Edit2, Save, X } from 'lucide-react';

const Step4Prompts = ({ onComplete, loading, error, progress }) => {
  const [prompts, setPrompts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (progress?.step4?.promptsGenerated) {
      setPrompts(['Prompts generated successfully']);
    }
  }, [progress]);

  const handleGeneratePrompts = async () => {
    try {
      setIsGenerating(true);
      const response = await apiService.step4Prompts({});
      console.log('📝 Prompts response:', response.data);
      
      if (response.data.success) {
        // Check if prompts is an array and has the expected structure
        if (response.data.prompts && Array.isArray(response.data.prompts)) {
          const promptTexts = response.data.prompts.map(p => p.promptText);
          console.log('📝 Extracted prompt texts:', promptTexts);
          setPrompts(promptTexts);
        } else {
          console.error('❌ Unexpected prompts structure:', response.data.prompts);
          alert('Prompts were generated but could not be displayed. Check console for details.');
        }
      }
    } catch (error) {
      console.error('Prompts generation failed:', error);
      alert('Failed to generate prompts. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditPrompt = (index) => {
    setEditingIndex(index);
    setEditValue(prompts[index]);
  };

  const handleSaveEdit = async () => {
    if (editValue.trim()) {
      const newPrompts = [...prompts];
      newPrompts[editingIndex] = editValue.trim();
      setPrompts(newPrompts);
      
      // Save the edited prompts to backend
      try {
        const response = await apiService.step4Prompts({ prompts: newPrompts });
        if (response.data.success) {
          console.log('✅ Prompts updated successfully');
        }
      } catch (error) {
        console.error('❌ Failed to save edited prompts:', error);
        // Note: We don't show an error to user as the local state is updated
        // and they can continue with the onboarding
      }
    }
    setEditingIndex(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleComplete = () => {
    onComplete({
      step4: {
        promptsGenerated: prompts.length > 0,
        prompts: prompts, // Send the edited prompts
        completed: true
      }
    }, 5);
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="space-y-6">
        {/* Prompts Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-500" />
              <h3 className="text-h4 text-gray-900">Search Prompts</h3>
            </div>
            <Button
              onClick={handleGeneratePrompts}
              disabled={isGenerating}
              variant="outline"
              className="border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white"
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
          
          <p className="text-base text-gray-600">
            These prompts will be used to analyze your brand's online presence
          </p>

          {prompts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>Click "Generate Prompts" to create search queries</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-800 font-medium text-sm">
                  {prompts.length} prompts generated successfully!
                </span>
              </div>
              
              {/* Display actual prompts */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Generated Prompts:</h4>
                {prompts.map((prompt, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {editingIndex === index ? (
                      <div className="space-y-3">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 resize-none"
                          rows={2}
                          placeholder="Edit prompt text"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSaveEdit}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            size="sm"
                            variant="outline"
                            className="border-gray-300 text-gray-700"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm text-gray-900 flex-1">{prompt}</p>
                        <Button
                          onClick={() => handleEditPrompt(index)}
                          size="sm"
                          variant="ghost"
                          className="text-primary-500 hover:text-primary-600 hover:bg-primary-50 flex-shrink-0"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  These prompts will be used for AI analysis
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Complete Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleComplete}
            disabled={loading || prompts.length === 0}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 h-11 min-w-[100px]"
          >
            {loading ? 'Processing...' : 'Complete Setup'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step4Prompts;