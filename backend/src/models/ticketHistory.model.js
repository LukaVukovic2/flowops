/**
 * Ticket History Model
 * Data access layer for ticket change tracking
 * Requirements: 2.6
 */

import supabase from '../config/database.js';

/**
 * Create a ticket history entry
 * @param {Object} historyData - History entry data
 * @param {string} historyData.ticketId - Ticket UUID
 * @param {string} historyData.userId - User who made the change
 * @param {string} historyData.action - Action type (e.g., 'status_changed', 'assigned', 'updated')
 * @param {string} historyData.oldValue - Previous value (optional)
 * @param {string} historyData.newValue - New value (optional)
 * @returns {Promise<Object>} Created history entry
 */
export async function createTicketHistory(historyData) {
  const { ticketId, userId, action, oldValue, newValue } = historyData;

  // Ensure timestamps are stored in UTC (handled by database default)
  const { data, error } = await supabase
    .from('ticket_history')
    .insert([
      {
        ticket_id: ticketId,
        user_id: userId,
        action,
        old_value: oldValue || null,
        new_value: newValue || null,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create ticket history: ${error.message}`);
  }

  return data;
}

/**
 * Get ticket history by ticket ID
 * @param {string} ticketId - Ticket UUID
 * @returns {Promise<Array>} Array of history entries in chronological order
 */
export async function getTicketHistory(ticketId) {
  const { data, error } = await supabase
    .from('ticket_history')
    .select(
      `
      *,
      user:users!ticket_history_user_id_fkey(id, email, first_name, last_name, role)
    `
    )
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to get ticket history: ${error.message}`);
  }

  return data;
}

/**
 * Record a status change in ticket history
 * @param {string} ticketId - Ticket UUID
 * @param {string} userId - User making the change
 * @param {string} oldStatus - Previous status
 * @param {string} newStatus - New status
 * @returns {Promise<Object>} Created history entry
 */
export async function recordStatusChange(ticketId, userId, oldStatus, newStatus) {
  return createTicketHistory({
    ticketId,
    userId,
    action: 'status_changed',
    oldValue: oldStatus,
    newValue: newStatus,
  });
}

/**
 * Record an assignment change in ticket history
 * @param {string} ticketId - Ticket UUID
 * @param {string} userId - User making the change
 * @param {string|null} oldAssigneeId - Previous assignee ID
 * @param {string|null} newAssigneeId - New assignee ID
 * @returns {Promise<Object>} Created history entry
 */
export async function recordAssignmentChange(ticketId, userId, oldAssigneeId, newAssigneeId) {
  return createTicketHistory({
    ticketId,
    userId,
    action: 'assigned',
    oldValue: oldAssigneeId || 'Unassigned',
    newValue: newAssigneeId || 'Unassigned',
  });
}

/**
 * Record a ticket update in history
 * @param {string} ticketId - Ticket UUID
 * @param {string} userId - User making the change
 * @param {string} field - Field that was updated
 * @param {string} oldValue - Previous value
 * @param {string} newValue - New value
 * @returns {Promise<Object>} Created history entry
 */
export async function recordFieldUpdate(ticketId, userId, field, oldValue, newValue) {
  return createTicketHistory({
    ticketId,
    userId,
    action: `${field}_updated`,
    oldValue: String(oldValue),
    newValue: String(newValue),
  });
}

/**
 * Record ticket creation in history
 * @param {string} ticketId - Ticket UUID
 * @param {string} userId - User who created the ticket
 * @returns {Promise<Object>} Created history entry
 */
export async function recordTicketCreation(ticketId, userId) {
  return createTicketHistory({
    ticketId,
    userId,
    action: 'created',
    oldValue: null,
    newValue: 'Nova',
  });
}

/**
 * Delete all history entries for a ticket
 * Used when a ticket is deleted
 * @param {string} ticketId - Ticket UUID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteTicketHistory(ticketId) {
  const { error } = await supabase
    .from('ticket_history')
    .delete()
    .eq('ticket_id', ticketId);

  if (error) {
    throw new Error(`Failed to delete ticket history: ${error.message}`);
  }

  return true;
}
