/**
 * TicketHistory Component Tests
 * Tests for ticket history timeline component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TicketHistory from './TicketHistory';
import * as ticketService from '../../services/ticketService';

// Mock the ticket service
vi.mock('../../services/ticketService', () => ({
  getTicketHistory: vi.fn()
}));

// Mock date formatter
vi.mock('../../utils/dateFormatter', () => ({
  formatDateTime: vi.fn((date) => '15.01.2024 10:30')
}));

describe('TicketHistory', () => {
  const mockTicketId = 'ticket-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    ticketService.getTicketHistory.mockImplementation(() => new Promise(() => {}));
    
    render(<TicketHistory ticketId={mockTicketId} />);
    
    expect(screen.getByText('Povijest promjena')).toBeInTheDocument();
    // Check for loading spinner by class
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render history entries when loaded', async () => {
    const mockHistory = {
      history: [
        {
          id: '1',
          action: 'created',
          old_value: null,
          new_value: 'Nova',
          created_at: '2024-01-15T10:30:00Z',
          user: {
            first_name: 'Ivan',
            last_name: 'Horvat'
          }
        },
        {
          id: '2',
          action: 'status_changed',
          old_value: 'Nova',
          new_value: 'U radu',
          created_at: '2024-01-15T11:00:00Z',
          user: {
            first_name: 'Ana',
            last_name: 'Marić'
          }
        }
      ]
    };

    ticketService.getTicketHistory.mockResolvedValue(mockHistory);
    
    render(<TicketHistory ticketId={mockTicketId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Tiket kreiran')).toBeInTheDocument();
    });

    expect(screen.getByText(/Status/)).toBeInTheDocument();
    expect(screen.getByText('Nova')).toBeInTheDocument();
    expect(screen.getByText('U radu')).toBeInTheDocument();
    expect(screen.getByText('Ivan Horvat')).toBeInTheDocument();
    expect(screen.getByText('Ana Marić')).toBeInTheDocument();
  });

  it('should handle array response format', async () => {
    const mockHistory = [
      {
        id: '1',
        action: 'created',
        old_value: null,
        new_value: 'Nova',
        created_at: '2024-01-15T10:30:00Z',
        user: {
          first_name: 'Ivan',
          last_name: 'Horvat'
        }
      }
    ];

    ticketService.getTicketHistory.mockResolvedValue(mockHistory);
    
    render(<TicketHistory ticketId={mockTicketId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Tiket kreiran')).toBeInTheDocument();
    });
  });

  it('should display empty state when no history', async () => {
    ticketService.getTicketHistory.mockResolvedValue({ history: [] });
    
    render(<TicketHistory ticketId={mockTicketId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Nema zabilježenih promjena')).toBeInTheDocument();
    });
  });

  it('should handle errors gracefully', async () => {
    const errorMessage = 'Greška pri učitavanju';
    ticketService.getTicketHistory.mockRejectedValue({
      response: { data: { message: errorMessage } }
    });
    
    render(<TicketHistory ticketId={mockTicketId} />);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should format assignee change correctly', async () => {
    const mockHistory = {
      history: [
        {
          id: '1',
          action: 'assigned',
          old_value: 'Unassigned',
          new_value: 'user-id-123',
          created_at: '2024-01-15T10:30:00Z',
          user: {
            first_name: 'Admin',
            last_name: 'User'
          }
        }
      ]
    };

    ticketService.getTicketHistory.mockResolvedValue(mockHistory);
    
    render(<TicketHistory ticketId={mockTicketId} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Dodijeljeno/)).toBeInTheDocument();
    });
  });

  it('should format field update correctly', async () => {
    const mockHistory = {
      history: [
        {
          id: '1',
          action: 'updated_priority',
          old_value: 'Niska',
          new_value: 'Visoka',
          created_at: '2024-01-15T10:30:00Z',
          user: {
            first_name: 'Korisnik',
            last_name: 'Test'
          }
        }
      ]
    };

    ticketService.getTicketHistory.mockResolvedValue(mockHistory);
    
    render(<TicketHistory ticketId={mockTicketId} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Prioritet/)).toBeInTheDocument();
      expect(screen.getByText('Niska')).toBeInTheDocument();
      expect(screen.getByText('Visoka')).toBeInTheDocument();
    });
  });

  it('should handle null values', async () => {
    const mockHistory = {
      history: [
        {
          id: '1',
          action: 'updated_description',
          old_value: null,
          new_value: 'Nova verzija opisa',
          created_at: '2024-01-15T10:30:00Z',
          user: {
            first_name: 'Test',
            last_name: 'User'
          }
        }
      ]
    };

    ticketService.getTicketHistory.mockResolvedValue(mockHistory);
    
    render(<TicketHistory ticketId={mockTicketId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Nije postavljeno')).toBeInTheDocument();
      expect(screen.getByText('Nova verzija opisa')).toBeInTheDocument();
    });
  });
});
