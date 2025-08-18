import React from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';

const OnboardingProgress = () => {
  const { currentStep, totalSteps } = useOnboarding();

  const steps = [
    { id: 1, title: 'Business', description: 'Business' },
    { id: 2, title: 'Competitors', description: 'Competitors' },
    { id: 3, title: 'Blog', description: 'Blog' },
    { id: 4, title: 'Articles', description: 'Articles' },
    { id: 5, title: 'Keywords', description: 'Keywords' },
    { id: 6, title: 'Integration', description: 'Integration' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                  step.id === currentStep
                    ? 'bg-blue-600 text-white'
                    : step.id < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.id < currentStep ? '✓' : step.id}
              </div>
              <span className="text-xs text-gray-600 mt-2 text-center">
                {step.description}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 transition-all duration-200 ${
                  step.id < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default OnboardingProgress;
