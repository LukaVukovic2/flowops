/**
 * AssetFilters Component Tests
 * Tests for asset filtering functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssetFilters from './AssetFilters';

describe('AssetFilters', () => {
  const mockOnFilterChange = vi.fn();
  const mockOnClearFilters = vi.fn();

  it('renders all filter controls', () => {
    render(
      <AssetFilters 
        onFilterChange={mockOnFilterChange} 
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(screen.getByLabelText(/Tip/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Lokacija/i)).toBeInTheDocument();
  });

  it('displays type filter options', () => {
    render(
      <AssetFilters 
        onFilterChange={mockOnFilterChange} 
        onClearFilters={mockOnClearFilters}
      />
    );

    const typeSelect = screen.getByLabelText(/Tip/i);
    expect(typeSelect).toBeInTheDocument();
    
    // Check for type options
    expect(screen.getByRole('option', { name: /Svi tipovi/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /^Hardware$/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /^Software$/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /^Network$/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /^Peripheral$/i })).toBeInTheDocument();
  });

  it('displays status filter options', () => {
    render(
      <AssetFilters 
        onFilterChange={mockOnFilterChange} 
        onClearFilters={mockOnClearFilters}
      />
    );

    const statusSelect = screen.getByLabelText(/Status/i);
    expect(statusSelect).toBeInTheDocument();
    
    // Check for status options
    expect(screen.getByRole('option', { name: /Svi statusi/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /^Active$/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /^Inactive$/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /^Maintenance$/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /^Retired$/i })).toBeInTheDocument();
  });

  it('calls onFilterChange when type filter changes', async () => {
    const user = userEvent.setup();
    
    render(
      <AssetFilters 
        filters={{}}
        onFilterChange={mockOnFilterChange} 
        onClearFilters={mockOnClearFilters}
      />
    );

    const typeSelect = screen.getByLabelText(/Tip/i);
    await user.selectOptions(typeSelect, 'Hardware');

    expect(mockOnFilterChange).toHaveBeenCalledWith({ type: 'Hardware' });
  });

  it('calls onFilterChange when status filter changes', async () => {
    const user = userEvent.setup();
    
    render(
      <AssetFilters 
        filters={{}}
        onFilterChange={mockOnFilterChange} 
        onClearFilters={mockOnClearFilters}
      />
    );

    const statusSelect = screen.getByLabelText(/Status/i);
    await user.selectOptions(statusSelect, 'Maintenance');

    expect(mockOnFilterChange).toHaveBeenCalledWith({ status: 'Maintenance' });
  });

  it('calls onFilterChange when location filter changes', async () => {
    const user = userEvent.setup();
    
    render(
      <AssetFilters 
        filters={{}}
        onFilterChange={mockOnFilterChange} 
        onClearFilters={mockOnClearFilters}
      />
    );

    const locationInput = screen.getByLabelText(/Lokacija/i);
    await user.type(locationInput, 'Server Room');

    expect(mockOnFilterChange).toHaveBeenCalled();
  });

  it('displays location dropdown when locations array is provided', () => {
    const locations = ['Server Room A', 'Server Room B', 'Office Floor 1'];
    
    render(
      <AssetFilters 
        filters={{}}
        locations={locations}
        onFilterChange={mockOnFilterChange} 
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(screen.getByRole('option', { name: /Server Room A/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Server Room B/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Office Floor 1/i })).toBeInTheDocument();
  });

  it('shows clear filters button when filters are active', () => {
    render(
      <AssetFilters 
        filters={{ type: 'Hardware', status: 'Active' }}
        onFilterChange={mockOnFilterChange} 
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(screen.getByText(/Očisti filtere/i)).toBeInTheDocument();
  });

  it('hides clear filters button when no filters are active', () => {
    render(
      <AssetFilters 
        filters={{}}
        onFilterChange={mockOnFilterChange} 
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(screen.queryByText(/Očisti filtere/i)).not.toBeInTheDocument();
  });

  it('calls onClearFilters when clear button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <AssetFilters 
        filters={{ type: 'Hardware' }}
        onFilterChange={mockOnFilterChange} 
        onClearFilters={mockOnClearFilters}
      />
    );

    const clearButton = screen.getByText(/Očisti filtere/i);
    await user.click(clearButton);

    expect(mockOnClearFilters).toHaveBeenCalled();
  });

  it('preserves existing filters when changing one filter', async () => {
    const user = userEvent.setup();
    
    render(
      <AssetFilters 
        filters={{ type: 'Hardware' }}
        onFilterChange={mockOnFilterChange} 
        onClearFilters={mockOnClearFilters}
      />
    );

    const statusSelect = screen.getByLabelText(/Status/i);
    await user.selectOptions(statusSelect, 'Active');

    expect(mockOnFilterChange).toHaveBeenCalledWith({ 
      type: 'Hardware', 
      status: 'Active' 
    });
  });

  it('displays Croatian labels', () => {
    render(
      <AssetFilters 
        onFilterChange={mockOnFilterChange} 
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(screen.getByText(/^Filteri$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tip/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Lokacija/i)).toBeInTheDocument();
  });
});
