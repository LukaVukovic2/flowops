/**
 * User Service - User Management API Calls
 * Requirements: 5.5, 5.9, 12.1
 */

import apiClient from './api.js';

/**
 * Get all users with pagination and filtering
 * @param {Object} params - Query parameters (page, limit, role, isActive)
 * @returns {Promise<Object>} Users list with pagination metadata
 */
export const getUsers = async (params = {}) => {
  const response = await apiClient.get('/users', { params });
  return response.data;
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User object
 */
export const getUserById = async (userId) => {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data;
};

/**
 * Update user role
 * @param {string} userId - User ID
 * @param {string} newRole - New role value
 * @returns {Promise<Object>} Updated user object
 */
export const updateUserRole = async (userId, newRole) => {
  const response = await apiClient.patch(`/users/${userId}/role`, { role: newRole });
  return response.data;
};

/**
 * Deactivate user account
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated user object
 */
export const deactivateUser = async (userId) => {
  const response = await apiClient.patch(`/users/${userId}/deactivate`);
  return response.data;
};

/**
 * Activate user account
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated user object
 */
export const activateUser = async (userId) => {
  const response = await apiClient.patch(`/users/${userId}/activate`);
  return response.data;
};

/**
 * Reset user password
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Success message
 */
export const resetUserPassword = async (userId) => {
  const response = await apiClient.patch(`/users/${userId}/reset-password`);
  return response.data;
};

/**
 * Get users by role
 * @param {string} role - User role to filter by
 * @returns {Promise<Array>} List of users with specified role
 */
export const getUsersByRole = async (role) => {
  const response = await apiClient.get('/users', { 
    params: { role, limit: 100 } 
  });
  return response.data.users || response.data;
};
