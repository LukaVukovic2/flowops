/**
 * Users Routes
 * Defines routes for user management (Administrator only)
 * Requirements: 5.1, 5.2, 5.3, 5.6, 5.9
 */

import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import * as usersController from '../controllers/users.controller.js';

const router = express.Router();

// All user management routes require Administrator role
// Requirement 5.9: Require Administrator role for user administration functions

/**
 * GET /api/v1/users
 * Get all users with pagination and role filtering
 * Requirement: 5.1, 5.5
 */
router.get(
  '/',
  authMiddleware,
  requireRole('Administrator'),
  usersController.getUsers
);

/**
 * GET /api/v1/users/:id
 * Get a single user by ID
 * Requirement: 5.5
 */
router.get(
  '/:id',
  authMiddleware,
  requireRole('Administrator'),
  usersController.getUserById
);

/**
 * PATCH /api/v1/users/:id/role
 * Change user role
 * Requirement: 5.2, 5.7, 5.8
 */
router.patch(
  '/:id/role',
  authMiddleware,
  requireRole('Administrator'),
  usersController.updateUserRole
);

/**
 * PATCH /api/v1/users/:id/deactivate
 * Deactivate user account
 * Requirement: 5.3, 5.4, 5.7, 5.8
 */
router.patch(
  '/:id/deactivate',
  authMiddleware,
  requireRole('Administrator'),
  usersController.deactivateUser
);

/**
 * PATCH /api/v1/users/:id/activate
 * Activate user account
 */
router.patch(
  '/:id/activate',
  authMiddleware,
  requireRole('Administrator'),
  usersController.activateUser
);

/**
 * PATCH /api/v1/users/:id/reset-password
 * Reset user password
 * Requirement: 5.6, 5.7
 */
router.patch(
  '/:id/reset-password',
  authMiddleware,
  requireRole('Administrator'),
  usersController.resetUserPassword
);

export default router;
