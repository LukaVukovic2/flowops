/**
 * TicketFilters Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TicketFilters from './TicketFilters';

describe('TicketFilters Component', () => {
  const mockAssignees = [
    { id: '1', firstName: 'Ivan', lastName: 'Horvat' },
    { id: '2', firstName: 'Ana', lastName: 'Marić' },
    { id: '3', firstName: 'Marko', lastName: 'Kovač' }
  ];

  const defaultFilters = {
    status: '',
    assigneeId: '',
    fromDate: '',
    toDate: ''
  };

  let mockOnFilterChange;
  let mockOnClearFilters;

  beforeEach(() => {
    mockOnFilterChange = vi.fn();
    mockOnClearFilters = vi.fn();
  });

  describe('Rendering', () => {
    it('renders filter heading', () => {
      render(
        <TicketFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          assignees={mockAssignees}
          onClearFilters={mockOnClearFilters}
        />
      );
      expect(screen.getByText('Filteri')).toBeInTheDocument();
    });

    it('renders all filter labels in Croatian', () => {
      render(
        <TicketFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          assignees={mockAssignees}
          onClearFilters={mockOnClearFilters}
        />
      );
      
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Dodijeljen')).toBeInTheDocument();
      expect(screen.getByText('Od datuma')).toBeInTheDocument();
      expect(screen.getByText('Do datuma')).toBeInTheDocument();
    });

    it('renders all status options in Croatian', () => {
      render(
        <TicketFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          assignees={mockAssignees}
          onClearFilters={mockOnClearFilters}
        />
      );
      
      expect(screen.getByText('Svi statusi')).toBeInTheDocument();
      expect(screen.getByText('Nova')).toBeInTheDocument();
      expect(screen.getByText('U radu')).toBeInTheDocument();
      expect(screen.getByText('Na čekanju')).toBeInTheDocument();
      expect(screen.getByText('Riješena')).toBeInTheDocument();
      expect(screen.getByText('Zatvorena')).toBeInTheDocument();
    });

    it('renders assignee options', () => {
      render(
        <TicketFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          assignees={mockAssignees}
          onClearFilters={mockOnClearFilters}
        />
      );
      
      expect(screen.getByText('Svi korisnici')).toBeInTheDocument();
      expect(screen.getByText('Ivan Horvat')).toBeInTheDocument();
      expect(screen.getByText('Ana Marić')).toBeInTheDocument();
      expect(screen.getByText('Marko Kovač')).toBeInTheDocument();
    });
  });

  describe('Status filter', () => {
    it('calls onFilterChange when status is changed', () => {
      render(
        <TicketFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          assignees={mockAssignees}
          onClearFilters={mockOnClearFilters}
        />
      );
      
      const statusSelect = screen.getByLabelText('Status');
      fireEvent.change(statusSelect, { target: { value: 'Nova' } });
      
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        status: 'Nova'
      });
    });

    it('displays current status filter value', () => {
      const filtersWithStatus = { ...defaultFilters, status: 'U radu' };
      render(
        <TicketFilters
          filters={filtersWithStatus}
          onFilterChange={mockOnFilterChange}
          assignees={mockAssignees}
          onClearFilters={mockOnClearFilters}
        />
      );
      
      const statusSelect = screen.getByLabelText('Status');
      expect(statusSelect.value).toBe('U radu');
    });
  });

  describe('Assignee filter', () => {
    it('calls onFilterChange when assignee is changed', () => {
      render(
        <TicketFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          assignees={mockAssignees}
          onClearFilters={mockOnClearFilters}
        />
      );
      
      const assigneeSelect = screen.getByLabelText('Dodijeljen');
      fireEvent.change(assigneeSelect, { target: { value: '1' } });
      
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        assigneeId: '1'
      });
    });

    it('displays current assignee filter value', () => {
      const filtersWithAssignee = { ...defaultFilters, assigneeId: '2' };
      render(
        <TicketFilters
          filters={filtersWithAssignee}
          onFilterChange={mockOnFilterChange}
          assignees={mockAssignees}
          onClearFilters={mockOnClearFilters}
        />
      );
      
      const assigneeSelect = screen.getByLabelText('Dodijeljen');
      expect(assigneeSelect.value).toBe('2');
    });
  });

  describe('Date range filters', () => {
    it('calls onFilterChange when from date is changed', () => {
      render(
        <TicketFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          assignees={mockAssignees}
          onClearFilters={mockOnClearFilters}
        />
      );
      
      const fromDateInput = screen.getByLabelText('Od datuma');
      fireEvent.change(fromDateInput, { target: { value: '2024-01-01' } });
      
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        fromDate: '2024-01-01'
      });
    });

    it('calls onFilterChange when to date is changed', () => {
      render(
        <TicketFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          assignees={mockAssignees}
          onClearFilters={mockOnClearFilters}
        />
      );
      
      const toDateInput = screen.getByLabelText('Do datuma');
      fireEvent.change(toDateInput, { target: { value: '2024-01-31' } });
      
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        toDate: '2024-01-31'
      });
    });

    it('displays current date range values', () => {
      const filtersWithDates = {
        ...defaultFilters,
        fromDate: '2024-01-01',
        toDate: '2024-01-31'
      };
      render(
        <TicketFilters
          filters={filtersWithDates}
          onFilterChange={mockOnFilterChange}
          assignees={mockAssignees}
          onClearFilters={mockOnClearFilters}
        />
      );
      
      expect(screen.getByLabelText('Od datuma').value).toBe('2024-01-01');
      expect(screen.getByLabelText('Do datuma').value).toBe('2024-01-31');
    });
  });

  describe('Clear filters button', () => {
    it('does not show clear button when no filters are active', () => {
      render(
        <TicketFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          assignees={mockAssignees}
          onClearFilters={mockOnClearFilters}
        />
      );
      
      expect(screen.queryByText('Očisti filtere')).not.toBeInTheDocument();
    });

    it('shows clear button when status filter is active', () => {
      const filtersWithStatus = { ...defaultFilters, status: 'Nova' };
      render(
        <TicketFilters
          filters={filtersWithStatus}
          onFilterChange={mockOnFilterChange}
          assignees={mockAssignees}
          onClearFilters={mockOnClearFilters}
        />
      );
      
      expect(screen.getByText('Očisti filtere')).toBeInTheDocument();
    });

    it('shows clear button when assignee filter is active', () => {
      const filtersWithAssignee = { ...defaultFilters, assigneeId: '1' };
      render(
        <TicketFilters
          filters={filtersWithAssignee}
          onFilterChange={mockOnFilterChange}
          assignees={mockAssignees}
          onClearFilters={mockOnClearFilters}
        />
      );
      
      expect(screen.getByText('Očisti filtere')).toBeInTheDocument();
    });

    it('shows clear button when date filters are active', () => {
      const filtersWithDates = { ...defaultFilters, fromDate: '2024-01-01' };
      render(
        <TicketFilters
          filters={filtersWithDates}
          onFilterChange={mockOnFilterChange}
          assignees={mockAssignees}
          onClearFilters={mockOnClearFilters}
        />
      );
      
      expect(screen.getByText('Očisti filtere')).toBeInTheDocument();
    });

    it('calls onClearFilters when clear button is clicked', () => {
      const filtersWithStatus = { ...defaultFilters, status: 'Nova' };
      render(
        <TicketFilters
          filters={filtersWithStatus}
          onFilterChange={mockOnFilterChange}
          assignees={mockAssignees}
          onClearFilters={mockOnClearFilters}
        />
      );
      
      const clearButton = screen.getByText('Očisti filtere');
      fireEvent.click(clearButton);
      
      expect(mockOnClearFilters).toHaveBeenCalledTimes(1);
    });
  });

  describe('Responsive layout', () => {
    it('applies responsive grid classes', () => {
      const { container } = render(
        <TicketFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          assignees={mockAssignees}
          onClearFilters={mockOnClearFilters}
        />
      );
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-4');
    });
  });

  describe('Edge cases', () => {
    it('handles empty assignees array', () => {
      render(
        <TicketFilters
          filters={defaultFilters}
          onFilterChange={mockOnFilterChange}
          assignees={[]}
          onClearFilters={mockOnClearFilters}
        />
      );
      
      expect(screen.getByText('Svi korisnici')).toBeInTheDocument();
    });

    it('handles undefined filters prop', () => {
      render(
        <TicketFilters
          onFilterChange={mockOnFilterChange}
          assignees={mockAssignees}
          onClearFilters={mockOnClearFilters}
        />
      );
      
      // Should still render without errors
      expect(screen.getByText('Filteri')).toBeInTheDocument();
    });
  });
});
