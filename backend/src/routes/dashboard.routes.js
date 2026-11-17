/**
 * Dashboard Routes
 * Routes for dashboard statistics and recent activity
 * Requirements: 6.1, 6.2, 6.8, 6.9
 */

import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as DashboardController from '../controllers/dashboard.controller.js';

const router = express.Router();

/**
 * @route   GET /api/v1/dashboard/stats
 * @desc    Get dashboard statistics (role-based filtering)
 * @access  Authenticated
 * Requirements: 6.1, 6.2, 6.8, 6.9
 */
router.get('/stats', authMiddleware, DashboardController.getDashboardStats);

/**
 * @route   GET /api/v1/dashboard/recent-activity
 * @desc    Get recent activity (tickets and announcements)
 * @access  Authenticated
 */
router.get('/recent-activity', authMiddleware, DashboardController.getRecentActivity);

export default router;
