/**
 * Input Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Input from './Input';

describe('Input Component', () => {
  it('renders input field with label', () => {
    render(
      <Input
        label="Email adresa"
        name="email"
        type="email"
      />
    );

    expect(screen.getByLabelText('Email adresa')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays required indicator when required prop is true', () => {
    render(
      <Input
        label="Email adresa"
        name="email"
        required
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error message when error prop is provided', () => {
    const errorMessage = 'Email je obavezan';
    render(
      <Input
        label="Email adresa"
        name="email"
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('applies error styling when error exists', () => {
    render(
      <Input
        label="Email adresa"
        name="email"
        error="Email je obavezan"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('disables input when disabled prop is true', () => {
    render(
      <Input
        label="Email adresa"
        name="email"
        disabled
      />
    );

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders with placeholder text', () => {
    render(
      <Input
        label="Email adresa"
        name="email"
        placeholder="ime@primjer.com"
      />
    );

    expect(screen.getByPlaceholderText('ime@primjer.com')).toBeInTheDocument();
  });

  it('renders password input type correctly', () => {
    render(
      <Input
        label="Lozinka"
        name="password"
        type="password"
      />
    );

    const input = screen.getByLabelText('Lozinka');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders without label when label prop is not provided', () => {
    render(
      <Input
        name="email"
        placeholder="Enter email"
      />
    );

    expect(screen.queryByRole('label')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });
});
