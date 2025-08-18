import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Store the token in localStorage
      localStorage.setItem('auth', token);
      
      // You can also store user info if needed
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        localStorage.setItem('user', JSON.stringify({
          id: payload.id,
          email: payload.email,
          name: payload.name
        }));
      } catch (error) {
        console.error('Error parsing token:', error);
      }
      
                   // Redirect to onboarding or dashboard based on completion status
             setTimeout(async () => {
               try {
                 // Check if user has completed onboarding
                 const response = await fetch('/api/v1/onboarding/status', {
                   headers: {
                     'Authorization': `Bearer ${token}`
                   }
                 });
                 
                 if (response.ok) {
                   const status = await response.json();
                   console.log('🔍 Onboarding status:', status);
                   
                   if (status.shouldRedirectToDashboard) {
                     console.log('🚀 User has substantial data, redirecting to dashboard');
                     navigate('/dashboard');
                   } else {
                     console.log('📝 User needs onboarding, redirecting to onboarding flow');
                     navigate('/onboarding');
                   }
                 } else {
                   // If can't check status, go to onboarding
                   console.log('❌ Could not check status, defaulting to onboarding');
                   navigate('/onboarding');
                 }
               } catch (error) {
                 console.error('Error checking onboarding status:', error);
                 navigate('/onboarding');
               }
             }, 2000);
    } else {
      setError('No authentication token received');
      setLoading(false);
    }
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Successful!</h2>
          <p className="text-gray-600 mb-4">Setting up your session...</p>
          <p className="text-sm text-gray-500">Checking your account status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthSuccess;
