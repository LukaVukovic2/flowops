/**
 * AssetForm Component Tests
 * Tests for asset form validation and rendering
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssetForm from './AssetForm';

describe('AssetForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  it('renders all form fields', () => {
    render(
      <AssetForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    // Check for required fields
    expect(screen.getByLabelText(/Naziv/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tip/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    
    // Check for optional fields
    expect(screen.getByLabelText(/Serijski broj/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Proizvođač/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Lokacija/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Datum kupovine/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Istek garancije/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bilješke/i)).toBeInTheDocument();
  });

  it('displays validation errors for required fields when submitting empty form', async () => {
    const user = userEvent.setup();
    
    render(
      <AssetForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    // Clear the name field (it starts empty)
    const nameInput = screen.getByLabelText(/Naziv/i);
    await user.clear(nameInput);
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /Kreiraj/i });
    await user.click(submitButton);

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/Naziv je obavezan/i)).toBeInTheDocument();
    });

    // Verify onSubmit was not called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    
    render(
      <AssetForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    // Fill in required fields
    await user.type(screen.getByLabelText(/Naziv/i), 'Dell Server');
    
    // Type and Status should have default values
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /Kreiraj/i });
    await user.click(submitButton);

    // Wait for submission
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Dell Server',
          type: 'Hardware',
          status: 'Active'
        })
      );
    });
  });

  it('populates form with asset data in edit mode', () => {
    const asset = {
      name: 'Test Server',
      type: 'Hardware',
      status: 'Active',
      serialNumber: 'SN123456',
      model: 'PowerEdge R740',
      manufacturer: 'Dell',
      location: 'Server Room A',
      purchaseDate: '2024-01-15T00:00:00Z',
      warrantyExpiry: '2027-01-15T00:00:00Z',
      notes: 'Test notes'
    };

    render(
      <AssetForm 
        asset={asset}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    // Verify fields are populated
    expect(screen.getByDisplayValue('Test Server')).toBeInTheDocument();
    expect(screen.getByDisplayValue('SN123456')).toBeInTheDocument();
    expect(screen.getByDisplayValue('PowerEdge R740')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Dell')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Server Room A')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test notes')).toBeInTheDocument();
    
    // Check submit button text changes to "Spremi"
    expect(screen.getByRole('button', { name: /Spremi/i })).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <AssetForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Odustani/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables form while loading', () => {
    render(
      <AssetForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
        isLoading={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Kreiraj/i });
    const cancelButton = screen.getByRole('button', { name: /Odustani/i });
    
    expect(submitButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('validates Croatian error messages', async () => {
    const user = userEvent.setup();
    
    render(
      <AssetForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    // Try to submit without name
    const submitButton = screen.getByRole('button', { name: /Kreiraj/i });
    await user.click(submitButton);

    // Check Croatian error message appears
    await waitFor(() => {
      const errorMessage = screen.queryByText(/Naziv je obavezan/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it('renders section headers in Croatian', () => {
    render(
      <AssetForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );

    expect(screen.getByText(/Osnovne informacije/i)).toBeInTheDocument();
    expect(screen.getByText(/Tehnički detalji/i)).toBeInTheDocument();
    expect(screen.getByText(/Kupovina i garancija/i)).toBeInTheDocument();
    expect(screen.getByText(/Dodatne informacije/i)).toBeInTheDocument();
  });
});
