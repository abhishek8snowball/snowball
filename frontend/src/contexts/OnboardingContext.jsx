import React, { createContext, useContext, useReducer } from 'react';

const OnboardingContext = createContext();

const initialState = {
  currentStep: 1,
  totalSteps: 6,
  businessData: {
    domain: '',
    businessName: '',
    description: '',
    targetAudiences: []
  },
  competitors: [],
  categories: [],
  prompts: [],
  isLoading: false,
  error: null
};

const onboardingReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'SET_BUSINESS_DATA':
      console.log('🔄 SET_BUSINESS_DATA called with:', action.payload);
      console.log('🔄 Current businessData:', state.businessData);
      const newBusinessData = { ...state.businessData, ...action.payload };
      console.log('🔄 New businessData:', newBusinessData);
      return { 
        ...state, 
        businessData: newBusinessData
      };
    
    case 'SET_COMPETITORS':
      return { ...state, competitors: action.payload };
    
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    
    case 'SET_PROMPTS':
      return { ...state, prompts: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(state.currentStep + 1, state.totalSteps) };
    
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1) };
    
    case 'RESET_ONBOARDING':
      return initialState;
    
    default:
      return state;
  }
};

export const OnboardingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  const value = {
    ...state,
    dispatch,
    nextStep: () => dispatch({ type: 'NEXT_STEP' }),
    prevStep: () => dispatch({ type: 'PREV_STEP' }),
    setCurrentStep: (step) => dispatch({ type: 'SET_CURRENT_STEP', payload: step }),
    setBusinessData: (data) => dispatch({ type: 'SET_BUSINESS_DATA', payload: data }),
    setCompetitors: (competitors) => dispatch({ type: 'SET_COMPETITORS', payload: competitors }),
    setCategories: (categories) => dispatch({ type: 'SET_CATEGORIES', payload: categories }),
    setPrompts: (prompts) => dispatch({ type: 'SET_PROMPTS', payload: prompts }),
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
    resetOnboarding: () => dispatch({ type: 'RESET_ONBOARDING' })
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
