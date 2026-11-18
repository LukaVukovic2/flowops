/**
 * Asset Routes
 * API endpoints for IT asset management
 * Requirements: 8.4, 8.5, 17.3
 */

import express from 'express';
import { body, param, query } from 'express-validator';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import * as assetsController from '../controllers/assets.controller.js';

const router = express.Router();

/**
 * GET /api/v1/assets
 * Get assets with filtering and pagination
 * Access: Tehničar, Administrator
 * Requirements: 8.8, 8.9, 17.3
 */
router.get(
  '/',
  authMiddleware,
  requireRole('Tehničar', 'Administrator'),
  [
    query('type')
      .optional()
      .isIn(['Hardware', 'Software', 'Network', 'Peripheral'])
      .withMessage('Nevažeća vrsta imovine'),
    query('status')
      .optional()
      .isIn(['Active', 'Inactive', 'Maintenance', 'Retired'])
      .withMessage('Nevažeći status'),
    query('location').optional().isString().withMessage('Nevažeća lokacija'),
    query('page').optional().isInt({ min: 1 }).withMessage('Nevažeći broj stranice'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Nevažeće ograničenje'),
  ],
  validate,
  assetsController.getAssets
);

/**
 * POST /api/v1/assets
 * Create a new asset
 * Access: Tehničar, Administrator
 * Requirements: 8.1, 8.4
 */
router.post(
  '/',
  authMiddleware,
  requireRole('Tehničar', 'Administrator'),
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Naziv imovine je obavezan')
      .isLength({ max: 255 })
      .withMessage('Naziv ne smije biti duži od 255 znakova'),
    body('type')
      .notEmpty()
      .withMessage('Vrsta imovine je obavezna')
      .isIn(['Hardware', 'Software', 'Network', 'Peripheral'])
      .withMessage('Nevažeća vrsta imovine'),
    body('status')
      .notEmpty()
      .withMessage('Status je obavezan')
      .isIn(['Active', 'Inactive', 'Maintenance', 'Retired'])
      .withMessage('Nevažeći status'),
    body('serialNumber')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Serijski broj ne smije biti duži od 100 znakova'),
    body('model')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Model ne smije biti duži od 100 znakova'),
    body('manufacturer')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Proizvođač ne smije biti duži od 100 znakova'),
    body('location')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Lokacija ne smije biti duža od 255 znakova'),
    body('purchaseDate')
      .optional()
      .isISO8601()
      .withMessage('Nevažeći datum kupnje'),
    body('warrantyExpiry')
      .optional()
      .isISO8601()
      .withMessage('Nevažeći datum isteka jamstva'),
    body('notes')
      .optional()
      .trim()
      .isString()
      .withMessage('Bilješke moraju biti tekst'),
  ],
  validate,
  assetsController.createAsset
);

/**
 * GET /api/v1/assets/:id
 * Get a single asset by ID
 * Access: Tehničar, Administrator
 * Requirements: 8.4
 */
router.get(
  '/:id',
  authMiddleware,
  requireRole('Tehničar', 'Administrator'),
  [param('id').isUUID().withMessage('Nevažeći ID imovine')],
  validate,
  assetsController.getAssetById
);

/**
 * PUT /api/v1/assets/:id
 * Update an asset
 * Access: Tehničar, Administrator
 * Requirements: 8.4
 */
router.put(
  '/:id',
  authMiddleware,
  requireRole('Tehničar', 'Administrator'),
  [
    param('id').isUUID().withMessage('Nevažeći ID imovine'),
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Naziv ne smije biti prazan')
      .isLength({ max: 255 })
      .withMessage('Naziv ne smije biti duži od 255 znakova'),
    body('type')
      .optional()
      .isIn(['Hardware', 'Software', 'Network', 'Peripheral'])
      .withMessage('Nevažeća vrsta imovine'),
    body('status')
      .optional()
      .isIn(['Active', 'Inactive', 'Maintenance', 'Retired'])
      .withMessage('Nevažeći status'),
    body('serialNumber')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Serijski broj ne smije biti duži od 100 znakova'),
    body('model')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Model ne smije biti duži od 100 znakova'),
    body('manufacturer')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Proizvođač ne smije biti duži od 100 znakova'),
    body('location')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Lokacija ne smije biti duža od 255 znakova'),
    body('purchaseDate')
      .optional()
      .isISO8601()
      .withMessage('Nevažeći datum kupnje'),
    body('warrantyExpiry')
      .optional()
      .isISO8601()
      .withMessage('Nevažeći datum isteka jamstva'),
    body('notes')
      .optional()
      .trim()
      .isString()
      .withMessage('Bilješke moraju biti tekst'),
  ],
  validate,
  assetsController.updateAsset
);

/**
 * DELETE /api/v1/assets/:id
 * Delete an asset
 * Access: Administrator only
 * Requirements: 8.5
 */
router.delete(
  '/:id',
  authMiddleware,
  requireRole('Administrator'),
  [param('id').isUUID().withMessage('Nevažeći ID imovine')],
  validate,
  assetsController.deleteAsset
);

/**
 * GET /api/v1/assets/:id/tickets
 * Get all tickets linked to a specific asset
 * Access: Tehničar, Administrator
 * Requirements: 8.6, 8.7, 17.3
 */
router.get(
  '/:id/tickets',
  authMiddleware,
  requireRole('Tehničar', 'Administrator'),
  [
    param('id').isUUID().withMessage('Nevažeći ID imovine'),
    query('page').optional().isInt({ min: 1 }).withMessage('Nevažeći broj stranice'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Nevažeće ograničenje'),
  ],
  validate,
  assetsController.getAssetTickets
);

export default router;
