import React, { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { apiService } from '../utils/api';

const GoogleSignIn = ({ onSuccess, onError, disabled = false }) => {
  const googleButtonRef = useRef();

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    console.log('🔑 Google Client ID:', clientId);
    console.log('🌐 Environment variables:', import.meta.env);
    
    if (!clientId) {
      console.error('❌ Google Client ID is missing from environment variables');
      return;
    }
    
    const initializeGoogle = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        console.log('✅ Google API loaded, initializing with Client ID:', clientId.substring(0, 20) + '...');
        
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          if (googleButtonRef.current) {
            window.google.accounts.id.renderButton(
              googleButtonRef.current,
              {
                theme: 'outline',
                size: 'large',
                type: 'standard',
                shape: 'rectangular',
                text: 'signin_with',
                logo_alignment: 'left',
                width: '100%'
              }
            );
          }
        } catch (error) {
          console.error('❌ Google Sign-in initialization error:', error);
        }
      } else {
        console.log('⏳ Google API not loaded yet, retrying in 100ms...');
        setTimeout(initializeGoogle, 100);
      }
    };

    if (!disabled) {
      initializeGoogle();
    }
  }, [disabled]);

  const handleCredentialResponse = async (response) => {
    try {
      console.log('Google credential response:', response);
      
      // Send the Google ID token to our backend for verification
      const result = await apiService.post('/api/v1/auth/google', {
        idToken: response.credential
      });

      if (result.data.success && result.data.token) {
        // Store the auth token
        localStorage.setItem('auth', result.data.token);
        toast.success('Google sign-in successful!');
        
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        throw new Error('Failed to authenticate with Google');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      const errorMessage = error.response?.data?.msg || 'Google sign-in failed. Please try again.';
      toast.error(errorMessage);
      
      if (onError) {
        onError(error);
      }
    }
  };

  if (disabled) {
    return (
      <div className="w-full h-12 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-400 text-sm">Google Sign-in unavailable</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={googleButtonRef} className="w-full flex justify-center"></div>
    </div>
  );
};

export default GoogleSignIn;