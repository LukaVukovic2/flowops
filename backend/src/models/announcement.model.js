/**
 * Announcement Model
 * Data access layer for announcement management
 * Requirements: 3.1, 3.5
 */

import supabase from '../config/database.js';

/**
 * Validate image URL format
 * @param {string} imageUrl - Image URL to validate
 * @returns {boolean} True if valid
 * @throws {Error} If URL is invalid
 */
function validateImageUrl(imageUrl) {
  if (!imageUrl) return true; // Optional field

  // Basic URL validation
  try {
    const url = new URL(imageUrl);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Image URL must use HTTP or HTTPS protocol');
    }
  } catch (error) {
    throw new Error('Invalid image URL format');
  }

  // Validate file format by checking extension
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const urlPath = imageUrl.toLowerCase();
  const hasValidExtension = validExtensions.some(ext => urlPath.includes(ext));
  
  if (!hasValidExtension) {
    throw new Error('Image URL must point to a valid image format (jpg, jpeg, png, gif, webp, svg)');
  }

  return true;
}

/**
 * Create a new announcement
 * @param {Object} announcementData - Announcement information
 * @param {string} announcementData.title - Announcement title
 * @param {string} announcementData.content - Announcement content
 * @param {string} announcementData.authorId - User ID of the author
 * @param {string} announcementData.categoryId - Category ID (optional)
 * @param {string} announcementData.imageUrl - Image URL (optional)
 * @returns {Promise<Object>} Created announcement
 */
export async function createAnnouncement(announcementData) {
  const { title, content, authorId, categoryId, imageUrl } = announcementData;

  // Validate image URL if provided
  if (imageUrl) {
    validateImageUrl(imageUrl);
  }

  const { data, error } = await supabase
    .from('announcements')
    .insert([
      {
        title,
        content,
        author_id: authorId,
        category_id: categoryId || null,
        image_url: imageUrl || null,
        is_published: false, // Announcements start as drafts
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create announcement: ${error.message}`);
  }

  return data;
}

/**
 * Get announcement by ID
 * @param {string} announcementId - Announcement UUID
 * @param {boolean} includeDeleted - Include soft-deleted announcements (default: false)
 * @returns {Promise<Object|null>} Announcement or null if not found
 */
export async function getAnnouncementById(announcementId, includeDeleted = false) {
  let query = supabase
    .from('announcements')
    .select(
      `
      *,
      author:users!announcements_author_id_fkey(id, email, first_name, last_name, role),
      category:announcement_categories(id, name, description, color)
    `
    )
    .eq('id', announcementId);

  // Exclude soft-deleted announcements by default
  if (!includeDeleted) {
    query = query.is('deleted_at', null);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to get announcement: ${error.message}`);
  }

  return data;
}

/**
 * Get announcements with filtering and pagination
 * @param {Object} filters - Filter parameters
 * @param {boolean} filters.isPublished - Filter by publication status (optional)
 * @param {string} filters.categoryId - Filter by category (optional)
 * @param {string} filters.authorId - Filter by author (optional)
 * @param {boolean} filters.includeDeleted - Include soft-deleted announcements (default: false)
 * @param {number} filters.page - Page number (default: 1)
 * @param {number} filters.limit - Items per page (default: 20)
 * @returns {Promise<Object>} Paginated announcements
 */
export async function getAnnouncements(filters = {}) {
  const {
    isPublished,
    categoryId,
    authorId,
    includeDeleted = false,
    page = 1,
    limit = 20,
  } = filters;

  let query = supabase
    .from('announcements')
    .select(
      `
      *,
      author:users!announcements_author_id_fkey(id, email, first_name, last_name, role),
      category:announcement_categories(id, name, description, color)
    `,
      { count: 'exact' }
    );

  // Exclude soft-deleted announcements by default
  if (!includeDeleted) {
    query = query.is('deleted_at', null);
  }

  // Apply filters
  if (isPublished !== undefined) {
    query = query.eq('is_published', isPublished);
  }
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  if (authorId) {
    query = query.eq('author_id', authorId);
  }

  // Apply pagination and ordering (reverse chronological by published_at, then created_at)
  const offset = (page - 1) * limit;
  query = query
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to get announcements: ${error.message}`);
  }

  return {
    announcements: data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

/**
 * Update announcement
 * @param {string} announcementId - Announcement UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated announcement
 */
export async function updateAnnouncement(announcementId, updates) {
  // Extract allowed fields for update
  const allowedFields = ['title', 'content', 'category_id', 'image_url'];
  const updateData = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field];
    }
  }

  // Validate image URL if being updated
  if (updateData.image_url) {
    validateImageUrl(updateData.image_url);
  }

  // updated_at is automatically handled by the trigger
  const { data, error } = await supabase
    .from('announcements')
    .update(updateData)
    .eq('id', announcementId)
    .is('deleted_at', null) // Prevent updating soft-deleted announcements
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update announcement: ${error.message}`);
  }

  return data;
}

/**
 * Publish announcement
 * @param {string} announcementId - Announcement UUID
 * @returns {Promise<Object>} Published announcement
 */
export async function publishAnnouncement(announcementId) {
  const { data, error } = await supabase
    .from('announcements')
    .update({
      is_published: true,
      published_at: new Date().toISOString(),
    })
    .eq('id', announcementId)
    .is('deleted_at', null) // Prevent publishing soft-deleted announcements
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to publish announcement: ${error.message}`);
  }

  return data;
}

/**
 * Unpublish announcement
 * @param {string} announcementId - Announcement UUID
 * @returns {Promise<Object>} Unpublished announcement
 */
export async function unpublishAnnouncement(announcementId) {
  const { data, error } = await supabase
    .from('announcements')
    .update({
      is_published: false,
    })
    .eq('id', announcementId)
    .is('deleted_at', null) // Prevent unpublishing soft-deleted announcements
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to unpublish announcement: ${error.message}`);
  }

  return data;
}

/**
 * Soft delete announcement
 * @param {string} announcementId - Announcement UUID
 * @returns {Promise<Object>} Soft-deleted announcement
 */
export async function softDeleteAnnouncement(announcementId) {
  const { data, error } = await supabase
    .from('announcements')
    .update({
      deleted_at: new Date().toISOString(),
      is_published: false, // Unpublish on delete
    })
    .eq('id', announcementId)
    .is('deleted_at', null) // Only delete if not already deleted
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to delete announcement: ${error.message}`);
  }

  return data;
}

/**
 * Restore soft-deleted announcement
 * @param {string} announcementId - Announcement UUID
 * @returns {Promise<Object>} Restored announcement
 */
export async function restoreAnnouncement(announcementId) {
  const { data, error } = await supabase
    .from('announcements')
    .update({
      deleted_at: null,
    })
    .eq('id', announcementId)
    .not('deleted_at', 'is', null) // Only restore if currently deleted
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to restore announcement: ${error.message}`);
  }

  return data;
}

/**
 * Permanently delete announcement
 * @param {string} announcementId - Announcement UUID
 * @returns {Promise<boolean>} Success status
 */
export async function permanentlyDeleteAnnouncement(announcementId) {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', announcementId);

  if (error) {
    throw new Error(`Failed to permanently delete announcement: ${error.message}`);
  }

  return true;
}
