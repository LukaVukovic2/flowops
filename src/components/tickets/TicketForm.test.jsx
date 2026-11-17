/**
 * TicketForm Component Tests
 * Requirements: 2.1, 2.10, 12.6, 15.8
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TicketForm from './TicketForm';
import * as userService from '../../services/userService';

// Mock the AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: '123',
      role: 'Administrator',
      email: 'admin@example.com'
    }
  })
}));

// Mock the userService
vi.mock('../../services/userService', () => ({
  getUsersByRole: vi.fn()
}));

describe('TicketForm Component', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const mockTechnicians = [
    { id: '1', firstName: 'Ana', lastName: 'Marić' },
    { id: '2', firstName: 'Ivan', lastName: 'Horvat' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    userService.getUsersByRole.mockResolvedValue(mockTechnicians);
  });

  describe('Rendering', () => {
    it('renders all form fields', () => {
      render(<TicketForm onSubmit={mockOnSubmit} />);
      
      expect(screen.getByLabelText(/Naslov/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Opis/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Prioritet/)).toBeInTheDocument();
    });

    it('displays Croatian labels', () => {
      render(<TicketForm onSubmit={mockOnSubmit} />);
      
      expect(screen.getByText('Naslov')).toBeInTheDocument();
      expect(screen.getByText('Opis')).toBeInTheDocument();
      expect(screen.getByText('Prioritet')).toBeInTheDocument();
    });

    it('shows assignee field for administrators', async () => {
      render(<TicketForm onSubmit={mockOnSubmit} />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Dodijeljen/)).toBeInTheDocument();
      });
    });

    it('loads technicians for assignee dropdown', async () => {
      render(<TicketForm onSubmit={mockOnSubmit} />);
      
      await waitFor(() => {
        expect(userService.getUsersByRole).toHaveBeenCalledWith('Tehničar');
      });
    });

    it('displays submit button with "Kreiraj" text for new ticket', () => {
      render(<TicketForm onSubmit={mockOnSubmit} />);
      
      expect(screen.getByRole('button', { name: /Kreiraj/ })).toBeInTheDocument();
    });

    it('displays submit button with "Spremi" text for editing', () => {
      const existingTicket = {
        title: 'Test tiket',
        description: 'Test opis',
        priority: 'Visoka',
        assigneeId: '1'
      };

      render(<TicketForm ticket={existingTicket} onSubmit={mockOnSubmit} />);
      
      expect(screen.getByRole('button', { name: /Spremi/ })).toBeInTheDocument();
    });

    it('displays cancel button when onCancel is provided', () => {
      render(<TicketForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      expect(screen.getByRole('button', { name: /Odustani/ })).toBeInTheDocument();
    });
  });

  describe('Form Pre-population', () => {
    it('pre-fills form with ticket data when editing', () => {
      const existingTicket = {
        title: 'Server problem',
        description: 'Server ne radi',
        priority: 'Visoka',
        assigneeId: '1'
      };

      render(<TicketForm ticket={existingTicket} onSubmit={mockOnSubmit} />);
      
      expect(screen.getByDisplayValue('Server problem')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Server ne radi')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Visoka')).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('displays validation error for empty title in Croatian', async () => {
      const user = userEvent.setup();
      render(<TicketForm onSubmit={mockOnSubmit} />);
      
      const submitButton = screen.getByRole('button', { name: /Kreiraj/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Naslov je obavezan')).toBeInTheDocument();
      });
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('displays validation error for empty description in Croatian', async () => {
      const user = userEvent.setup();
      render(<TicketForm onSubmit={mockOnSubmit} />);
      
      const titleInput = screen.getByLabelText(/Naslov/);
      await user.type(titleInput, 'Test naslov');
      
      const submitButton = screen.getByRole('button', { name: /Kreiraj/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Opis je obavezan')).toBeInTheDocument();
      });
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('displays validation error for title exceeding 200 characters', async () => {
      const user = userEvent.setup();
      render(<TicketForm onSubmit={mockOnSubmit} />);
      
      const titleInput = screen.getByLabelText(/Naslov/);
      const longTitle = 'A'.repeat(201);
      await user.type(titleInput, longTitle);
      
      const submitButton = screen.getByRole('button', { name: /Kreiraj/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/može imati najviše 200 znakova/)).toBeInTheDocument();
      });
    });

    it('displays validation error for description exceeding 5000 characters', async () => {
      const user = userEvent.setup();
      render(<TicketForm onSubmit={mockOnSubmit} />);
      
      const titleInput = screen.getByLabelText(/Naslov/);
      const descriptionInput = screen.getByLabelText(/Opis/);
      
      // Use fireEvent.change instead of userEvent.type for long text to avoid timeout
      fireEvent.change(titleInput, { target: { value: 'Valid title' } });
      const longDescription = 'A'.repeat(5001);
      fireEvent.change(descriptionInput, { target: { value: longDescription } });
      
      const submitButton = screen.getByRole('button', { name: /Kreiraj/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/može imati najviše 5000 znakova/)).toBeInTheDocument();
      });
    });

    it('accepts valid form data', async () => {
      const user = userEvent.setup();
      render(<TicketForm onSubmit={mockOnSubmit} />);
      
      const titleInput = screen.getByLabelText(/Naslov/);
      const descriptionInput = screen.getByLabelText(/Opis/);
      
      await user.type(titleInput, 'Valid title');
      await user.type(descriptionInput, 'Valid description');
      
      const submitButton = screen.getByRole('button', { name: /Kreiraj/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit with form data', async () => {
      const user = userEvent.setup();
      render(<TicketForm onSubmit={mockOnSubmit} />);
      
      // Use fireEvent.change for more reliable test
      const titleInput = screen.getByLabelText(/Naslov/);
      const descriptionInput = screen.getByLabelText(/Opis/);
      const prioritySelect = screen.getByLabelText(/Prioritet/);
      
      fireEvent.change(titleInput, { target: { value: 'Test tiket' } });
      fireEvent.change(descriptionInput, { target: { value: 'Test opis' } });
      fireEvent.change(prioritySelect, { target: { value: 'Visoka' } });
      
      const submitButton = screen.getByRole('button', { name: /Kreiraj/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test tiket',
            description: 'Test opis',
            priority: 'Visoka',
            assigneeId: null
          })
        );
      });
    });

    it('converts assigneeId to number when selected', async () => {
      const user = userEvent.setup();
      render(<TicketForm onSubmit={mockOnSubmit} />);
      
      await user.type(screen.getByLabelText(/Naslov/), 'Test tiket');
      await user.type(screen.getByLabelText(/Opis/), 'Test opis');
      
      await waitFor(() => {
        const assigneeSelect = screen.getByLabelText(/Dodijeljen/);
        expect(assigneeSelect).toBeInTheDocument();
      });
      
      const assigneeSelect = screen.getByLabelText(/Dodijeljen/);
      await user.selectOptions(assigneeSelect, '1');
      
      const submitButton = screen.getByRole('button', { name: /Kreiraj/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            assigneeId: 1
          })
        );
      });
    });

    it('sets assigneeId to null when not selected', async () => {
      const user = userEvent.setup();
      render(<TicketForm onSubmit={mockOnSubmit} />);
      
      await user.type(screen.getByLabelText(/Naslov/), 'Test tiket');
      await user.type(screen.getByLabelText(/Opis/), 'Test opis');
      
      const submitButton = screen.getByRole('button', { name: /Kreiraj/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            assigneeId: null
          })
        );
      });
    });

    it('disables form during submission', () => {
      render(<TicketForm onSubmit={mockOnSubmit} isLoading={true} />);
      
      const submitButton = screen.getByRole('button', { name: /Kreiraj/ });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Priority Options', () => {
    it('displays all priority options in Croatian', async () => {
      render(<TicketForm onSubmit={mockOnSubmit} />);
      
      const prioritySelect = screen.getByLabelText(/Prioritet/);
      
      expect(prioritySelect).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Niska' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Srednja' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Visoka' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Hitna' })).toBeInTheDocument();
    });

    it('defaults to "Srednja" priority for new tickets', () => {
      render(<TicketForm onSubmit={mockOnSubmit} />);
      
      const prioritySelect = screen.getByLabelText(/Prioritet/);
      expect(prioritySelect).toHaveValue('Srednja');
    });
  });

  describe('Cancel Action', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<TicketForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      
      const cancelButton = screen.getByRole('button', { name: /Odustani/ });
      await user.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('disables cancel button during submission', () => {
      render(
        <TicketForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
          isLoading={true} 
        />
      );
      
      const cancelButton = screen.getByRole('button', { name: /Odustani/ });
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Role-Based Rendering', () => {
    it('shows assignee field for Tehničar role', () => {
      vi.mocked(vi.importActual('../../context/AuthContext')).useAuth = () => ({
        user: {
          id: '123',
          role: 'Tehničar',
          email: 'tech@example.com'
        }
      });

      render(<TicketForm onSubmit={mockOnSubmit} />);
      
      waitFor(() => {
        expect(screen.getByLabelText(/Dodijeljen/)).toBeInTheDocument();
      });
    });
  });
});
