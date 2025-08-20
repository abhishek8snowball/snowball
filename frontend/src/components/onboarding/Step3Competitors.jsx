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
    setCompetitors(competitors.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    onComplete({
      step3: {
        competitors,
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
              Add competitor URLs to help us understand your market
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Competitor Input */}
            <div className="flex gap-3">
              <Input
                type="text"
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCompetitor()}
                placeholder="Enter competitor URL (e.g., competitor.com)"
                className="h-12 border-[#b0b0d8] focus:border-[#6658f4] focus:ring-[#6658f4]"
              />
              <Button
                onClick={handleAddCompetitor}
                disabled={!newCompetitor.trim() || competitors.length >= 7}
                variant="outline"
                className="h-12 px-4 border-[#b0b0d8]"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            {/* Competitors List */}
            {competitors.length === 0 ? (
              <div className="text-center py-12 text-[#4a4a6a]/70">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-[#b0b0d8]" />
                <p>No competitors added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {competitors.map((competitor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-[#b0b0d8]/30">
                    <span className="text-[#4a4a6a] font-medium">{competitor}</span>
                    <Button
                      onClick={() => handleRemoveCompetitor(index)}
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-sm text-[#4a4a6a]/70 text-center">
              Maximum 7 competitors • {7 - competitors.length} remaining
            </p>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleContinue}
            disabled={loading}
            className="gradient-primary px-8 h-12 min-w-[120px]"
          >
            {loading ? 'Processing...' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step3Competitors;