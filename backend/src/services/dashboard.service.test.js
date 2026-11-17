/**
 * Dashboard Service Tests
 * Tests for dashboard statistics and activity
 * 
 * Note: These are integration tests that require a running database
 * with test data. For unit tests, consider using a mocking library.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as DashboardService from './dashboard.service.js';

describe('Dashboard Service - Integration Tests', () => {
  describe('getDashboardStatistics', () => {
    it('should return statistics object with correct structure', async () => {
      // Test with Administrator role
      const stats = await DashboardService.getDashboardStatistics('test-user-id', 'Administrator');

      // Verify structure
      assert.ok(stats, 'Statistics should be returned');
      assert.ok(stats.tickets, 'Should have tickets property');
      assert.ok(stats.announcements, 'Should have announcements property');
      
      // Verify tickets structure
      assert.strictEqual(typeof stats.tickets.total, 'number', 'Tickets total should be a number');
      assert.ok(stats.tickets.byStatus, 'Should have byStatus property');
      assert.ok('Nova' in stats.tickets.byStatus, 'Should have Nova status count');
      assert.ok('U radu' in stats.tickets.byStatus, 'Should have U radu status count');
      assert.ok('Na čekanju' in stats.tickets.byStatus, 'Should have Na čekanju status count');
      assert.ok('Riješena' in stats.tickets.byStatus, 'Should have Riješena status count');
      assert.ok('Zatvorena' in stats.tickets.byStatus, 'Should have Zatvorena status count');
      
      // Verify announcements structure
      assert.strictEqual(typeof stats.announcements.total, 'number', 'Announcements total should be a number');
      assert.strictEqual(typeof stats.announcements.published, 'number', 'Announcements published should be a number');
    });

    it('should return zero tickets for Posjetitelj role', async () => {
      const stats = await DashboardService.getDashboardStatistics('test-user-id', 'Posjetitelj');
      
      assert.strictEqual(stats.tickets.total, 0, 'Posjetitelj should see 0 tickets');
      assert.strictEqual(stats.tickets.byStatus['Nova'], 0, 'All status counts should be 0');
    });

    it('should return only published count for Registrirani_Korisnik', async () => {
      const stats = await DashboardService.getDashboardStatistics('test-user-id', 'Registrirani_Korisnik');
      
      // For Registrirani_Korisnik, total should equal published
      assert.strictEqual(stats.announcements.total, stats.announcements.published, 
        'Registrirani_Korisnik should only see published announcements');
    });

    it('should cache results for same user and role', async () => {
      const userId = 'cache-test-user';
      const role = 'Administrator';
      
      // First call
      const stats1 = await DashboardService.getDashboardStatistics(userId, role);
      
      // Second call (should be cached)
      const stats2 = await DashboardService.getDashboardStatistics(userId, role);
      
      // Results should be identical (from cache)
      assert.deepStrictEqual(stats1, stats2, 'Cached results should be identical');
    });
  });

  describe('getRecentActivity', () => {
    it('should return recent activity with correct structure', async () => {
      const activity = await DashboardService.getRecentActivity('test-user-id', 'Administrator', 10);
      
      assert.ok(activity, 'Activity should be returned');
      assert.ok(Array.isArray(activity.recentTickets), 'recentTickets should be an array');
      assert.ok(Array.isArray(activity.recentAnnouncements), 'recentAnnouncements should be an array');
    });

    it('should limit results to specified limit', async () => {
      const limit = 5;
      const activity = await DashboardService.getRecentActivity('test-user-id', 'Administrator', limit);
      
      assert.ok(activity.recentTickets.length <= limit, 'Tickets should not exceed limit');
      assert.ok(activity.recentAnnouncements.length <= limit, 'Announcements should not exceed limit');
    });

    it('should return empty tickets array for Posjetitelj', async () => {
      const activity = await DashboardService.getRecentActivity('test-user-id', 'Posjetitelj', 10);
      
      assert.strictEqual(activity.recentTickets.length, 0, 'Posjetitelj should see no tickets');
      assert.ok(activity.recentAnnouncements, 'Should still have announcements array');
    });
  });
});

