/**
 * DashboardPage Component Tests
 * Tests for role-based dashboard content rendering
 * Requirements: 6.8, 6.9
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';
import { AuthProvider } from '../../context/AuthContext';
import * as dashboardService from '../../services/dashboardService';

// Mock the dashboard service
vi.mock('../../services/dashboardService', () => ({
  getDashboardStats: vi.fn(),
  getRecentActivity: vi.fn()
}));

// Mock the auth hook
const mockAuthContext = {
  user: null,
  role: null,
  isAuthenticated: true,
  isLoading: false
};

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockAuthContext
}));

describe('DashboardPage - Role-based Content', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderDashboard = (user, role) => {
    mockAuthContext.user = user;
    mockAuthContext.role = role;

    return render(
      <BrowserRouter>
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  describe('Posjetitelj Role', () => {
    const posjetiteljUser = {
      id: '1',
      firstName: 'Ivan',
      lastName: 'Horvat',
      role: 'Posjetitelj'
    };

    beforeEach(() => {
      dashboardService.getDashboardStats.mockResolvedValue({
        announcements: {
          total: 5,
          published: 5
        }
      });

      dashboardService.getRecentActivity.mockResolvedValue({
        recentAnnouncements: [
          {
            id: '1',
            title: 'Test objava',
            published_at: new Date().toISOString(),
            author: { first_name: 'Test', last_name: 'User' }
          }
        ],
        recentTickets: []
      });
    });

    it('shows only public data for Posjetitelj', async () => {
      renderDashboard(posjetiteljUser, 'Posjetitelj');

      await waitFor(() => {
        expect(screen.getByText('Nadzorna ploča')).toBeInTheDocument();
      });

      // Should show announcements
      await waitFor(() => {
        expect(screen.getByText('Objave')).toBeInTheDocument();
      });

      // Should NOT show tickets section
      expect(screen.queryByText('Pregled tiketa')).not.toBeInTheDocument();

      // Should NOT show assets
      expect(screen.queryByText('IT Resursi')).not.toBeInTheDocument();

      // Should NOT show external services
      expect(screen.queryByText('Status vanjskih servisa')).not.toBeInTheDocument();
    });

    it('displays message about limited access for Posjetitelj', async () => {
      renderDashboard(posjetiteljUser, 'Posjetitelj');

      await waitFor(() => {
        expect(
          screen.getByText(/Prikazani su samo javni podaci/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Registrirani_Korisnik Role', () => {
    const registriraniUser = {
      id: '2',
      firstName: 'Ana',
      lastName: 'Kovač',
      role: 'Registrirani_Korisnik'
    };

    beforeEach(() => {
      dashboardService.getDashboardStats.mockResolvedValue({
        tickets: {
          total: 3,
          byStatus: {
            'Nova': 1,
            'U radu': 1,
            'Na čekanju': 0,
            'Riješena': 1,
            'Zatvorena': 0
          }
        },
        announcements: {
          total: 5,
          published: 5
        }
      });

      dashboardService.getRecentActivity.mockResolvedValue({
        recentAnnouncements: [
          {
            id: '1',
            title: 'Test objava',
            published_at: new Date().toISOString(),
            author: { first_name: 'Test', last_name: 'User' }
          }
        ],
        recentTickets: [
          {
            id: '1',
            title: 'Moj tiket',
            status: 'Nova',
            created_at: new Date().toISOString(),
            creator: { first_name: 'Ana', last_name: 'Kovač' }
          }
        ]
      });
    });

    it('shows own tickets and published announcements for Registrirani_Korisnik', async () => {
      renderDashboard(registriraniUser, 'Registrirani_Korisnik');

      await waitFor(() => {
        expect(screen.getByText('Nadzorna ploča')).toBeInTheDocument();
      });

      // Should show tickets section
      await waitFor(() => {
        expect(screen.getByText('Pregled tiketa')).toBeInTheDocument();
      });

      // Should show announcements
      expect(screen.getByText('Objave')).toBeInTheDocument();

      // Should NOT show assets
      expect(screen.queryByText('IT Resursi')).not.toBeInTheDocument();

      // Should NOT show external services
      expect(screen.queryByText('Status vanjskih servisa')).not.toBeInTheDocument();
    });

    it('does not show unpublished count for Registrirani_Korisnik', async () => {
      dashboardService.getDashboardStats.mockResolvedValue({
        tickets: {
          total: 3,
          byStatus: { 'Nova': 1, 'U radu': 1, 'Na čekanju': 0, 'Riješena': 1, 'Zatvorena': 0 }
        },
        announcements: {
          total: 5,
          published: 3
        }
      });

      renderDashboard(registriraniUser, 'Registrirani_Korisnik');

      await waitFor(() => {
        expect(screen.getByText('Objave')).toBeInTheDocument();
      });

      // Should NOT show total count that differs from published
      expect(screen.queryByText('Ukupno: 5')).not.toBeInTheDocument();
    });
  });

  describe('Tehničar Role', () => {
    const tehnicarUser = {
      id: '3',
      firstName: 'Marko',
      lastName: 'Novak',
      role: 'Tehničar'
    };

    beforeEach(() => {
      dashboardService.getDashboardStats.mockResolvedValue({
        tickets: {
          total: 10,
          byStatus: {
            'Nova': 3,
            'U radu': 4,
            'Na čekanju': 1,
            'Riješena': 2,
            'Zatvorena': 0
          }
        },
        announcements: {
          total: 10,
          published: 8
        },
        assets: {
          total: 25,
          byStatus: {
            'Active': 20,
            'Inactive': 3,
            'Maintenance': 2,
            'Retired': 0
          }
        },
        externalServices: [
          {
            name: 'GitHub Status',
            status: 'operational',
            lastChecked: new Date().toISOString()
          }
        ]
      });

      dashboardService.getRecentActivity.mockResolvedValue({
        recentAnnouncements: [],
        recentTickets: []
      });
    });

    it('shows full statistics and external services for Tehničar', async () => {
      renderDashboard(tehnicarUser, 'Tehničar');

      await waitFor(() => {
        expect(screen.getByText('Nadzorna ploča')).toBeInTheDocument();
      });

      // Should show all sections
      await waitFor(() => {
        expect(screen.getByText('Pregled tiketa')).toBeInTheDocument();
      });

      expect(screen.getByText('Objave')).toBeInTheDocument();
      expect(screen.getByText('IT Resursi')).toBeInTheDocument();
      expect(screen.getByText('Status vanjskih servisa')).toBeInTheDocument();
    });

    it('shows unpublished count for Tehničar', async () => {
      renderDashboard(tehnicarUser, 'Tehničar');

      await waitFor(() => {
        expect(screen.getByText('Objave')).toBeInTheDocument();
      });

      // Should show total count
      await waitFor(() => {
        expect(screen.getByText('Ukupno: 10')).toBeInTheDocument();
      });
    });
  });

  describe('Administrator Role', () => {
    const adminUser = {
      id: '4',
      firstName: 'Admin',
      lastName: 'User',
      role: 'Administrator'
    };

    beforeEach(() => {
      dashboardService.getDashboardStats.mockResolvedValue({
        tickets: {
          total: 50,
          byStatus: {
            'Nova': 10,
            'U radu': 20,
            'Na čekanju': 5,
            'Riješena': 10,
            'Zatvorena': 5
          }
        },
        announcements: {
          total: 20,
          published: 15
        },
        assets: {
          total: 100,
          byStatus: {
            'Active': 80,
            'Inactive': 10,
            'Maintenance': 5,
            'Retired': 5
          }
        },
        externalServices: [
          {
            name: 'GitHub Status',
            status: 'operational',
            lastChecked: new Date().toISOString()
          },
          {
            name: 'API Service',
            status: 'degraded',
            lastChecked: new Date().toISOString()
          }
        ]
      });

      dashboardService.getRecentActivity.mockResolvedValue({
        recentAnnouncements: [],
        recentTickets: []
      });
    });

    it('shows full statistics and external services for Administrator', async () => {
      renderDashboard(adminUser, 'Administrator');

      await waitFor(() => {
        expect(screen.getByText('Nadzorna ploča')).toBeInTheDocument();
      });

      // Should show all sections
      await waitFor(() => {
        expect(screen.getByText('Pregled tiketa')).toBeInTheDocument();
      });

      expect(screen.getByText('Objave')).toBeInTheDocument();
      expect(screen.getByText('IT Resursi')).toBeInTheDocument();
      expect(screen.getByText('Status vanjskih servisa')).toBeInTheDocument();
    });

    it('displays multiple external services', async () => {
      renderDashboard(adminUser, 'Administrator');

      await waitFor(() => {
        expect(screen.getByText('Status vanjskih servisa')).toBeInTheDocument();
      });

      // Should show both services
      expect(screen.getByText('GitHub Status')).toBeInTheDocument();
      expect(screen.getByText('API Service')).toBeInTheDocument();
    });
  });

  describe('Loading and Error States', () => {
    const testUser = {
      id: '1',
      firstName: 'Test',
      lastName: 'User',
      role: 'Administrator'
    };

    it('shows loading skeletons while fetching data', async () => {
      dashboardService.getDashboardStats.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      dashboardService.getRecentActivity.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      renderDashboard(testUser, 'Administrator');

      // Should show loading state
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('displays error message when stats fetch fails', async () => {
      dashboardService.getDashboardStats.mockRejectedValue(
        new Error('Network error')
      );
      dashboardService.getRecentActivity.mockRejectedValue(
        new Error('Network error')
      );

      renderDashboard(testUser, 'Administrator');

      await waitFor(() => {
        expect(
          screen.getByText(/Greška prilikom učitavanja statistike/i)
        ).toBeInTheDocument();
      });
    });
  });
});
