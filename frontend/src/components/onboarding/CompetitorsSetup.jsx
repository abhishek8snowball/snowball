import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const CompetitorsSetup = () => {
  const { businessData, competitors, setCompetitors, nextStep, prevStep, setLoading, setError } = useOnboarding();
  const [localCompetitors, setLocalCompetitors] = useState(competitors);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [isFetchingCompetitors, setIsFetchingCompetitors] = useState(false);

  useEffect(() => {
    setLocalCompetitors(competitors);
  }, [competitors]);

  useEffect(() => {
    // Auto-fetch competitors when component mounts
    if (businessData.domain && competitors.length === 0) {
      fetchCompetitorsWithAI();
    }
  }, [businessData.domain]);

  const fetchCompetitorsWithAI = async () => {
    if (!businessData.domain) return;
    
    setIsFetchingCompetitors(true);
    setLoading(true);
    
    try {
      const response = await fetch('/api/v1/onboarding/fetch-competitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth')}`
        },
        body: JSON.stringify({ 
          domain: businessData.domain,
          businessName: businessData.businessName,
          description: businessData.description
        })
      });

      if (!response.ok) throw new Error('Failed to fetch competitors');

      const competitorsData = await response.json();
      // The API returns competitors directly as an array
      const competitorsList = competitorsData.competitors || [];
      setLocalCompetitors(competitorsList);
      setCompetitors(competitorsList);

    } catch (error) {
      setError('Failed to fetch competitors. Please try again.');
      console.error('Competitors fetch error:', error);
    } finally {
      setIsFetchingCompetitors(false);
      setLoading(false);
    }
  };

  const handleAddCompetitor = () => {
    if (newCompetitor.trim() && !localCompetitors.includes(newCompetitor.trim())) {
      setLocalCompetitors(prev => [...prev, newCompetitor.trim()]);
      setNewCompetitor('');
    }
  };

  const handleRemoveCompetitor = (index) => {
    setLocalCompetitors(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddCompetitor();
    }
  };

  const handleSave = () => {
    setCompetitors(localCompetitors);
    nextStep();
  };

  const isFormValid = localCompetitors.length >= 3 && localCompetitors.length <= 7;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          List Your Competitors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Information Box */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 font-medium mb-2">
            For the best results, please ensure all competitors are relevant, popular, and active in your industry.
          </p>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• They help us identify high-quality keywords in your industry</li>
            <li>• We analyze their content to find trending topics and gaps</li>
            <li>• Their strategies inform our AI to create more competitive content</li>
          </ul>
        </div>

        {/* Competitor Input */}
        <div>
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Type competitor URL and press enter (e.g., https://revid.ai or revid.ai)"
              value={newCompetitor}
              onChange={(e) => setNewCompetitor(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleAddCompetitor}
              disabled={!newCompetitor.trim()}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              +
            </Button>
          </div>
        </div>

        {/* Fetch Competitors Button */}
        <div className="text-center">
          <Button
            onClick={fetchCompetitorsWithAI}
            disabled={isFetchingCompetitors || !businessData.domain}
            variant="outline"
            className="border-green-500 text-green-600 hover:bg-green-50"
          >
            {isFetchingCompetitors ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                Fetching Competitors...
              </div>
            ) : (
              '🔄 Refresh Competitors with AI'
            )}
          </Button>
        </div>

        {/* Listed Competitors */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Current Competitors:</h3>
          <div className="space-y-2">
            {localCompetitors.map((competitor, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
              >
                <span className="text-gray-800">{competitor}</span>
                <button
                  onClick={() => handleRemoveCompetitor(index)}
                  className="text-red-500 hover:text-red-700 text-lg font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          {localCompetitors.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">
              No competitors added yet. Use AI to fetch them or add manually.
            </p>
          )}
        </div>

        {/* Guidance */}
        <div className="text-center text-sm text-gray-600">
          Add from 3 to 7 competitors.
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
            disabled={!isFormValid}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2"
          >
            Save Competitors
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitorsSetup;
