/**
 * Dashboard Service Tests
 * Tests for dashboard API service functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDashboardStats, getRecentActivity } from './dashboardService';
import apiClient from './api';

// Mock the API client
vi.mock('./api', () => ({
  default: {
    get: vi.fn()
  }
}));

describe('Dashboard Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('fetches dashboard statistics successfully', async () => {
      const mockStats = {
        tickets: {
          total: 42,
          byStatus: {
            'Nova': 10,
            'U radu': 15,
            'Na čekanju': 5,
            'Riješena': 8,
            'Zatvorena': 4
          }
        },
        announcements: {
          total: 25,
          published: 20
        }
      };

      apiClient.get.mockResolvedValue({ data: mockStats });

      const result = await getDashboardStats();

      expect(apiClient.get).toHaveBeenCalledWith('/dashboard/stats');
      expect(result).toEqual(mockStats);
    });

    it('throws error when API call fails', async () => {
      const mockError = new Error('Network error');
      apiClient.get.mockRejectedValue(mockError);

      await expect(getDashboardStats()).rejects.toThrow('Network error');
      expect(apiClient.get).toHaveBeenCalledWith('/dashboard/stats');
    });
  });

  describe('getRecentActivity', () => {
    it('fetches recent activity with default limit', async () => {
      const mockActivity = {
        recentTickets: [
          { id: '1', title: 'Test ticket', status: 'Nova' }
        ],
        recentAnnouncements: [
          { id: '1', title: 'Test announcement' }
        ]
      };

      apiClient.get.mockResolvedValue({ data: mockActivity });

      const result = await getRecentActivity();

      expect(apiClient.get).toHaveBeenCalledWith('/dashboard/recent-activity', {
        params: { limit: 10 }
      });
      expect(result).toEqual(mockActivity);
    });

    it('fetches recent activity with custom limit', async () => {
      const mockActivity = {
        recentTickets: [],
        recentAnnouncements: []
      };

      apiClient.get.mockResolvedValue({ data: mockActivity });

      const result = await getRecentActivity(5);

      expect(apiClient.get).toHaveBeenCalledWith('/dashboard/recent-activity', {
        params: { limit: 5 }
      });
      expect(result).toEqual(mockActivity);
    });

    it('throws error when API call fails', async () => {
      const mockError = new Error('Unauthorized');
      apiClient.get.mockRejectedValue(mockError);

      await expect(getRecentActivity()).rejects.toThrow('Unauthorized');
    });
  });
});
