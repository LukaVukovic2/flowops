/**
 * Dashboard Controller
 * Handles dashboard statistics and recent activity endpoints
 * Requirements: 6.1, 6.2, 6.8, 6.9
 */

import * as DashboardService from '../services/dashboard.service.js';

/**
 * Get dashboard statistics
 * GET /api/v1/dashboard/stats
 * 
 * Returns statistics filtered by user role:
 * - Posjetitelj: Only public data
 * - Registrirani_Korisnik: Own tickets + published announcements
 * - Tehničar: Assigned tickets + announcement counts
 * - Administrator: Full statistics including all tickets and assets
 * 
 * Requirements: 6.1, 6.2, 6.8, 6.9
 */
export async function getDashboardStats(req, res) {
  try {
    const { userId, role } = req.user;

    // Get statistics based on user role
    const stats = await DashboardService.getDashboardStatistics(userId, role);

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error getting dashboard statistics:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Greška prilikom dohvaćanja statistike'
      }
    });
  }
}

/**
 * Get recent dashboard activity
 * GET /api/v1/dashboard/recent-activity
 * 
 * Returns recent ticket changes and announcements filtered by user role
 */
export async function getRecentActivity(req, res) {
  try {
    const { userId, role } = req.user;
    const limit = parseInt(req.query.limit) || 10;

    const activity = await DashboardService.getRecentActivity(userId, role, limit);

    res.status(200).json(activity);
  } catch (error) {
    console.error('Error getting recent activity:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Greška prilikom dohvaćanja nedavne aktivnosti'
      }
    });
  }
}
