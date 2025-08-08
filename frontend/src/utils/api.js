import axios from 'axios';
import { toast } from 'react-toastify';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', import.meta.env.MODE);

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
  logout: () => {
    localStorage.removeItem('auth');
    window.location.href = '/login';
  },
  
  // Removed unused getDashboard endpoint
  
  // Brand Analysis - with longer timeout for Perplexity API calls
  analyzeBrand: (data) => {
    console.log('Starting brand analysis with data:', data);
    return api.post('/api/v1/brand/analyze', data, {
      timeout: 360000, // 6 minutes for domain analysis (increased for Perplexity API calls)
    });
  },
  getBrandAnalysis: (brandId) => {
    console.log('Getting existing brand analysis for brandId:', brandId);
    return api.get(`/api/v1/brand/analysis/${brandId}`);
  },
  getUserBrands: () => {
    console.log('Getting user brands');
    return api.get('/api/v1/brand/user/brands');
  },
  // Removed unused API methods that called mock endpoints
  
  // Categories and Prompts
  getCategoryPrompts: (categoryId) => api.get(`/api/v1/brand/categories/${categoryId}/prompts`),
  getPromptResponse: (promptId) => api.get(`/api/v1/brand/prompts/${promptId}/response`),
  
  // Removed unused debug endpoint
  
  // Blog Analysis
  getBlogAnalysis: (brandId) => api.get(`/api/v1/brand/${brandId}/blogs`),
  triggerBlogAnalysis: (brandId) => api.post(`/api/v1/brand/${brandId}/blogs`),
  
  // Blog Extraction (separate from main analysis)
  extractBlogs: (data) => {
    console.log('Starting blog extraction for:', data.domain);
    return api.post('/api/v1/brand/extract-blogs', data, {
      timeout: 300000, // 5 minutes for blog extraction
    });
  },

  // Trigger blog analysis for domain analysis
  triggerBlogAnalysis: (brandId) => {
    console.log('Triggering blog analysis for brandId:', brandId);
    return api.post(`/api/v1/brand/${brandId}/trigger-blog-analysis`, {}, {
      timeout: 300000, // 5 minutes for blog analysis
    });
  },
  
  // Blog Scoring - with timeout for OpenAI API calls
  scoreSingleBlog: (brandId, blogUrl) => {
    console.log('Starting blog scoring for:', blogUrl);
    return api.post(`/api/v1/brand/${brandId}/blogs/score`, { blogUrl }, {
      timeout: 120000, // 2 minutes for blog scoring
    });
  },
  getBlogScores: (brandId) => api.get(`/api/v1/brand/${brandId}/blogs/scores`),
  
  // History
  getHistory: () => api.get('/api/v1/history'),
  deleteHistory: (id) => api.delete(`/api/v1/history/${id}`),
  
  // Removed unused legacy endpoints
};

export default api; 