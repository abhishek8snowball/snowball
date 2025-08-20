import React, { useState, useEffect } from 'react';
import { apiService } from '../../utils/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Sparkles, Globe } from 'lucide-react';

const Step1Business = ({ onComplete, loading, error, progress }) => {
  const [domain, setDomain] = useState('');
  const [brandName, setBrandName] = useState('');
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Load saved progress if available
    if (progress?.step1) {
      setDomain(progress.step1.domain || '');
      setBrandName(progress.step1.brandName || '');
      setDescription(progress.step1.description || '');
    }
  }, [progress]);

  const handleAutocompleteWithAI = async () => {
    if (!domain.trim()) {
      alert('Please enter a domain first');
      return;
    }

    try {
      setIsAnalyzing(true);
      
      const response = await apiService.step1DomainAnalysis({ domain });
      
      if (response.data.success) {
        setBrandName(response.data.brand.brandName || '');
        setDescription(response.data.brand.brandInformation || '');
      }
    } catch (error) {
      console.error('AI autocomplete failed:', error);
      alert('AI autocomplete failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleContinue = () => {
    if (!domain.trim() || !brandName.trim() || !description.trim()) {
      alert('Please fill in all fields before continuing');
      return;
    }

    onComplete({
      step1: {
        domain: domain.trim(),
        brandName: brandName.trim(),
        description: description.trim(),
        completed: true
      }
    }, 2);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-semibold text-[#4a4a6a] mb-3">
          Tell us about your business
        </h2>
        <p className="text-[#4a4a6a]">
          We'll analyze your domain and automatically fill in the details
        </p>
      </div>

      <div className="space-y-8">
        {/* Domain Input Card */}
        <Card className="border-[#b0b0d8] bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-[#4a4a6a] flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#7765e3]" />
              Website Domain
            </CardTitle>
            <CardDescription className="text-[#4a4a6a]">
              Enter your business website URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="url"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="https://example.com"
              className="h-12 border-[#b0b0d8] focus:border-[#6658f4] focus:ring-[#6658f4]"
            />
            
            <Button
              onClick={handleAutocompleteWithAI}
              disabled={isAnalyzing || !domain.trim()}
              className="w-full gradient-primary h-12 flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Autocomplete With AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Business Details Card */}
        <Card className="border-[#b0b0d8] bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-[#4a4a6a]">Business Details</CardTitle>
            <CardDescription className="text-[#4a4a6a]">
              Review and edit your business information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#4a4a6a]">
                Business Name
              </label>
              <Input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Enter business name"
                className="h-12 border-[#b0b0d8] focus:border-[#6658f4] focus:ring-[#6658f4]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#4a4a6a]">
                Business Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter business description"
                rows={4}
                className="w-full px-4 py-3 border border-[#b0b0d8] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6658f4] focus:border-[#6658f4] text-[#4a4a6a] resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleContinue}
            disabled={loading || !domain.trim() || !brandName.trim() || !description.trim()}
            className="gradient-primary px-8 h-12 min-w-[120px]"
          >
            {loading ? 'Processing...' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step1Business;
