/**
 * AssetStatusBadge Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AssetStatusBadge from './AssetStatusBadge';

describe('AssetStatusBadge', () => {
  it('renders Active status with Croatian label', () => {
    render(<AssetStatusBadge status="Active" />);
    expect(screen.getByText('Aktivno')).toBeInTheDocument();
  });

  it('renders Inactive status with Croatian label', () => {
    render(<AssetStatusBadge status="Inactive" />);
    expect(screen.getByText('Neaktivno')).toBeInTheDocument();
  });

  it('renders Maintenance status with Croatian label', () => {
    render(<AssetStatusBadge status="Maintenance" />);
    expect(screen.getByText('Održavanje')).toBeInTheDocument();
  });

  it('renders Retired status with Croatian label', () => {
    render(<AssetStatusBadge status="Retired" />);
    expect(screen.getByText('Ukinuto')).toBeInTheDocument();
  });

  it('renders unknown status with fallback', () => {
    render(<AssetStatusBadge status="Unknown" />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});
