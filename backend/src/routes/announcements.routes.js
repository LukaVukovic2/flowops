/**
 * Announcement Routes
 * API endpoints for announcement management
 * Requirements: 3.1, 3.2, 3.3, 3.6, 3.7, 3.8, 17.2
 */

import express from 'express';
import { authMiddleware, requireRole, optionalAuthMiddleware } from '../middleware/auth.js';
import {
  getAnnouncementsList,
  getAnnouncementByIdHandler,
  createAnnouncementHandler,
  updateAnnouncementHandler,
  publishAnnouncementHandler,
  deleteAnnouncementHandler,
} from '../controllers/announcements.controller.js';
import {
  getCategories,
  createAnnouncementCategory,
  getCategoryByIdHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from '../controllers/announcementCategories.controller.js';

const router = express.Router();

// ==================== ANNOUNCEMENT CATEGORY ROUTES ====================
// Note: Category routes must be defined BEFORE announcement /:id routes
// to prevent /categories from being interpreted as an announcement ID

/**
 * GET /api/v1/announcements/categories
 * Get announcement categories
 * Access: Public
 * Requirements: 3.2
 */
router.get('/categories', getCategories);

/**
 * POST /api/v1/announcements/categories
 * Create new announcement category
 * Access: Administrator only
 * Requirements: 3.2
 */
router.post(
  '/categories',
  authMiddleware,
  requireRole('Administrator'),
  createAnnouncementCategory
);

/**
 * GET /api/v1/announcements/categories/:id
 * Get specific category by ID
 * Access: Public
 */
router.get('/categories/:id', getCategoryByIdHandler);

/**
 * PUT /api/v1/announcements/categories/:id
 * Update announcement category
 * Access: Administrator only
 */
router.put(
  '/categories/:id',
  authMiddleware,
  requireRole('Administrator'),
  updateCategoryHandler
);

/**
 * DELETE /api/v1/announcements/categories/:id
 * Delete announcement category
 * Access: Administrator only
 * Note: Announcements with this category will have category_id set to NULL
 */
router.delete(
  '/categories/:id',
  authMiddleware,
  requireRole('Administrator'),
  deleteCategoryHandler
);

// ==================== ANNOUNCEMENT ROUTES ====================

/**
 * GET /api/v1/announcements
 * List announcements with filtering
 * - Public/Registrirani_Korisnik: Only published announcements
 * - Tehničar/Administrator: All announcements (including unpublished)
 * Requirements: 3.3, 17.2
 */
router.get('/', optionalAuthMiddleware, getAnnouncementsList);

/**
 * POST /api/v1/announcements
 * Create new announcement
 * Access: Tehničar, Administrator
 * Requirements: 3.1
 */
router.post(
  '/',
  authMiddleware,
  requireRole('Tehničar', 'Administrator'),
  createAnnouncementHandler
);

/**
 * GET /api/v1/announcements/:id
 * Get single announcement by ID
 * - Public: Only if published
 * - Tehničar/Administrator: Any announcement
 */
router.get('/:id', optionalAuthMiddleware, getAnnouncementByIdHandler);

/**
 * PUT /api/v1/announcements/:id
 * Update announcement
 * Access: 
 * - Tehničar: Only own unpublished announcements
 * - Administrator: Any announcement
 * Requirements: 3.6, 3.7
 */
router.put(
  '/:id',
  authMiddleware,
  requireRole('Tehničar', 'Administrator'),
  updateAnnouncementHandler
);

/**
 * PATCH /api/v1/announcements/:id/publish
 * Publish or unpublish announcement
 * Access: Tehničar, Administrator
 * Requirements: 3.3
 */
router.patch(
  '/:id/publish',
  authMiddleware,
  requireRole('Tehničar', 'Administrator'),
  publishAnnouncementHandler
);

/**
 * DELETE /api/v1/announcements/:id
 * Soft delete announcement
 * Access: 
 * - Tehničar: Only own announcements
 * - Administrator: Any announcement
 * Requirements: 3.8
 */
router.delete(
  '/:id',
  authMiddleware,
  requireRole('Tehničar', 'Administrator'),
  deleteAnnouncementHandler
);

export default router;
