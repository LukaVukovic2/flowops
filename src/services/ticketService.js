/**
 * Ticket Service
 * API client for ticket operations
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.9
 */

import apiClient from './api.js';

/**
 * Get all tickets with optional filtering
 * @param {Object} filters - Filter parameters (status, assigneeId, creatorId, dateFrom, dateTo)
 * @returns {Promise<Array>} List of tickets
 */
export const getTickets = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.assigneeId) params.append('assigneeId', filters.assigneeId);
  if (filters.creatorId) params.append('creatorId', filters.creatorId);
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.append('dateTo', filters.dateTo);
  
  const response = await apiClient.get(`/tickets?${params.toString()}`);
  return response.data;
};

/**
 * Get single ticket by ID
 * @param {number} id - Ticket ID
 * @returns {Promise<Object>} Ticket details
 */
export const getTicketById = async (id) => {
  const response = await apiClient.get(`/tickets/${id}`);
  return response.data;
};

/**
 * Create new ticket
 * @param {Object} ticketData - Ticket data (title, description, priority)
 * @returns {Promise<Object>} Created ticket
 */
export const createTicket = async (ticketData) => {
  const response = await apiClient.post('/tickets', ticketData);
  return response.data;
};

/**
 * Update existing ticket
 * @param {number} id - Ticket ID
 * @param {Object} ticketData - Updated ticket data
 * @returns {Promise<Object>} Updated ticket
 */
export const updateTicket = async (id, ticketData) => {
  const response = await apiClient.put(`/tickets/${id}`, ticketData);
  return response.data;
};

/**
 * Update ticket status
 * @param {number} id - Ticket ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated ticket
 */
export const updateTicketStatus = async (id, status) => {
  const response = await apiClient.patch(`/tickets/${id}/status`, { status });
  return response.data;
};

/**
 * Get ticket history
 * @param {number} id - Ticket ID
 * @returns {Promise<Array>} Ticket history entries
 */
export const getTicketHistory = async (id) => {
  const response = await apiClient.get(`/tickets/${id}/history`);
  return response.data;
};

/**
 * Get ticket comments
 * @param {number} id - Ticket ID
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 20)
 * @returns {Promise<Object>} Comments with pagination
 */
export const getTicketComments = async (id, page = 1, limit = 20) => {
  const response = await apiClient.get(`/tickets/${id}/comments`, {
    params: { page, limit }
  });
  return response.data;
};

/**
 * Add comment to ticket
 * @param {number} id - Ticket ID
 * @param {string} content - Comment content
 * @returns {Promise<Object>} Created comment
 */
export const addTicketComment = async (id, content) => {
  const response = await apiClient.post(`/tickets/${id}/comments`, { content });
  return response.data;
};

/**
 * Delete ticket
 * @param {number} id - Ticket ID
 * @returns {Promise<void>}
 */
export const deleteTicket = async (id) => {
  await apiClient.delete(`/tickets/${id}`);
};

export default {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  updateTicketStatus,
  getTicketHistory,
  getTicketComments,
  addTicketComment,
  deleteTicket
};
