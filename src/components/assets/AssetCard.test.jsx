/**
 * AssetCard Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AssetCard from './AssetCard';

describe('AssetCard', () => {
  const mockAsset = {
    id: '123',
    name: 'Dell PowerEdge R740',
    type: 'Hardware',
    status: 'Active',
    serialNumber: 'SN12345',
    model: 'R740',
    manufacturer: 'Dell',
    location: 'Server soba A',
    purchaseDate: '2023-01-15T00:00:00Z',
    warrantyExpiry: '2026-01-15T00:00:00Z'
  };

  it('renders asset name', () => {
    render(<AssetCard asset={mockAsset} />);
    expect(screen.getByText('Dell PowerEdge R740')).toBeInTheDocument();
  });

  it('displays type and status badges', () => {
    render(<AssetCard asset={mockAsset} />);
    expect(screen.getByText('Hardware')).toBeInTheDocument();
    expect(screen.getByText('Aktivno')).toBeInTheDocument();
  });

  it('displays serial number', () => {
    render(<AssetCard asset={mockAsset} />);
    expect(screen.getByText(/SN: SN12345/)).toBeInTheDocument();
  });

  it('displays location', () => {
    render(<AssetCard asset={mockAsset} />);
    expect(screen.getByText('Server soba A')).toBeInTheDocument();
  });

  it('displays manufacturer and model', () => {
    render(<AssetCard asset={mockAsset} />);
    expect(screen.getByText('Dell R740')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<AssetCard asset={mockAsset} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Dell PowerEdge R740'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('displays expired warranty warning', () => {
    const expiredAsset = {
      ...mockAsset,
      warrantyExpiry: '2020-01-15T00:00:00Z'
    };
    render(<AssetCard asset={expiredAsset} />);
    expect(screen.getByText(/istekla/i)).toBeInTheDocument();
  });

  it('handles asset without optional fields', () => {
    const minimalAsset = {
      id: '456',
      name: 'Basic Asset',
      type: 'Software',
      status: 'Inactive'
    };
    render(<AssetCard asset={minimalAsset} />);
    expect(screen.getByText('Basic Asset')).toBeInTheDocument();
    expect(screen.getByText('Software')).toBeInTheDocument();
  });
});
