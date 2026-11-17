/**
 * Announcement Categories Routes
 * Defines routes for announcement category management
 * Requirements: 3.2
 */

import express from 'express';
import {
  getCategories,
  createAnnouncementCategory,
  getCategoryByIdHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from '../controllers/announcementCategories.controller.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/v1/announcement-categories
 * Get all announcement categories
 * Access: Public (no authentication required)
 */
router.get('/', getCategories);

/**
 * POST /api/v1/announcement-categories
 * Create new announcement category
 * Access: Administrator only
 */
router.post(
  '/',
  authMiddleware,
  requireRole('Administrator'),
  createAnnouncementCategory
);

/**
 * GET /api/v1/announcement-categories/:id
 * Get specific category by ID
 * Access: Public (no authentication required)
 */
router.get('/:id', getCategoryByIdHandler);

/**
 * PUT /api/v1/announcement-categories/:id
 * Update category
 * Access: Administrator only
 */
router.put(
  '/:id',
  authMiddleware,
  requireRole('Administrator'),
  updateCategoryHandler
);

/**
 * DELETE /api/v1/announcement-categories/:id
 * Delete category
 * Access: Administrator only
 */
router.delete(
  '/:id',
  authMiddleware,
  requireRole('Administrator'),
  deleteCategoryHandler
);

export default router;
