import axios from 'axios';
import { toast } from 'react-toastify';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

console.log('API Base URL:', API_BASE_URL);

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000, // 3 minutes timeout for long-running operations (increased for Perplexity API calls)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = JSON.parse(localStorage.getItem('auth')) || '';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.message);
    const message = error.response?.data?.msg || error.message || 'An error occurred';
    
    // Handle different error types
    if (error.response?.status === 401) {
      localStorage.removeItem('auth');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('Access denied');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      // Don't show toast for timeout errors - let components handle them
      console.error('Request timeout:', error);
    } else {
      // Only show toast for client-side errors, not for domain analysis timeouts
      if (!error.config?.url?.includes('/brand/analyze')) {
        toast.error(message);
      }
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Authentication
  login: (data) => api.post('/api/v1/login', data),
  register: (data) => api.post('/api/v1/register', data),
  
  // Dashboard
  getDashboard: () => api.get('/api/v1/dashboard'),
  
  // Brand Analysis - with longer timeout for Perplexity API calls
  analyzeBrand: (data) => {
    console.log('Starting brand analysis with data:', data);
    return api.post('/api/v1/brand/analyze', data, {
      timeout: 360000, // 6 minutes for domain analysis (increased for Perplexity API calls)
    });
  },
  getBrandRank: () => api.get('/api/v1/brand/rank'),
  getCompetitors: (data) => api.post('/api/v1/brand/competitors', data),
  getShareOfVoice: (data) => api.post('/api/v1/brand/share-of-voice', data),
  generatePrompts: (data) => api.post('/api/v1/brand/queries', data),
  
  // Categories and Prompts
  getCategoryPrompts: (categoryId) => api.get(`/api/v1/brand/categories/${categoryId}/prompts`),
  getPromptResponse: (promptId) => api.get(`/api/v1/brand/prompts/${promptId}/response`),
  
  // Debug
  debugAIResponses: () => api.get('/api/v1/brand/debug/ai-responses'),
  
  // Blog Analysis
  getBlogAnalysis: (brandId) => api.get(`/api/v1/brand/${brandId}/blogs`),
  
  // History
  getHistory: () => api.get('/api/v1/history'),
  deleteHistory: (id) => api.delete(`/api/v1/history/${id}`),
  
  // Legacy endpoints (for backward compatibility)
  analyzeLink: (data) => api.post('/api/v1/analyze', data),
  getSuggestions: (data) => api.post('/api/v1/suggest', data),
};

export default api; 