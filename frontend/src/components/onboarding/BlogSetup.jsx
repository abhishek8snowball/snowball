import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const BlogSetup = () => {
  const { nextStep, prevStep } = useOnboarding();

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Blog Content Strategy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            This step will be implemented to configure your blog content strategy and preferences.
          </p>
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
            onClick={nextStep}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogSetup;
