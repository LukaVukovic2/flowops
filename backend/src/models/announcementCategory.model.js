/**
 * Announcement Category Model
 * Data access layer for announcement category management
 * Requirements: 3.1
 */

import supabase from '../config/database.js';

/**
 * Validate hex color code
 * @param {string} color - Hex color code (e.g., #3B82F6)
 * @returns {boolean} True if valid
 * @throws {Error} If color code is invalid
 */
function validateColor(color) {
  if (!color) return true; // Optional field

  // Validate hex color format
  const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  if (!hexColorRegex.test(color)) {
    throw new Error('Color must be a valid hex color code (e.g., #3B82F6 or #FFF)');
  }

  return true;
}

/**
 * Create a new announcement category
 * @param {Object} categoryData - Category information
 * @param {string} categoryData.name - Category name (unique)
 * @param {string} categoryData.description - Category description (optional)
 * @param {string} categoryData.color - Category color in hex format (optional)
 * @returns {Promise<Object>} Created category
 */
export async function createCategory(categoryData) {
  const { name, description, color } = categoryData;

  // Validate color if provided
  if (color) {
    validateColor(color);
  }

  const { data, error } = await supabase
    .from('announcement_categories')
    .insert([
      {
        name,
        description: description || null,
        color: color || null,
      },
    ])
    .select()
    .single();

  if (error) {
    // Handle unique constraint violation
    if (error.code === '23505') {
      throw new Error(`Category with name "${name}" already exists`);
    }
    throw new Error(`Failed to create category: ${error.message}`);
  }

  return data;
}

/**
 * Get category by ID
 * @param {string} categoryId - Category UUID
 * @returns {Promise<Object|null>} Category or null if not found
 */
export async function getCategoryById(categoryId) {
  const { data, error } = await supabase
    .from('announcement_categories')
    .select('*')
    .eq('id', categoryId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to get category: ${error.message}`);
  }

  return data;
}

/**
 * Get category by name
 * @param {string} name - Category name
 * @returns {Promise<Object|null>} Category or null if not found
 */
export async function getCategoryByName(name) {
  const { data, error } = await supabase
    .from('announcement_categories')
    .select('*')
    .eq('name', name)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to get category: ${error.message}`);
  }

  return data;
}

/**
 * Get all categories
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 50)
 * @returns {Promise<Object>} Paginated categories
 */
export async function getCategories(options = {}) {
  const { page = 1, limit = 50 } = options;

  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('announcement_categories')
    .select('*', { count: 'exact' })
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to get categories: ${error.message}`);
  }

  return {
    categories: data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

/**
 * Get all categories without pagination (for dropdowns)
 * @returns {Promise<Array>} All categories
 */
export async function getAllCategories() {
  const { data, error } = await supabase
    .from('announcement_categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to get categories: ${error.message}`);
  }

  return data;
}

/**
 * Update category
 * @param {string} categoryId - Category UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated category
 */
export async function updateCategory(categoryId, updates) {
  // Extract allowed fields for update
  const allowedFields = ['name', 'description', 'color'];
  const updateData = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field];
    }
  }

  // Validate color if being updated
  if (updateData.color) {
    validateColor(updateData.color);
  }

  const { data, error } = await supabase
    .from('announcement_categories')
    .update(updateData)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) {
    // Handle unique constraint violation
    if (error.code === '23505') {
      throw new Error(`Category with name "${updateData.name}" already exists`);
    }
    throw new Error(`Failed to update category: ${error.message}`);
  }

  return data;
}

/**
 * Delete category
 * Note: When a category is deleted, associated announcements will have their category_id set to NULL
 * due to ON DELETE SET NULL constraint
 * @param {string} categoryId - Category UUID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteCategory(categoryId) {
  const { error } = await supabase
    .from('announcement_categories')
    .delete()
    .eq('id', categoryId);

  if (error) {
    throw new Error(`Failed to delete category: ${error.message}`);
  }

  return true;
}

/**
 * Get category usage statistics
 * @param {string} categoryId - Category UUID
 * @returns {Promise<Object>} Category with announcement count
 */
export async function getCategoryStats(categoryId) {
  // Get category
  const category = await getCategoryById(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }

  // Count announcements in this category
  const { count, error } = await supabase
    .from('announcements')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId)
    .is('deleted_at', null);

  if (error) {
    throw new Error(`Failed to get category stats: ${error.message}`);
  }

  return {
    ...category,
    announcementCount: count,
  };
}
