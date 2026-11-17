/**
 * Announcement Service
 * API client for announcement operations
 * Requirements: 3.1, 3.2, 3.3, 3.6, 3.7, 3.8, 17.2
 */

import apiClient from './api.js';

/**
 * Get all announcements with optional filtering
 * @param {Object} filters - Filter parameters (categoryId, authorId)
 * @returns {Promise<Array>} List of announcements
 */
export const getAnnouncements = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.authorId) params.append('authorId', filters.authorId);
  
  const response = await apiClient.get(`/announcements?${params.toString()}`);
  return response.data;
};

/**
 * Get single announcement by ID
 * @param {string} id - Announcement ID
 * @returns {Promise<Object>} Announcement details
 */
export const getAnnouncementById = async (id) => {
  const response = await apiClient.get(`/announcements/${id}`);
  return response.data;
};

/**
 * Create new announcement
 * @param {Object} announcementData - Announcement data (title, content, categoryId, imageUrl)
 * @returns {Promise<Object>} Created announcement
 */
export const createAnnouncement = async (announcementData) => {
  const response = await apiClient.post('/announcements', announcementData);
  return response.data;
};

/**
 * Update existing announcement
 * @param {string} id - Announcement ID
 * @param {Object} announcementData - Updated announcement data
 * @returns {Promise<Object>} Updated announcement
 */
export const updateAnnouncement = async (id, announcementData) => {
  const response = await apiClient.put(`/announcements/${id}`, announcementData);
  return response.data;
};

/**
 * Publish or unpublish announcement
 * @param {string} id - Announcement ID
 * @param {boolean} isPublished - Publish status
 * @returns {Promise<Object>} Updated announcement
 */
export const publishAnnouncement = async (id, isPublished) => {
  const response = await apiClient.patch(`/announcements/${id}/publish`, { isPublished });
  return response.data;
};

/**
 * Soft delete announcement
 * @param {string} id - Announcement ID
 * @returns {Promise<void>}
 */
export const deleteAnnouncement = async (id) => {
  await apiClient.delete(`/announcements/${id}`);
};

/**
 * Get all announcement categories
 * @returns {Promise<Array>} List of categories
 */
export const getCategories = async () => {
  const response = await apiClient.get('/announcements/categories');
  return response.data;
};

/**
 * Get single category by ID
 * @param {string} id - Category ID
 * @returns {Promise<Object>} Category details
 */
export const getCategoryById = async (id) => {
  const response = await apiClient.get(`/announcements/categories/${id}`);
  return response.data;
};

/**
 * Create new announcement category
 * @param {Object} categoryData - Category data (name, description, color)
 * @returns {Promise<Object>} Created category
 */
export const createCategory = async (categoryData) => {
  const response = await apiClient.post('/announcements/categories', categoryData);
  return response.data;
};

/**
 * Update existing category
 * @param {string} id - Category ID
 * @param {Object} categoryData - Updated category data
 * @returns {Promise<Object>} Updated category
 */
export const updateCategory = async (id, categoryData) => {
  const response = await apiClient.put(`/announcements/categories/${id}`, categoryData);
  return response.data;
};

/**
 * Delete category
 * @param {string} id - Category ID
 * @returns {Promise<void>}
 */
export const deleteCategory = async (id) => {
  await apiClient.delete(`/announcements/categories/${id}`);
};

export default {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  publishAnnouncement,
  deleteAnnouncement,
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
