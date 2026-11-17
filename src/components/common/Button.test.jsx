/**
 * Button Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button.jsx';

describe('Button Component', () => {
  it('renders button with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });

  it('shows loading spinner when loading prop is true', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByText('Loading')).toBeDisabled();
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText('Primary').className).toContain('bg-blue-600');
    
    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByText('Danger').className).toContain('bg-red-600');
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Button size="small">Small</Button>);
    expect(screen.getByText('Small').className).toContain('px-3');
    
    rerender(<Button size="large">Large</Button>);
    expect(screen.getByText('Large').className).toContain('px-6');
  });
});
