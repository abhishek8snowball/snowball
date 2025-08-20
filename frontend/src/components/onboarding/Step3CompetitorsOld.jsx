import React, { useState, useEffect } from 'react';
import { apiService } from '../../utils/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Building2, Sparkles, Plus, X } from 'lucide-react';

const Step3Competitors = ({ onComplete, loading, error, progress }) => {
  const [competitors, setCompetitors] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState('');

  useEffect(() => {
    // Load saved progress if available
    if (progress?.step3?.competitors) {
      setCompetitors(progress.step3.competitors);
    }
  }, [progress]);

  const handleExtractCompetitors = async () => {
    try {
      setIsExtracting(true);
      
      const response = await apiService.step3Competitors({});
      
      if (response.data.success) {
        setCompetitors(response.data.competitors);
      }
    } catch (error) {
      console.error('Competitors extraction failed:', error);
      alert('Failed to extract competitors. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddCompetitor = () => {
    if (newCompetitor.trim() && competitors.length < 7) {
      setCompetitors([...competitors, newCompetitor.trim()]);
      setNewCompetitor('');
    }
  };

  const handleRemoveCompetitor = (index) => {
    const newCompetitors = competitors.filter((_, i) => i !== index);
    setCompetitors(newCompetitors);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddCompetitor();
    }
  };

  const handleContinue = () => {
    if (competitors.length < 3) {
      alert('Please add at least 3 competitors before continuing');
      return;
    }

    onComplete({
      step3: {
        competitors: competitors,
        completed: true
      }
    }, 4);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-semibold text-[#4a4a6a] mb-3">
          List Your Competitors
        </h2>
        <p className="text-[#4a4a6a]">
          We'll analyze your competitors to provide better insights
        </p>
      </div>

      <div className="space-y-8">
        {/* Competitors Card */}
        <Card className="border-[#b0b0d8] bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#7765e3]" />
                <CardTitle className="text-[#4a4a6a]">Your Competitors</CardTitle>
              </div>
              <Button
                onClick={handleExtractCompetitors}
                disabled={isExtracting}
                variant="outline"
                className="border-[#7765e3] text-[#7765e3] hover:bg-[#7765e3] hover:text-white"
              >
                {isExtracting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Extract with AI
                  </>
                )}
              </Button>
            </div>
            <CardDescription className="text-[#4a4a6a]">
              Competitor analysis helps us understand your market position
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

        {/* Competitors Input */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newCompetitor}
              onChange={(e) => setNewCompetitor(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type competitor URL and press enter (e.g., https://revid.ai or revid.ai)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              onClick={handleAddCompetitor}
              disabled={!newCompetitor.trim() || competitors.length >= 7}
              className="bg-gray-600 text-white p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Competitors List */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Your Competitors</h3>
            <button
              onClick={handleExtractCompetitors}
              disabled={isExtracting}
              className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isExtracting ? 'Extracting...' : 'Extract with AI'}
            </button>
          </div>

          {competitors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No competitors yet. Add them manually or click "Extract with AI" to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {competitors.map((competitor, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                  <span className="text-gray-900">{competitor}</span>
                  <button
                    onClick={() => handleRemoveCompetitor(index)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button
            onClick={handleContinue}
            disabled={loading || competitors.length < 3}
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-md font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Save Competitors'}
          </button>
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-gray-500">
          Add from 3 to 7 competitors.
        </div>
      </div>
    </div>
  );
};

export default Step3Competitors;
