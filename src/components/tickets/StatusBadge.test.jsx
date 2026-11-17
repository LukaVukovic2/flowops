/**
 * StatusBadge Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge Component', () => {
  describe('Status badges', () => {
    it('renders Nova status badge', () => {
      render(<StatusBadge status="Nova" />);
      expect(screen.getByText('Nova')).toBeInTheDocument();
      expect(screen.getByText('Nova')).toHaveClass('text-blue-300');
    });

    it('renders U radu status badge', () => {
      render(<StatusBadge status="U radu" />);
      expect(screen.getByText('U radu')).toBeInTheDocument();
      expect(screen.getByText('U radu')).toHaveClass('text-yellow-300');
    });

    it('renders Na čekanju status badge', () => {
      render(<StatusBadge status="Na čekanju" />);
      expect(screen.getByText('Na čekanju')).toBeInTheDocument();
      expect(screen.getByText('Na čekanju')).toHaveClass('text-orange-300');
    });

    it('renders Riješena status badge', () => {
      render(<StatusBadge status="Riješena" />);
      expect(screen.getByText('Riješena')).toBeInTheDocument();
      expect(screen.getByText('Riješena')).toHaveClass('text-green-300');
    });

    it('renders Zatvorena status badge', () => {
      render(<StatusBadge status="Zatvorena" />);
      expect(screen.getByText('Zatvorena')).toBeInTheDocument();
      expect(screen.getByText('Zatvorena')).toHaveClass('text-gray-300');
    });
  });

  describe('Priority badges', () => {
    it('renders Niska priority badge', () => {
      render(<StatusBadge priority="Niska" type="priority" />);
      expect(screen.getByText('Niska')).toBeInTheDocument();
      expect(screen.getByText('Niska')).toHaveClass('text-gray-300');
    });

    it('renders Srednja priority badge', () => {
      render(<StatusBadge priority="Srednja" type="priority" />);
      expect(screen.getByText('Srednja')).toBeInTheDocument();
      expect(screen.getByText('Srednja')).toHaveClass('text-blue-300');
    });

    it('renders Visoka priority badge', () => {
      render(<StatusBadge priority="Visoka" type="priority" />);
      expect(screen.getByText('Visoka')).toBeInTheDocument();
      expect(screen.getByText('Visoka')).toHaveClass('text-orange-300');
    });

    it('renders Hitna priority badge', () => {
      render(<StatusBadge priority="Hitna" type="priority" />);
      expect(screen.getByText('Hitna')).toBeInTheDocument();
      expect(screen.getByText('Hitna')).toHaveClass('text-red-300');
    });
  });

  describe('Fallback behavior', () => {
    it('renders unknown status with default styling', () => {
      render(<StatusBadge status="UnknownStatus" />);
      expect(screen.getByText('UnknownStatus')).toBeInTheDocument();
      expect(screen.getByText('UnknownStatus')).toHaveClass('text-gray-300');
    });

    it('renders unknown priority with default styling', () => {
      render(<StatusBadge priority="UnknownPriority" type="priority" />);
      expect(screen.getByText('UnknownPriority')).toBeInTheDocument();
      expect(screen.getByText('UnknownPriority')).toHaveClass('text-gray-300');
    });
  });

  describe('Badge styling', () => {
    it('applies common badge classes', () => {
      render(<StatusBadge status="Nova" />);
      const badge = screen.getByText('Nova');
      expect(badge).toHaveClass('inline-flex');
      expect(badge).toHaveClass('items-center');
      expect(badge).toHaveClass('px-2.5');
      expect(badge).toHaveClass('py-0.5');
      expect(badge).toHaveClass('rounded-full');
      expect(badge).toHaveClass('text-xs');
      expect(badge).toHaveClass('font-medium');
      expect(badge).toHaveClass('border');
    });
  });
});
