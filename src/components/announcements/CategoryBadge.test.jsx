/**
 * CategoryBadge Component Tests
 * Requirements: 3.2, 3.3, 12.2
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CategoryBadge from './CategoryBadge.jsx';

describe('CategoryBadge Component', () => {
  it('renders category name', () => {
    const category = {
      id: '1',
      name: 'Održavanje',
      color: '#3B82F6'
    };

    render(<CategoryBadge category={category} />);
    expect(screen.getByText('Održavanje')).toBeInTheDocument();
  });

  it('applies custom color styles when color is provided', () => {
    const category = {
      id: '1',
      name: 'Sigurnost',
      color: '#EF4444'
    };

    render(<CategoryBadge category={category} />);
    const badge = screen.getByText('Sigurnost');
    
    expect(badge).toHaveStyle({
      color: '#EF4444'
    });
  });

  it('renders without color when color is not provided', () => {
    const category = {
      id: '1',
      name: 'Općenito'
    };

    render(<CategoryBadge category={category} />);
    expect(screen.getByText('Općenito')).toBeInTheDocument();
  });

  it('does not render when category is null', () => {
    const { container } = render(<CategoryBadge category={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('does not render when category is undefined', () => {
    const { container } = render(<CategoryBadge category={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('applies small size class', () => {
    const category = {
      id: '1',
      name: 'Test',
      color: '#3B82F6'
    };

    render(<CategoryBadge category={category} size="small" />);
    const badge = screen.getByText('Test');
    expect(badge.className).toContain('text-xs');
  });

  it('applies medium size class by default', () => {
    const category = {
      id: '1',
      name: 'Test',
      color: '#3B82F6'
    };

    render(<CategoryBadge category={category} />);
    const badge = screen.getByText('Test');
    expect(badge.className).toContain('text-sm');
  });
});
