/**
 * StatCard Component Tests
 * Tests for the dashboard statistics card component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCard from './StatCard';
import { Megaphone } from 'lucide-react';

describe('StatCard Component', () => {
  it('renders title and value correctly', () => {
    render(
      <StatCard 
        title="Objave" 
        value={15} 
        icon={Megaphone}
      />
    );

    expect(screen.getByText('Objave')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <StatCard 
        title="Tiketi" 
        value={42} 
        description="Aktivni tiketi"
        icon={Megaphone}
      />
    );

    expect(screen.getByText('Aktivni tiketi')).toBeInTheDocument();
  });

  it('renders em dash when value is null', () => {
    render(
      <StatCard 
        title="Objave" 
        value={null} 
        icon={Megaphone}
      />
    );

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders em dash when value is undefined', () => {
    render(
      <StatCard 
        title="Objave" 
        value={undefined} 
        icon={Megaphone}
      />
    );

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('applies primary variant styling', () => {
    const { container } = render(
      <StatCard 
        title="Objave" 
        value={10} 
        variant="primary"
        icon={Megaphone}
      />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('border-primary-500/30');
  });

  it('applies success variant styling', () => {
    const { container } = render(
      <StatCard 
        title="Objave" 
        value={10} 
        variant="success"
        icon={Megaphone}
      />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('border-green-500/30');
  });

  it('renders without icon when not provided', () => {
    render(
      <StatCard 
        title="Objave" 
        value={10} 
      />
    );

    expect(screen.getByText('Objave')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <StatCard 
        title="Objave" 
        value={10} 
        className="custom-class"
        icon={Megaphone}
      />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });
});
