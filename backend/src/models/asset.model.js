/**
 * Asset Model
 * Data access layer for IT asset management
 * Requirements: 8.1, 8.2, 8.3
 */

import supabase from '../config/database.js';

// Valid enum values from database schema
const VALID_TYPES = ['Hardware', 'Software', 'Network', 'Peripheral'];
const VALID_STATUSES = ['Active', 'Inactive', 'Maintenance', 'Retired'];

/**
 * Create a new asset
 * @param {Object} assetData - Asset information
 * @param {string} assetData.name - Asset name
 * @param {string} assetData.type - Asset type (Hardware, Software, Network, Peripheral)
 * @param {string} assetData.status - Asset status (Active, Inactive, Maintenance, Retired)
 * @param {string} assetData.serialNumber - Serial number (optional)
 * @param {string} assetData.model - Model name (optional)
 * @param {string} assetData.manufacturer - Manufacturer name (optional)
 * @param {string} assetData.location - Location (optional)
 * @param {string} assetData.purchaseDate - Purchase date (optional)
 * @param {string} assetData.warrantyExpiry - Warranty expiry date (optional)
 * @param {string} assetData.notes - Additional notes (optional)
 * @returns {Promise<Object>} Created asset
 */
export async function createAsset(assetData) {
  const {
    name,
    type,
    status,
    serialNumber,
    model,
    manufacturer,
    location,
    purchaseDate,
    warrantyExpiry,
    notes,
  } = assetData;

  // Validate required fields
  if (!name || !type || !status) {
    throw new Error('Name, type, and status are required fields');
  }

  // Validate type enum
  if (!VALID_TYPES.includes(type)) {
    throw new Error(`Invalid asset type: ${type}. Must be one of: ${VALID_TYPES.join(', ')}`);
  }

  // Validate status enum
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid asset status: ${status}. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const { data, error } = await supabase
    .from('assets')
    .insert([
      {
        name,
        type,
        status,
        serial_number: serialNumber || null,
        model: model || null,
        manufacturer: manufacturer || null,
        location: location || null,
        purchase_date: purchaseDate || null,
        warranty_expiry: warrantyExpiry || null,
        notes: notes || null,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create asset: ${error.message}`);
  }

  return data;
}

/**
 * Get asset by ID
 * @param {string} assetId - Asset UUID
 * @returns {Promise<Object|null>} Asset or null if not found
 */
export async function getAssetById(assetId) {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('id', assetId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to get asset: ${error.message}`);
  }

  return data;
}

/**
 * Get assets with filtering and pagination
 * @param {Object} filters - Filter parameters
 * @param {string} filters.type - Filter by type (optional)
 * @param {string} filters.status - Filter by status (optional)
 * @param {string} filters.location - Filter by location (optional)
 * @param {number} filters.page - Page number (default: 1)
 * @param {number} filters.limit - Items per page (default: 20)
 * @returns {Promise<Object>} Paginated assets
 */
export async function getAssets(filters = {}) {
  const {
    type,
    status,
    location,
    page = 1,
    limit = 20,
  } = filters;

  let query = supabase
    .from('assets')
    .select('*', { count: 'exact' });

  // Apply filters
  if (type) {
    // Validate type if provided
    if (!VALID_TYPES.includes(type)) {
      throw new Error(`Invalid asset type filter: ${type}. Must be one of: ${VALID_TYPES.join(', ')}`);
    }
    query = query.eq('type', type);
  }

  if (status) {
    // Validate status if provided
    if (!VALID_STATUSES.includes(status)) {
      throw new Error(`Invalid asset status filter: ${status}. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }
    query = query.eq('status', status);
  }

  if (location) {
    query = query.ilike('location', `%${location}%`);
  }

  // Apply pagination
  const offset = (page - 1) * limit;
  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to get assets: ${error.message}`);
  }

  return {
    assets: data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

/**
 * Update asset
 * @param {string} assetId - Asset UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated asset
 */
export async function updateAsset(assetId, updates) {
  // Extract allowed fields for update
  const allowedFields = [
    'name',
    'type',
    'status',
    'serial_number',
    'model',
    'manufacturer',
    'location',
    'purchase_date',
    'warranty_expiry',
    'notes',
  ];

  const updateData = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      // Validate type if being updated
      if (field === 'type' && updates[field]) {
        if (!VALID_TYPES.includes(updates[field])) {
          throw new Error(`Invalid asset type: ${updates[field]}. Must be one of: ${VALID_TYPES.join(', ')}`);
        }
      }

      // Validate status if being updated
      if (field === 'status' && updates[field]) {
        if (!VALID_STATUSES.includes(updates[field])) {
          throw new Error(`Invalid asset status: ${updates[field]}. Must be one of: ${VALID_STATUSES.join(', ')}`);
        }
      }

      updateData[field] = updates[field];
    }
  }

  // Check if there are any updates
  if (Object.keys(updateData).length === 0) {
    throw new Error('No valid fields to update');
  }

  // updated_at is automatically handled by the trigger
  const { data, error } = await supabase
    .from('assets')
    .update(updateData)
    .eq('id', assetId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update asset: ${error.message}`);
  }

  return data;
}

/**
 * Delete asset
 * @param {string} assetId - Asset UUID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteAsset(assetId) {
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', assetId);

  if (error) {
    throw new Error(`Failed to delete asset: ${error.message}`);
  }

  return true;
}

/**
 * Get valid asset types
 * @returns {Array<string>} Array of valid asset types
 */
export function getValidTypes() {
  return [...VALID_TYPES];
}

/**
 * Get valid asset statuses
 * @returns {Array<string>} Array of valid asset statuses
 */
export function getValidStatuses() {
  return [...VALID_STATUSES];
}
