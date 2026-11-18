/**
 * Assets Controller
 * Handles HTTP requests for IT asset management
 * Requirements: 8.4, 8.5, 17.3
 */

import * as assetModel from '../models/asset.model.js';
import * as ticketModel from '../models/ticket.model.js';
import logger from '../utils/logger.js';

/**
 * GET /api/v1/assets
 * Get assets with filtering and pagination
 * Requirements: 8.8, 8.9, 17.3
 * Access: Tehničar, Administrator
 */
export async function getAssets(req, res) {
  try {
    const { type, status, location, page, limit } = req.query;

    const filters = {
      type,
      status,
      location,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    };

    const result = await assetModel.getAssets(filters);

    res.json(result);
  } catch (error) {
    logger.error('Error fetching assets:', error);
    
    // Handle validation errors (invalid enum values)
    if (error.message.includes('Invalid asset')) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }

    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Greška pri dohvaćanju imovine',
      },
    });
  }
}

/**
 * GET /api/v1/assets/:id
 * Get a single asset by ID
 * Requirements: 8.4
 * Access: Tehničar, Administrator
 */
export async function getAssetById(req, res) {
  try {
    const { id } = req.params;

    const asset = await assetModel.getAssetById(id);

    if (!asset) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Imovina nije pronađena',
        },
      });
    }

    res.json(asset);
  } catch (error) {
    logger.error('Error fetching asset:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Greška pri dohvaćanju imovine',
      },
    });
  }
}

/**
 * POST /api/v1/assets
 * Create a new asset
 * Requirements: 8.1, 8.4
 * Access: Tehničar, Administrator
 */
export async function createAsset(req, res) {
  try {
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
    } = req.body;

    const assetData = {
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
    };

    const asset = await assetModel.createAsset(assetData);

    logger.info(`Asset created: ${asset.id} by user ${req.user.userId}`);

    res.status(201).json(asset);
  } catch (error) {
    logger.error('Error creating asset:', error);

    // Handle validation errors
    if (error.message.includes('required') || error.message.includes('Invalid')) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }

    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Greška pri stvaranju imovine',
      },
    });
  }
}

/**
 * PUT /api/v1/assets/:id
 * Update an asset
 * Requirements: 8.4
 * Access: Tehničar, Administrator
 */
export async function updateAsset(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if asset exists
    const existingAsset = await assetModel.getAssetById(id);
    if (!existingAsset) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Imovina nije pronađena',
        },
      });
    }

    // Convert camelCase to snake_case for model function
    const modelUpdates = {};
    if (updates.name !== undefined) modelUpdates.name = updates.name;
    if (updates.type !== undefined) modelUpdates.type = updates.type;
    if (updates.status !== undefined) modelUpdates.status = updates.status;
    if (updates.serialNumber !== undefined) modelUpdates.serial_number = updates.serialNumber;
    if (updates.model !== undefined) modelUpdates.model = updates.model;
    if (updates.manufacturer !== undefined) modelUpdates.manufacturer = updates.manufacturer;
    if (updates.location !== undefined) modelUpdates.location = updates.location;
    if (updates.purchaseDate !== undefined) modelUpdates.purchase_date = updates.purchaseDate;
    if (updates.warrantyExpiry !== undefined) modelUpdates.warranty_expiry = updates.warrantyExpiry;
    if (updates.notes !== undefined) modelUpdates.notes = updates.notes;

    const updatedAsset = await assetModel.updateAsset(id, modelUpdates);

    logger.info(`Asset updated: ${id} by user ${req.user.userId}`);

    res.json(updatedAsset);
  } catch (error) {
    logger.error('Error updating asset:', error);

    // Handle validation errors
    if (error.message.includes('Invalid') || error.message.includes('No valid fields')) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }

    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Greška pri ažuriranju imovine',
      },
    });
  }
}

/**
 * DELETE /api/v1/assets/:id
 * Delete an asset
 * Requirements: 8.5
 * Access: Administrator only
 */
export async function deleteAsset(req, res) {
  try {
    const { id } = req.params;

    // Check if asset exists
    const existingAsset = await assetModel.getAssetById(id);
    if (!existingAsset) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Imovina nije pronađena',
        },
      });
    }

    await assetModel.deleteAsset(id);

    logger.info(`Asset deleted: ${id} by user ${req.user.userId}`);

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting asset:', error);

    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Greška pri brisanju imovine',
      },
    });
  }
}

/**
 * GET /api/v1/assets/:id/tickets
 * Get all tickets linked to a specific asset
 * Requirements: 8.6, 8.7, 17.3
 * Access: Tehničar, Administrator
 */
export async function getAssetTickets(req, res) {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;

    // Check if asset exists
    const asset = await assetModel.getAssetById(id);
    if (!asset) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Imovina nije pronađena',
        },
      });
    }

    // Get tickets linked to this asset
    const result = await ticketModel.getTicketsByAssetId(id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });

    res.json(result);
  } catch (error) {
    logger.error('Error fetching asset tickets:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Greška pri dohvaćanju tiketa za imovinu',
      },
    });
  }
}
