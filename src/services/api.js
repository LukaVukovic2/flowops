/**
 * API Service - Base Axios Configuration
 * Implements automatic JWT token injection for authenticated requests
 * Requirements: 1.1, 1.4, 9.1, 9.2
 */

import axios from 'axios';

// Base API URL - defaults to localhost:3000 in development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Create axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

/**
 * Request interceptor - Automatically inject JWT token from localStorage
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle token expiry and errors
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response && error.response.status === 401) {
      // Clear token from localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Dispatch custom event for automatic logout
      window.dispatchEvent(new CustomEvent('auth:token-expired'));
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
