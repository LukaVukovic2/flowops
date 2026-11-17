/**
 * Ticket Model
 * Data access layer for ticket management
 * Requirements: 2.1, 2.6, 2.7
 */

import supabase from '../config/database.js';

/**
 * Create a new ticket
 * @param {Object} ticketData - Ticket information
 * @param {string} ticketData.title - Ticket title
 * @param {string} ticketData.description - Ticket description
 * @param {string} ticketData.priority - Ticket priority (optional)
 * @param {string} ticketData.creatorId - User ID of the creator
 * @param {string} ticketData.assigneeId - User ID of assignee (optional)
 * @param {string} ticketData.assetId - Asset ID (optional)
 * @returns {Promise<Object>} Created ticket
 */
export async function createTicket(ticketData) {
  const { title, description, priority, creatorId, assigneeId, assetId } = ticketData;

  // Ensure all timestamps are in UTC (Supabase handles this by default with TIMESTAMP WITH TIME ZONE)
  const { data, error } = await supabase
    .from('tickets')
    .insert([
      {
        title,
        description,
        status: 'Nova', // Auto-assign status "Nova" as per requirements
        priority: priority || null,
        creator_id: creatorId,
        assignee_id: assigneeId || null,
        asset_id: assetId || null,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create ticket: ${error.message}`);
  }

  return data;
}

/**
 * Get ticket by ID
 * @param {string} ticketId - Ticket UUID
 * @returns {Promise<Object|null>} Ticket or null if not found
 */
export async function getTicketById(ticketId) {
  const { data, error } = await supabase
    .from('tickets')
    .select(
      `
      *,
      creator:users!tickets_creator_id_fkey(id, email, first_name, last_name, role),
      assignee:users!tickets_assignee_id_fkey(id, email, first_name, last_name, role)
    `
    )
    .eq('id', ticketId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to get ticket: ${error.message}`);
  }

  return data;
}

/**
 * Get tickets with filtering and pagination
 * @param {Object} filters - Filter parameters
 * @param {string} filters.status - Filter by status (optional)
 * @param {string} filters.creatorId - Filter by creator (optional)
 * @param {string} filters.assigneeId - Filter by assignee (optional)
 * @param {string} filters.fromDate - Filter by creation date from (optional)
 * @param {string} filters.toDate - Filter by creation date to (optional)
 * @param {number} filters.page - Page number (default: 1)
 * @param {number} filters.limit - Items per page (default: 20)
 * @returns {Promise<Object>} Paginated tickets
 */
export async function getTickets(filters = {}) {
  const {
    status,
    creatorId,
    assigneeId,
    fromDate,
    toDate,
    page = 1,
    limit = 20,
  } = filters;

  let query = supabase
    .from('tickets')
    .select(
      `
      *,
      creator:users!tickets_creator_id_fkey(id, email, first_name, last_name, role),
      assignee:users!tickets_assignee_id_fkey(id, email, first_name, last_name, role)
    `,
      { count: 'exact' }
    );

  // Apply filters
  if (status) {
    query = query.eq('status', status);
  }
  if (creatorId) {
    query = query.eq('creator_id', creatorId);
  }
  if (assigneeId) {
    query = query.eq('assignee_id', assigneeId);
  }
  if (fromDate) {
    query = query.gte('created_at', fromDate);
  }
  if (toDate) {
    query = query.lte('created_at', toDate);
  }

  // Apply pagination
  const offset = (page - 1) * limit;
  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to get tickets: ${error.message}`);
  }

  return {
    tickets: data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

/**
 * Update ticket
 * @param {string} ticketId - Ticket UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated ticket
 */
export async function updateTicket(ticketId, updates) {
  // Extract allowed fields for update
  const allowedFields = ['title', 'description', 'priority', 'assignee_id', 'asset_id'];
  const updateData = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field];
    }
  }

  // updated_at is automatically handled by the trigger
  const { data, error } = await supabase
    .from('tickets')
    .update(updateData)
    .eq('id', ticketId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update ticket: ${error.message}`);
  }

  return data;
}

/**
 * Update ticket status
 * @param {string} ticketId - Ticket UUID
 * @param {string} status - New status
 * @param {string} userId - User making the change
 * @returns {Promise<Object>} Updated ticket
 */
export async function updateTicketStatus(ticketId, status, userId) {
  const validStatuses = ['Nova', 'U radu', 'Na čekanju', 'Riješena', 'Zatvorena'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  const updateData = { status };

  // Set resolved_at when status changes to "Riješena"
  if (status === 'Riješena') {
    updateData.resolved_at = new Date().toISOString();
  }

  // Set closed_at when status changes to "Zatvorena"
  if (status === 'Zatvorena') {
    updateData.closed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('tickets')
    .update(updateData)
    .eq('id', ticketId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update ticket status: ${error.message}`);
  }

  return data;
}

/**
 * Delete ticket (soft delete in future, hard delete for now)
 * @param {string} ticketId - Ticket UUID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteTicket(ticketId) {
  const { error } = await supabase.from('tickets').delete().eq('id', ticketId);

  if (error) {
    throw new Error(`Failed to delete ticket: ${error.message}`);
  }

  return true;
}
