/**
 * Dashboard Service
 * API calls for dashboard statistics and recent activity
 * Requirements: 6.1, 6.2, 6.3, 6.7
 */

import apiClient from './api.js';

/**
 * Get dashboard statistics
 * Returns role-appropriate statistics for the authenticated user
 * @returns {Promise<Object>} Dashboard statistics
 */
export async function getDashboardStats() {
  try {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

/**
 * Get recent dashboard activity
 * Returns recent tickets and announcements
 * @param {number} limit - Number of items to return (default: 10)
 * @returns {Promise<Object>} Recent activity
 */
export async function getRecentActivity(limit = 10) {
  try {
    const response = await apiClient.get('/dashboard/recent-activity', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }
}
