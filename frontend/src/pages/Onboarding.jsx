import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../contexts/OnboardingContext';
import OnboardingProgress from '../components/OnboardingProgress';
import BusinessSetup from '../components/onboarding/BusinessSetup';
import CompetitorsSetup from '../components/onboarding/CompetitorsSetup';
import CategoriesSetup from '../components/onboarding/CategoriesSetup';
import PromptsSetup from '../components/onboarding/PromptsSetup';
import BlogSetup from '../components/onboarding/BlogSetup';
import IntegrationSetup from '../components/onboarding/IntegrationSetup';

const Onboarding = () => {
  const { currentStep, isLoading, error } = useOnboarding();
  const navigate = useNavigate();

  // Check if user is authenticated and should be in onboarding
  useEffect(() => {
    const checkUserStatus = async () => {
      const token = localStorage.getItem('auth');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Check if user already has substantial data
        const response = await fetch('/api/v1/onboarding/status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const status = await response.json();
          console.log('🔍 Onboarding user status check:', status);
          
          if (status.shouldRedirectToDashboard) {
            console.log('🚀 User already has substantial data, redirecting to dashboard');
            navigate('/dashboard');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        // On error, stay in onboarding (safer default)
      }
    };

    checkUserStatus();
  }, [navigate]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <BusinessSetup />;
      case 2:
        return <CompetitorsSetup />;
      case 3:
        return <CategoriesSetup />;
      case 4:
        return <PromptsSetup />;
      case 5:
        return <BlogSetup />;
      case 6:
        return <IntegrationSetup />;
      default:
        return <BusinessSetup />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Setting up your workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <OnboardingProgress />
        <div className="mt-8">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
