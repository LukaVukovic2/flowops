/**
 * Authentication Service
 * Handles API calls for authentication endpoints
 * Requirements: 1.1, 1.2, 1.4
 */

import apiClient from './api.js';

/**
 * Register a new user account
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} [userData.firstName] - User first name (optional)
 * @param {string} [userData.lastName] - User last name (optional)
 * @returns {Promise<{user: Object, token: string}>}
 */
export const register = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

/**
 * Authenticate user and get JWT token
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user: Object, token: string}>}
 */
export const login = async (email, password) => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
};

/**
 * Logout user (client-side token removal)
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    // Call backend logout endpoint (optional, for future token blacklist)
    await apiClient.post('/auth/logout');
  } catch (error) {
    // Continue with logout even if API call fails
    console.warn('Logout API call failed:', error);
  }
  
  // Always clear local storage
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

/**
 * Get current authenticated user profile
 * @returns {Promise<Object>} User profile data
 */
export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

/**
 * Check if user is authenticated (has valid token)
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  return !!token;
};

/**
 * Get stored auth token
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Store auth token in localStorage
 * @param {string} token - JWT token
 */
export const setToken = (token) => {
  localStorage.setItem('authToken', token);
};

/**
 * Store user data in localStorage
 * @param {Object} user - User data
 */
export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Get stored user data
 * @returns {Object|null}
 */
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};
