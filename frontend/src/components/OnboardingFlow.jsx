import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../utils/api';
import Step1Business from './onboarding/Step1Business';
import Step2Categories from './onboarding/Step2Categories';
import Step3Competitors from './onboarding/Step3Competitors';
import Step4Prompts from './onboarding/Step4Prompts';
import ProgressBar from './onboarding/ProgressBar';

const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadUserProgress();
  }, []);

  const loadUserProgress = async () => {
    try {
      const response = await apiService.getOnboardingProgress();
      if (response.data.currentStep > 1) {
        setCurrentStep(response.data.currentStep);
        setProgress(response.data.stepData);
      }
    } catch (error) {
      console.log('No saved progress found, starting from step 1');
    }
  };

  const saveProgress = async (stepData) => {
    try {
      await apiService.saveOnboardingProgress({
        currentStep,
        stepData: { ...progress, ...stepData }
      });
      setProgress(prev => ({ ...prev, ...stepData }));
    } catch (error) {
      console.error('Failed to save progress:', error);
      setError('Failed to save progress. Please try again.');
    }
  };

  const handleStepComplete = async (stepData, nextStep) => {
    try {
      setLoading(true);
      setError('');
      
      // Save progress for current step
      await saveProgress(stepData);
      
      if (nextStep <= 4) {
        setCurrentStep(nextStep);
      } else {
        // Onboarding completed, trigger remaining analysis
        await completeOnboarding();
      }
    } catch (error) {
      console.error('Step completion failed:', error);
      setError('Failed to complete step. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      console.log('🚀 Starting onboarding completion...');
      
      // Mark onboarding as completed and trigger remaining analysis
      const response = await apiService.completeOnboarding();
      
      if (response.data.success) {
        console.log('✅ Onboarding completed successfully:', response.data.analysisSteps);
        
        // Redirect to the existing DomainAnalysis page (not a separate dashboard)
        navigate('/domain-analysis');
      } else {
        throw new Error('Onboarding completion failed');
      }
    } catch (error) {
      console.error('Onboarding completion failed:', error);
      setError('Failed to complete onboarding. Please try again.');
    }
  };



  const renderCurrentStep = () => {
    const commonProps = {
      onComplete: handleStepComplete,
      loading,
      error,
      progress
    };

    switch (currentStep) {
      case 1:
        return <Step1Business {...commonProps} />;
      case 2:
        return <Step2Categories {...commonProps} />;
      case 3:
        return <Step3Competitors {...commonProps} />;
      case 4:
        return <Step4Prompts {...commonProps} />;
      default:
        return <Step1Business {...commonProps} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-6">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7765e3] mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-[#4a4a6a] mb-3">Completing onboarding...</p>
          <p className="text-[#4a4a6a] mb-2">Generating AI responses, extracting mentions, and calculating Share of Voice</p>
          <p className="text-sm text-[#4a4a6a]/70">This may take a few minutes as we analyze your brand data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <h1 className="text-3xl font-semibold text-[#4a4a6a] mb-3">
            Welcome to Snowball
          </h1>
          <p className="text-[#4a4a6a]">
            Let's set up your brand analysis in just a few steps
          </p>
        </div>

        <ProgressBar currentStep={currentStep} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white border border-[#b0b0d8] rounded-lg p-8">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
