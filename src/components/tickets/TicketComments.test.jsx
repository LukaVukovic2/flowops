/**
 * TicketComments Component Tests
 * Tests for ticket comments component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TicketComments from './TicketComments';
import * as ticketService from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';

// Mock dependencies
vi.mock('../../services/ticketService', () => ({
  getTicketComments: vi.fn(),
  addTicketComment: vi.fn()
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('../../utils/dateFormatter', () => ({
  formatDateTime: vi.fn((date) => '15.01.2024 10:30')
}));

describe('TicketComments', () => {
  const mockTicketId = 'ticket-123';
  const mockUser = {
    id: 'user-123',
    role: 'Tehničar',
    firstName: 'Test',
    lastName: 'User'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
  });

  it('should render loading state initially', () => {
    ticketService.getTicketComments.mockImplementation(() => new Promise(() => {}));
    
    render(<TicketComments ticketId={mockTicketId} />);
    
    expect(screen.getByText(/Komentari/)).toBeInTheDocument();
    // Check for loading spinner by class
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render comments when loaded', async () => {
    const mockComments = {
      comments: [
        {
          id: '1',
          content: 'Ovo je test komentar',
          created_at: '2024-01-15T10:30:00Z',
          author: {
            first_name: 'Ivan',
            last_name: 'Horvat'
          }
        },
        {
          id: '2',
          content: 'Drugi komentar',
          created_at: '2024-01-15T11:00:00Z',
          author: {
            first_name: 'Ana',
            last_name: 'Marić'
          }
        }
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1
      }
    };

    ticketService.getTicketComments.mockResolvedValue(mockComments);
    
    render(<TicketComments ticketId={mockTicketId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Ovo je test komentar')).toBeInTheDocument();
    });

    expect(screen.getByText('Drugi komentar')).toBeInTheDocument();
    expect(screen.getByText('Ivan Horvat')).toBeInTheDocument();
    expect(screen.getByText('Ana Marić')).toBeInTheDocument();
  });

  it('should handle camelCase field names for backwards compatibility', async () => {
    const mockComments = {
      comments: [
        {
          id: '1',
          content: 'Test comment',
          createdAt: '2024-01-15T10:30:00Z',
          author: {
            firstName: 'John',
            lastName: 'Doe'
          }
        }
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1
      }
    };

    ticketService.getTicketComments.mockResolvedValue(mockComments);
    
    render(<TicketComments ticketId={mockTicketId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test comment')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should display empty state when no comments', async () => {
    ticketService.getTicketComments.mockResolvedValue({
      comments: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
    });
    
    render(<TicketComments ticketId={mockTicketId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Nema komentara')).toBeInTheDocument();
    });
  });

  it('should handle adding a new comment', async () => {
    const mockComments = {
      comments: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
    };

    const newComment = {
      id: 'new-1',
      content: 'Novi komentar',
      created_at: '2024-01-15T12:00:00Z',
      author: {
        first_name: 'Test',
        last_name: 'User'
      }
    };

    ticketService.getTicketComments.mockResolvedValue(mockComments);
    ticketService.addTicketComment.mockResolvedValue(newComment);
    
    const user = userEvent.setup();
    render(<TicketComments ticketId={mockTicketId} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Napišite komentar...')).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText('Napišite komentar...');
    const submitButton = screen.getByRole('button', { name: /Dodaj komentar/i });

    await user.type(textarea, 'Novi komentar');
    await user.click(submitButton);

    await waitFor(() => {
      expect(ticketService.addTicketComment).toHaveBeenCalledWith(mockTicketId, 'Novi komentar');
    });

    await waitFor(() => {
      expect(screen.getByText('Novi komentar')).toBeInTheDocument();
    });
  });

  it('should clear form after successful comment submission', async () => {
    const mockComments = {
      comments: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
    };

    const newComment = {
      id: 'new-1',
      content: 'Test',
      created_at: '2024-01-15T12:00:00Z',
      author: { first_name: 'User', last_name: 'Test' }
    };

    ticketService.getTicketComments.mockResolvedValue(mockComments);
    ticketService.addTicketComment.mockResolvedValue(newComment);
    
    const user = userEvent.setup();
    render(<TicketComments ticketId={mockTicketId} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Napišite komentar...')).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText('Napišite komentar...');
    await user.type(textarea, 'Test komentar');
    await user.click(screen.getByRole('button', { name: /Dodaj komentar/i }));

    await waitFor(() => {
      expect(textarea).toHaveValue('');
    });
  });

  it('should display error when comment submission fails', async () => {
    const mockComments = {
      comments: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
    };

    const errorMessage = 'Greška pri dodavanju komentara';
    ticketService.getTicketComments.mockResolvedValue(mockComments);
    ticketService.addTicketComment.mockRejectedValue({
      response: { data: { message: errorMessage } }
    });
    
    const user = userEvent.setup();
    render(<TicketComments ticketId={mockTicketId} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Napišite komentar...')).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText('Napišite komentar...');
    await user.type(textarea, 'Test');
    await user.click(screen.getByRole('button', { name: /Dodaj komentar/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should show load more button when there are more pages', async () => {
    const mockComments = {
      comments: [
        {
          id: '1',
          content: 'First comment',
          created_at: '2024-01-15T10:30:00Z',
          author: { first_name: 'User', last_name: 'One' }
        }
      ],
      pagination: {
        page: 1,
        limit: 1,
        total: 2,
        totalPages: 2
      }
    };

    ticketService.getTicketComments.mockResolvedValue(mockComments);
    
    render(<TicketComments ticketId={mockTicketId} />);
    
    await waitFor(() => {
      expect(screen.getByText('First comment')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Učitaj više/i })).toBeInTheDocument();
  });

  it('should load more comments when button clicked', async () => {
    const firstPageComments = {
      comments: [
        {
          id: '1',
          content: 'First comment',
          created_at: '2024-01-15T10:30:00Z',
          author: { first_name: 'User', last_name: 'One' }
        }
      ],
      pagination: { page: 1, limit: 1, total: 2, totalPages: 2 }
    };

    const secondPageComments = {
      comments: [
        {
          id: '2',
          content: 'Second comment',
          created_at: '2024-01-15T11:30:00Z',
          author: { first_name: 'User', last_name: 'Two' }
        }
      ],
      pagination: { page: 2, limit: 1, total: 2, totalPages: 2 }
    };

    ticketService.getTicketComments
      .mockResolvedValueOnce(firstPageComments)
      .mockResolvedValueOnce(secondPageComments);
    
    const user = userEvent.setup();
    render(<TicketComments ticketId={mockTicketId} />);
    
    await waitFor(() => {
      expect(screen.getByText('First comment')).toBeInTheDocument();
    });

    const loadMoreButton = screen.getByRole('button', { name: /Učitaj više/i });
    await user.click(loadMoreButton);

    await waitFor(() => {
      expect(screen.getByText('Second comment')).toBeInTheDocument();
    });

    expect(screen.getByText('First comment')).toBeInTheDocument();
  });

  it('should handle errors when loading comments', async () => {
    const errorMessage = 'Failed to load';
    ticketService.getTicketComments.mockRejectedValue({
      response: { data: { message: errorMessage } }
    });
    
    render(<TicketComments ticketId={mockTicketId} />);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should display comment count correctly', async () => {
    const mockComments = {
      comments: [
        { id: '1', content: 'C1', created_at: '2024-01-15T10:30:00Z', author: { first_name: 'U', last_name: '1' } },
        { id: '2', content: 'C2', created_at: '2024-01-15T10:31:00Z', author: { first_name: 'U', last_name: '2' } }
      ],
      pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
    };

    ticketService.getTicketComments.mockResolvedValue(mockComments);
    
    render(<TicketComments ticketId={mockTicketId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Komentari (2)')).toBeInTheDocument();
    });
  });
});
