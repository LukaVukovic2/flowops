/**
 * ExternalServiceStatusWidget Component Tests
 * Tests for external service status display
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExternalServiceStatusWidget from './ExternalServiceStatusWidget';

describe('ExternalServiceStatusWidget', () => {
  it('renders nothing when no services provided', () => {
    const { container } = render(<ExternalServiceStatusWidget services={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when services is null', () => {
    const { container } = render(<ExternalServiceStatusWidget services={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders service list with operational status', () => {
    const services = [
      {
        name: 'GitHub Status',
        status: 'operational',
        lastChecked: new Date().toISOString()
      }
    ];

    render(<ExternalServiceStatusWidget services={services} />);

    expect(screen.getByText('Status vanjskih servisa')).toBeInTheDocument();
    expect(screen.getByText('GitHub Status')).toBeInTheDocument();
    expect(screen.getByText('Operativno')).toBeInTheDocument();
  });

  it('renders degraded status correctly', () => {
    const services = [
      {
        name: 'API Service',
        status: 'degraded',
        lastChecked: new Date().toISOString()
      }
    ];

    render(<ExternalServiceStatusWidget services={services} />);

    expect(screen.getByText('API Service')).toBeInTheDocument();
    expect(screen.getByText('Smanjena funkcionalnost')).toBeInTheDocument();
  });

  it('renders down status correctly', () => {
    const services = [
      {
        name: 'Database',
        status: 'down',
        lastChecked: new Date().toISOString()
      }
    ];

    render(<ExternalServiceStatusWidget services={services} />);

    expect(screen.getByText('Database')).toBeInTheDocument();
    expect(screen.getByText('Nedostupno')).toBeInTheDocument();
  });

  it('renders multiple services', () => {
    const services = [
      {
        name: 'GitHub Status',
        status: 'operational',
        lastChecked: new Date().toISOString()
      },
      {
        name: 'API Service',
        status: 'degraded',
        lastChecked: new Date().toISOString()
      },
      {
        name: 'Database',
        status: 'down',
        lastChecked: new Date().toISOString()
      }
    ];

    render(<ExternalServiceStatusWidget services={services} />);

    expect(screen.getByText('GitHub Status')).toBeInTheDocument();
    expect(screen.getByText('API Service')).toBeInTheDocument();
    expect(screen.getByText('Database')).toBeInTheDocument();
  });

  it('displays last checked time', () => {
    const services = [
      {
        name: 'GitHub Status',
        status: 'operational',
        lastChecked: new Date().toISOString()
      }
    ];

    render(<ExternalServiceStatusWidget services={services} />);

    expect(screen.getByText('Provjereno:')).toBeInTheDocument();
  });

  it('handles unknown status', () => {
    const services = [
      {
        name: 'Unknown Service',
        status: 'unknown',
        lastChecked: new Date().toISOString()
      }
    ];

    render(<ExternalServiceStatusWidget services={services} />);

    expect(screen.getByText('Unknown Service')).toBeInTheDocument();
    expect(screen.getByText('Nepoznato')).toBeInTheDocument();
  });

  it('handles missing lastChecked timestamp', () => {
    const services = [
      {
        name: 'GitHub Status',
        status: 'operational',
        lastChecked: null
      }
    ];

    render(<ExternalServiceStatusWidget services={services} />);

    expect(screen.getByText('GitHub Status')).toBeInTheDocument();
  });

  it('displays footer note about auto-refresh', () => {
    const services = [
      {
        name: 'GitHub Status',
        status: 'operational',
        lastChecked: new Date().toISOString()
      }
    ];

    render(<ExternalServiceStatusWidget services={services} />);

    expect(
      screen.getByText('Status vanjskih servisa se automatski ažurira svakih 5 minuta')
    ).toBeInTheDocument();
  });

  it('renders with case-insensitive status matching', () => {
    const services = [
      {
        name: 'Service 1',
        status: 'OPERATIONAL',
        lastChecked: new Date().toISOString()
      },
      {
        name: 'Service 2',
        status: 'DEGRADED',
        lastChecked: new Date().toISOString()
      }
    ];

    render(<ExternalServiceStatusWidget services={services} />);

    expect(screen.getByText('Service 1')).toBeInTheDocument();
    expect(screen.getByText('Service 2')).toBeInTheDocument();
  });
});
