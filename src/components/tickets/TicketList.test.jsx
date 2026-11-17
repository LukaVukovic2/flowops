/**
 * TicketList Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TicketList from './TicketList';

// Mock child components
vi.mock('./TicketCard', () => ({
  default: ({ ticket, onClick }) => (
    <div onClick={onClick} data-testid={`ticket-card-${ticket.id}`}>
      {ticket.title}
    </div>
  )
}));

vi.mock('./TicketFilters', () => ({
  default: ({ filters, onFilterChange, assignees, onClearFilters }) => (
    <div data-testid="ticket-filters">
      <button onClick={() => onFilterChange({ status: 'Nova' })}>
        Change Filter
      </button>
      <button onClick={onClearFilters}>Clear Filters</button>
    </div>
  )
}));

describe('TicketList Component', () => {
  const mockTickets = [
    {
      id: '1',
      title: 'Server nije dostupan',
      status: 'Nova',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      title: 'Printer ne radi',
      status: 'U radu',
      createdAt: '2024-01-15T11:00:00Z'
    },
    {
      id: '3',
      title: 'Email problemi',
      status: 'Riješena',
      createdAt: '2024-01-15T12:00:00Z'
    }
  ];

  const mockAssignees = [
    { id: '1', firstName: 'Ivan', lastName: 'Horvat' },
    { id: '2', firstName: 'Ana', lastName: 'Marić' }
  ];

  let mockOnTicketClick;
  let mockOnCreateTicket;
  let mockOnFilterChange;

  beforeEach(() => {
    mockOnTicketClick = vi.fn();
    mockOnCreateTicket = vi.fn();
    mockOnFilterChange = vi.fn();
  });

  describe('Header rendering', () => {
    it('renders the title', () => {
      render(
        <TicketList
          tickets={mockTickets}
          assignees={mockAssignees}
        />
      );
      
      expect(screen.getByText('Tiketi')).toBeInTheDocument();
    });

    it('displays ticket count', () => {
      render(
        <TicketList
          tickets={mockTickets}
          assignees={mockAssignees}
        />
      );
      
      expect(screen.getByText('3 tiketa')).toBeInTheDocument();
    });

    it('displays loading text when loading', () => {
      render(
        <TicketList
          tickets={[]}
          assignees={mockAssignees}
          isLoading={true}
        />
      );
      
      expect(screen.getByText('Učitavanje...')).toBeInTheDocument();
    });

    it('renders create button when onCreateTicket is provided', () => {
      render(
        <TicketList
          tickets={mockTickets}
          assignees={mockAssignees}
          onCreateTicket={mockOnCreateTicket}
        />
      );
      
      expect(screen.getByText('Novi tiket')).toBeInTheDocument();
    });

    it('does not render create button when onCreateTicket is not provided', () => {
      render(
        <TicketList
          tickets={mockTickets}
          assignees={mockAssignees}
        />
      );
      
      expect(screen.queryByText('Novi tiket')).not.toBeInTheDocument();
    });

    it('calls onCreateTicket when create button is clicked', () => {
      render(
        <TicketList
          tickets={mockTickets}
          assignees={mockAssignees}
          onCreateTicket={mockOnCreateTicket}
        />
      );
      
      fireEvent.click(screen.getByText('Novi tiket'));
      expect(mockOnCreateTicket).toHaveBeenCalledTimes(1);
    });
  });

  describe('Filters', () => {
    it('renders TicketFilters component', () => {
      render(
        <TicketList
          tickets={mockTickets}
          assignees={mockAssignees}
        />
      );
      
      expect(screen.getByTestId('ticket-filters')).toBeInTheDocument();
    });

    it('calls onFilterChange when filters change', async () => {
      render(
        <TicketList
          tickets={mockTickets}
          assignees={mockAssignees}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      // Trigger filter change through mocked component
      fireEvent.click(screen.getByText('Change Filter'));
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'Nova' })
        );
      });
    });
  });

  describe('Loading state', () => {
    it('renders loading skeletons when loading', () => {
      render(
        <TicketList
          tickets={[]}
          assignees={mockAssignees}
          isLoading={true}
        />
      );
      
      // Should render 3 skeleton items
      const skeletons = screen.getAllByRole('generic').filter(el => 
        el.className.includes('animate-pulse')
      );
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('does not render ticket cards when loading', () => {
      render(
        <TicketList
          tickets={mockTickets}
          assignees={mockAssignees}
          isLoading={true}
        />
      );
      
      expect(screen.queryByTestId('ticket-card-1')).not.toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('renders empty state when no tickets and not loading', () => {
      render(
        <TicketList
          tickets={[]}
          assignees={mockAssignees}
          isLoading={false}
        />
      );
      
      expect(screen.getByText('Nema tiketa za prikaz')).toBeInTheDocument();
    });

    it('renders create button in empty state when onCreateTicket provided', () => {
      render(
        <TicketList
          tickets={[]}
          assignees={mockAssignees}
          isLoading={false}
          onCreateTicket={mockOnCreateTicket}
        />
      );
      
      expect(screen.getByText('Kreiraj prvi tiket')).toBeInTheDocument();
    });

    it('calls onCreateTicket when empty state button is clicked', () => {
      render(
        <TicketList
          tickets={[]}
          assignees={mockAssignees}
          isLoading={false}
          onCreateTicket={mockOnCreateTicket}
        />
      );
      
      fireEvent.click(screen.getByText('Kreiraj prvi tiket'));
      expect(mockOnCreateTicket).toHaveBeenCalledTimes(1);
    });

    it('does not render empty state when loading', () => {
      render(
        <TicketList
          tickets={[]}
          assignees={mockAssignees}
          isLoading={true}
        />
      );
      
      expect(screen.queryByText('Nema tiketa za prikaz')).not.toBeInTheDocument();
    });
  });

  describe('Ticket list rendering', () => {
    it('renders all tickets', () => {
      render(
        <TicketList
          tickets={mockTickets}
          assignees={mockAssignees}
        />
      );
      
      expect(screen.getByText('Server nije dostupan')).toBeInTheDocument();
      expect(screen.getByText('Printer ne radi')).toBeInTheDocument();
      expect(screen.getByText('Email problemi')).toBeInTheDocument();
    });

    it('renders tickets in grid layout', () => {
      const { container } = render(
        <TicketList
          tickets={mockTickets}
          assignees={mockAssignees}
        />
      );
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('lg:grid-cols-2');
    });

    it('calls onTicketClick when ticket is clicked', () => {
      render(
        <TicketList
          tickets={mockTickets}
          assignees={mockAssignees}
          onTicketClick={mockOnTicketClick}
        />
      );
      
      fireEvent.click(screen.getByTestId('ticket-card-1'));
      expect(mockOnTicketClick).toHaveBeenCalledWith(mockTickets[0]);
    });

    it('renders correct number of tickets', () => {
      render(
        <TicketList
          tickets={mockTickets}
          assignees={mockAssignees}
        />
      );
      
      expect(screen.getByTestId('ticket-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('ticket-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('ticket-card-3')).toBeInTheDocument();
    });
  });

  describe('Default props', () => {
    it('handles empty tickets array', () => {
      render(<TicketList />);
      expect(screen.getByText('Nema tiketa za prikaz')).toBeInTheDocument();
    });

    it('handles empty assignees array', () => {
      render(
        <TicketList
          tickets={mockTickets}
        />
      );
      expect(screen.getByText('3 tiketa')).toBeInTheDocument();
    });

    it('handles missing callbacks', () => {
      render(
        <TicketList
          tickets={mockTickets}
          assignees={mockAssignees}
        />
      );
      
      // Should render without errors
      expect(screen.getByText('Tiketi')).toBeInTheDocument();
    });
  });

  describe('Filter state management', () => {
    it('initializes filters with empty values', () => {
      render(
        <TicketList
          tickets={mockTickets}
          assignees={mockAssignees}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      // Initial filter call should be made with empty filters
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        status: '',
        assigneeId: '',
        fromDate: '',
        toDate: ''
      });
    });

    it('updates filters when changed', async () => {
      render(
        <TicketList
          tickets={mockTickets}
          assignees={mockAssignees}
          onFilterChange={mockOnFilterChange}
        />
      );
      
      fireEvent.click(screen.getByText('Change Filter'));
      
      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'Nova' })
        );
      });
    });
  });

  describe('Responsive design', () => {
    it('applies responsive spacing', () => {
      const { container } = render(
        <TicketList
          tickets={mockTickets}
          assignees={mockAssignees}
        />
      );
      
      const mainContainer = container.querySelector('.space-y-6');
      expect(mainContainer).toBeInTheDocument();
    });
  });
});
