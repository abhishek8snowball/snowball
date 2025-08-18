import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useNavigate } from 'react-router-dom';

const IntegrationSetup = () => {
  const { prevStep, resetOnboarding } = useOnboarding();
  const navigate = useNavigate();

  const handleComplete = async () => {
    try {
      // Save all onboarding data to backend
      const response = await fetch('/api/v1/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth')}`
        }
      });

      if (response.ok) {
        resetOnboarding();
        // Redirect to dashboard where user can see their complete analysis
        navigate('/dashboard');
      } else {
        throw new Error('Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Onboarding completion error:', error);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Complete Your Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 font-medium mb-2">
            🎉 Congratulations! You've completed the onboarding process.
          </p>
          <p className="text-sm text-green-700">
            Your workspace is now configured with all the necessary information to get started.
          </p>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">What's Next?</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Start analyzing your domain and competitors</li>
            <li>• Generate content using your custom prompts</li>
            <li>• Set up integrations with your preferred platforms</li>
            <li>• Access your personalized dashboard</li>
          </ul>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            onClick={prevStep}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            ← Previous
          </Button>
          
          <Button
            onClick={handleComplete}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
          >
            🚀 Complete Setup & Go to Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationSetup;
