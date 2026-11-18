/**
 * Asset Service
 * API client for asset operations
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9
 */

import apiClient from './api.js';

/**
 * Get all assets with optional filtering
 * @param {Object} filters - Filter parameters (type, status, location, page, limit)
 * @returns {Promise<Object>} Assets with pagination
 */
export const getAssets = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.type) params.append('type', filters.type);
  if (filters.status) params.append('status', filters.status);
  if (filters.location) params.append('location', filters.location);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  const response = await apiClient.get(`/assets?${params.toString()}`);
  return response.data;
};

/**
 * Get single asset by ID
 * @param {string} id - Asset ID
 * @returns {Promise<Object>} Asset details
 */
export const getAssetById = async (id) => {
  const response = await apiClient.get(`/assets/${id}`);
  return response.data;
};

/**
 * Create new asset
 * @param {Object} assetData - Asset data
 * @returns {Promise<Object>} Created asset
 */
export const createAsset = async (assetData) => {
  const response = await apiClient.post('/assets', assetData);
  return response.data;
};

/**
 * Update existing asset
 * @param {string} id - Asset ID
 * @param {Object} assetData - Updated asset data
 * @returns {Promise<Object>} Updated asset
 */
export const updateAsset = async (id, assetData) => {
  const response = await apiClient.put(`/assets/${id}`, assetData);
  return response.data;
};

/**
 * Delete asset
 * @param {string} id - Asset ID
 * @returns {Promise<void>}
 */
export const deleteAsset = async (id) => {
  await apiClient.delete(`/assets/${id}`);
};

/**
 * Get tickets linked to an asset
 * @param {string} id - Asset ID
 * @returns {Promise<Array>} List of linked tickets
 */
export const getAssetTickets = async (id) => {
  const response = await apiClient.get(`/assets/${id}/tickets`);
  return response.data;
};

export default {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetTickets
};
