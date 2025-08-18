import axios from 'axios';
import { toast } from 'react-toastify';

// API Configuration
const API_BASE_URL = 'http://localhost:5000';

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
    const token = localStorage.getItem('auth') || '';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token found and added to request:', token.substring(0, 20) + '...');
    } else {
      console.log('❌ No auth token found in localStorage');
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
  
  // Categories and Prompts
  getCategoryPrompts: (categoryId) => api.get(`/api/v1/brand/categories/${categoryId}/prompts`),
  getPromptResponse: (promptId) => api.get(`/api/v1/brand/prompts/${promptId}/response`),
  
  // Content Calendar
  generateContentCalendar: (data) => api.post('/api/v1/content-calendar/generate', data),
  approveContentCalendar: (data) => api.post('/api/v1/content-calendar/approve', data),
  getContentCalendar: (params) => api.get('/api/v1/content-calendar', { params }),
  updateCalendarEntry: (id, data) => api.put(`/api/v1/content-calendar/${id}`, data),
  deleteCalendarEntry: (id) => api.delete(`/api/v1/content-calendar/${id}`),
  
  // Blog Editor - Individual Post Management
  getContentCalendarEntry: (id) => api.get(`/api/v1/content-calendar/${id}`),
  createContentCalendarEntry: (data) => api.post('/api/v1/content-calendar/entry', data),
  updateContentCalendarEntry: (id, data) => api.put(`/api/v1/content-calendar/${id}`, data),
  generateContentOutline: async (postId, outlineData) => {
    try {
      const response = await api.post(`/api/v1/content-calendar/${postId}/generate-outline`, outlineData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create blog content from outline
  createBlogFromOutline: async (postId, blogData) => {
    try {
      const response = await api.post(`/api/v1/content-calendar/${postId}/create-blog`, blogData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Publish content to Shopify
  publishContent: async (postId) => {
    try {
      const response = await api.post(`/api/v1/content-calendar/${postId}/publish`, {});
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // CMS Credentials
  saveCMSCredentials: (data) => api.post('/api/v1/cms-credentials', data),
  getCMSCredentials: (params) => api.get('/api/v1/cms-credentials', { params }),
  testCMSConnection: (data) => api.post('/api/v1/cms-credentials/test', data),
  deleteCMSCredentials: (id) => api.delete(`/api/v1/cms-credentials/${id}`),
  deactivateCMSCredentials: (id) => api.patch(`/api/v1/cms-credentials/${id}/deactivate`),
  
  // Auto-publishing
  triggerAutoPublish: (data) => api.post('/api/v1/content-calendar/trigger-publish', data),
  fixContentPlatform: (data) => api.post('/api/v1/content-calendar/fix-platform', data),
  

  
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

  // Create minimal brand profile for blog analysis (without full analysis)
  createMinimalBrand: (data) => {
    console.log('Creating minimal brand profile for:', data.domain);
    return api.post('/api/v1/brand/create-minimal-brand', data, {
      timeout: 30000, // 30 seconds for brand profile creation
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
  
  // Brand Settings
  getBrandSettings: () => api.get('/api/v1/brand-settings'),
  saveBrandSettings: (data) => api.post('/api/v1/brand-settings', data),
  refreshBrandVoice: () => api.post('/api/v1/brand-settings/refresh'),
  
  // Removed unused legacy endpoints
};

export default api; 
