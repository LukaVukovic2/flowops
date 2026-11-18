/**
 * AssetTypeBadge Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AssetTypeBadge from './AssetTypeBadge';

describe('AssetTypeBadge', () => {
  it('renders Hardware badge', () => {
    render(<AssetTypeBadge type="Hardware" />);
    expect(screen.getByText('Hardware')).toBeInTheDocument();
  });

  it('renders Software badge', () => {
    render(<AssetTypeBadge type="Software" />);
    expect(screen.getByText('Software')).toBeInTheDocument();
  });

  it('renders Network badge with Croatian label', () => {
    render(<AssetTypeBadge type="Network" />);
    expect(screen.getByText('Mreža')).toBeInTheDocument();
  });

  it('renders Peripheral badge with Croatian label', () => {
    render(<AssetTypeBadge type="Peripheral" />);
    expect(screen.getByText('Periferija')).toBeInTheDocument();
  });

  it('renders unknown type with fallback', () => {
    render(<AssetTypeBadge type="Unknown" />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});
