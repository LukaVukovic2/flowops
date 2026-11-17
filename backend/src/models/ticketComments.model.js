/**
 * Ticket Comments Model
 * Data access layer for ticket comments
 * Requirements: 2.7
 */

import supabase from '../config/database.js';

/**
 * Create a new comment on a ticket
 * @param {Object} commentData - Comment data
 * @param {string} commentData.ticketId - Ticket UUID
 * @param {string} commentData.authorId - User ID of the comment author
 * @param {string} commentData.content - Comment content
 * @returns {Promise<Object>} Created comment
 */
export async function createComment(commentData) {
  const { ticketId, authorId, content } = commentData;

  // Ensure timestamps are stored in UTC (handled by database default)
  const { data, error } = await supabase
    .from('ticket_comments')
    .insert([
      {
        ticket_id: ticketId,
        author_id: authorId,
        content,
      },
    ])
    .select(
      `
      *,
      author:users!ticket_comments_author_id_fkey(id, email, first_name, last_name, role)
    `
    )
    .single();

  if (error) {
    throw new Error(`Failed to create comment: ${error.message}`);
  }

  return data;
}

/**
 * Get comments for a ticket with pagination
 * @param {string} ticketId - Ticket UUID
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 20)
 * @returns {Promise<Object>} Paginated comments
 */
export async function getCommentsByTicketId(ticketId, options = {}) {
  const { page = 1, limit = 20 } = options;

  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('ticket_comments')
    .select(
      `
      *,
      author:users!ticket_comments_author_id_fkey(id, email, first_name, last_name, role)
    `,
      { count: 'exact' }
    )
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to get comments: ${error.message}`);
  }

  return {
    comments: data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

/**
 * Get a single comment by ID
 * @param {string} commentId - Comment UUID
 * @returns {Promise<Object|null>} Comment or null if not found
 */
export async function getCommentById(commentId) {
  const { data, error } = await supabase
    .from('ticket_comments')
    .select(
      `
      *,
      author:users!ticket_comments_author_id_fkey(id, email, first_name, last_name, role)
    `
    )
    .eq('id', commentId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to get comment: ${error.message}`);
  }

  return data;
}

/**
 * Update a comment
 * @param {string} commentId - Comment UUID
 * @param {string} content - New comment content
 * @returns {Promise<Object>} Updated comment
 */
export async function updateComment(commentId, content) {
  // updated_at is automatically handled by the trigger
  const { data, error } = await supabase
    .from('ticket_comments')
    .update({ content })
    .eq('id', commentId)
    .select(
      `
      *,
      author:users!ticket_comments_author_id_fkey(id, email, first_name, last_name, role)
    `
    )
    .single();

  if (error) {
    throw new Error(`Failed to update comment: ${error.message}`);
  }

  return data;
}

/**
 * Delete a comment
 * @param {string} commentId - Comment UUID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteComment(commentId) {
  const { error } = await supabase.from('ticket_comments').delete().eq('id', commentId);

  if (error) {
    throw new Error(`Failed to delete comment: ${error.message}`);
  }

  return true;
}

/**
 * Delete all comments for a ticket
 * Used when a ticket is deleted
 * @param {string} ticketId - Ticket UUID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteCommentsByTicketId(ticketId) {
  const { error } = await supabase
    .from('ticket_comments')
    .delete()
    .eq('ticket_id', ticketId);

  if (error) {
    throw new Error(`Failed to delete comments: ${error.message}`);
  }

  return true;
}

/**
 * Count comments for a ticket
 * @param {string} ticketId - Ticket UUID
 * @returns {Promise<number>} Number of comments
 */
export async function countCommentsByTicketId(ticketId) {
  const { count, error } = await supabase
    .from('ticket_comments')
    .select('id', { count: 'exact', head: true })
    .eq('ticket_id', ticketId);

  if (error) {
    throw new Error(`Failed to count comments: ${error.message}`);
  }

  return count;
}
