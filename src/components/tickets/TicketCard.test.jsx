/**
 * TicketCard Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TicketCard from './TicketCard';

// Mock the dateFormatter module
vi.mock('../../utils/dateFormatter', () => ({
  formatDateTime: (date) => {
    if (!date) return '';
    return '15.01.2024 10:30';
  }
}));

describe('TicketCard Component', () => {
  const mockTicket = {
    id: '123',
    title: 'Server nije dostupan',
    status: 'Nova',
    priority: 'Visoka',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    creator: {
      firstName: 'Ivan',
      lastName: 'Horvat'
    },
    assignee: {
      firstName: 'Ana',
      lastName: 'Marić'
    }
  };

  it('renders ticket title', () => {
    render(<TicketCard ticket={mockTicket} />);
    expect(screen.getByText('Server nije dostupan')).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<TicketCard ticket={mockTicket} />);
    expect(screen.getByText('Nova')).toBeInTheDocument();
  });

  it('renders priority badge when priority is provided', () => {
    render(<TicketCard ticket={mockTicket} />);
    expect(screen.getByText('Visoka')).toBeInTheDocument();
  });

  it('does not render priority badge when priority is not provided', () => {
    const ticketWithoutPriority = { ...mockTicket, priority: null };
    render(<TicketCard ticket={ticketWithoutPriority} />);
    
    // Status badge should still exist
    expect(screen.getByText('Nova')).toBeInTheDocument();
    // Priority should not exist
    const badges = screen.getAllByText(/Nova|Visoka/);
    expect(badges).toHaveLength(1); // Only status badge
  });

  it('displays creator information', () => {
    render(<TicketCard ticket={mockTicket} />);
    expect(screen.getByText(/Kreirao: Ivan Horvat/)).toBeInTheDocument();
  });

  it('displays assignee information when assignee exists', () => {
    render(<TicketCard ticket={mockTicket} />);
    expect(screen.getByText(/Dodijeljen: Ana Marić/)).toBeInTheDocument();
  });

  it('does not display assignee information when assignee is null', () => {
    const ticketWithoutAssignee = { ...mockTicket, assignee: null };
    render(<TicketCard ticket={ticketWithoutAssignee} />);
    expect(screen.queryByText(/Dodijeljen:/)).not.toBeInTheDocument();
  });

  it('displays creation timestamp', () => {
    render(<TicketCard ticket={mockTicket} />);
    expect(screen.getByText(/Kreirano: 15\.01\.2024 10:30/)).toBeInTheDocument();
  });

  it('displays updated timestamp when different from created', () => {
    render(<TicketCard ticket={mockTicket} />);
    expect(screen.getByText(/Ažurirano: 15\.01\.2024 10:30/)).toBeInTheDocument();
  });

  it('does not display updated timestamp when same as created', () => {
    const ticketNotUpdated = {
      ...mockTicket,
      updatedAt: mockTicket.createdAt
    };
    render(<TicketCard ticket={ticketNotUpdated} />);
    
    // Should show created
    expect(screen.getByText(/Kreirano:/)).toBeInTheDocument();
    // Should not show updated
    expect(screen.queryByText(/Ažurirano:/)).not.toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<TicketCard ticket={mockTicket} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Server nije dostupan'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies cursor-pointer class', () => {
    const { container } = render(<TicketCard ticket={mockTicket} />);
    const card = container.querySelector('.cursor-pointer');
    expect(card).toBeInTheDocument();
  });

  it('applies hover border effect', () => {
    const { container } = render(<TicketCard ticket={mockTicket} />);
    const card = container.querySelector('.hover\\:border-blue-500');
    expect(card).toBeInTheDocument();
  });

  it('truncates long titles', () => {
    const longTitleTicket = {
      ...mockTicket,
      title: 'This is a very long ticket title that should be truncated when displayed in the card view'
    };
    render(<TicketCard ticket={longTitleTicket} />);
    const titleElement = screen.getByText(longTitleTicket.title);
    expect(titleElement).toHaveClass('line-clamp-2');
  });

  it('handles missing creator gracefully', () => {
    const ticketWithoutCreator = { ...mockTicket, creator: null };
    render(<TicketCard ticket={ticketWithoutCreator} />);
    expect(screen.queryByText(/Kreirao:/)).not.toBeInTheDocument();
  });
});
