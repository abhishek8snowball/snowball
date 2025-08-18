import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';

const BusinessSetup = () => {
  const { businessData, setBusinessData, nextStep, setError } = useOnboarding();
  
  // Initialize with proper structure
  const [localData, setLocalData] = useState({
    domain: '',
    businessName: '',
    description: '',
    targetAudiences: []
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Persist domain input to prevent loss during re-renders
  useEffect(() => {
    if (localData.domain && localData.domain.trim()) {
      // Store domain in sessionStorage to persist across re-renders
      sessionStorage.setItem('onboarding_domain', localData.domain);
    }
  }, [localData.domain]);

  // Restore domain from sessionStorage on component mount
  useEffect(() => {
    const savedDomain = sessionStorage.getItem('onboarding_domain');
    if (savedDomain && !localData.domain) {
      setLocalData(prev => ({ ...prev, domain: savedDomain }));
    }
  }, []);

  const handleInputChange = (field, value) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  const handleTargetAudienceAdd = (audience) => {
    if (audience.trim() && !localData.targetAudiences.includes(audience.trim())) {
      setLocalData(prev => ({
        ...prev,
        targetAudiences: [...prev.targetAudiences, audience.trim()]
      }));
    }
  };

  const handleTargetAudienceRemove = (index) => {
    setLocalData(prev => ({
      ...prev,
      targetAudiences: prev.targetAudiences.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      handleTargetAudienceAdd(e.target.value);
      e.target.value = '';
    }
  };

  const analyzeDomainWithAI = async () => {
    if (!localData.domain.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      // Call backend API to analyze domain (uses existing brand analysis)
      const response = await fetch('/api/v1/onboarding/analyze-domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth')}`
        },
        body: JSON.stringify({ domain: localData.domain })
      });

      if (!response.ok) throw new Error('Failed to analyze domain');

            const analysisData = await response.json();
      console.log('🔍 Frontend received analysis data:', analysisData);
      
      // Extract only the fields we need from the response
      const newData = {
        domain: localData.domain, // Keep existing domain
        businessName: analysisData.businessName || '',
        description: analysisData.description || '',
        targetAudiences: analysisData.targetAudiences || []
      };
      
      console.log('🔄 Setting new data:', newData);
      
      // Set the data
      setLocalData(newData);
      
      // Verify the data was set
      setTimeout(() => {
        console.log('🔍 localData after setState:', localData);
      }, 100);

    } catch (error) {
      setError('Failed to analyze domain. Please try again.');
      console.error('Domain analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    setBusinessData(localData);
    nextStep();
  };

  const isFormValid = localData.domain.trim() && localData.businessName.trim();

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Tell us about your business
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        
        {/* Website to Business */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website to Business
          </label>
          <div className="flex space-x-2">
            <Input
              type="url"
              placeholder="https://example.com"
              value={localData.domain}
              onChange={(e) => handleInputChange('domain', e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={analyzeDomainWithAI}
              disabled={!localData.domain.trim() || isAnalyzing}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isAnalyzing ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="mr-2">✨</span>
                  Autocomplete With AI
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Business Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name
          </label>
          <Input
            type="text"
            placeholder="Enter your business name"
            value={localData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <Textarea
            placeholder="Describe your business..."
            value={localData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Target Audiences */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Target Audiences
          </label>
          <div className="flex space-x-2 mb-3">
            <Input
              type="text"
              placeholder="Type Target Audience and press enter"
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={() => {
                const input = document.querySelector('input[placeholder*="Target Audience"]');
                if (input && input.value.trim()) {
                  handleTargetAudienceAdd(input.value);
                  input.value = '';
                }
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              +
            </Button>
          </div>
          
          {/* Target Audiences Tags */}
          <div className="flex flex-wrap gap-2">
            {localData.targetAudiences.map((audience, index) => (
              <div
                key={index}
                className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                <span>{audience}</span>
                <button
                  onClick={() => handleTargetAudienceRemove(index)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={!isFormValid}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2"
          >
            Save Information
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessSetup;
