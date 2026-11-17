/**
 * RoleRoute Component Tests
 * Tests authentication, role checking, and authorization behavior
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RoleRoute } from './RoleRoute.jsx';
import * as useAuthModule from '../hooks/useAuth.js';

// Mock the useAuth hook
vi.mock('../hooks/useAuth.js', () => ({
  useAuth: vi.fn(),
}));

describe('RoleRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner when authentication is loading', () => {
    useAuthModule.useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });

    render(
      <MemoryRouter>
        <RoleRoute allowedRoles="Administrator">
          <div>Admin Content</div>
        </RoleRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Učitavanje...')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    useAuthModule.useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/admin"
            element={
              <RoleRoute allowedRoles="Administrator">
                <div>Admin Content</div>
              </RoleRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // Should navigate to login
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should render children when user has required role', () => {
    useAuthModule.useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', role: 'Administrator', email: 'admin@test.com' },
    });

    render(
      <MemoryRouter>
        <RoleRoute allowedRoles="Administrator">
          <div>Admin Content</div>
        </RoleRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('should display Croatian error when user lacks required role', () => {
    useAuthModule.useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', role: 'Registrirani_Korisnik', email: 'user@test.com' },
    });

    render(
      <MemoryRouter>
        <RoleRoute allowedRoles="Administrator">
          <div>Admin Content</div>
        </RoleRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Nemate pristup')).toBeInTheDocument();
    expect(screen.getByText(/Nemate potrebne dozvole/i)).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should accept single role as string', () => {
    useAuthModule.useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', role: 'Tehničar', email: 'tech@test.com' },
    });

    render(
      <MemoryRouter>
        <RoleRoute allowedRoles="Tehničar">
          <div>Technician Content</div>
        </RoleRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Technician Content')).toBeInTheDocument();
  });

  it('should accept multiple roles as array', () => {
    useAuthModule.useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', role: 'Tehničar', email: 'tech@test.com' },
    });

    render(
      <MemoryRouter>
        <RoleRoute allowedRoles={['Tehničar', 'Administrator']}>
          <div>Multi-Role Content</div>
        </RoleRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Multi-Role Content')).toBeInTheDocument();
  });

  it('should render children when user has one of multiple allowed roles', () => {
    useAuthModule.useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', role: 'Administrator', email: 'admin@test.com' },
    });

    render(
      <MemoryRouter>
        <RoleRoute allowedRoles={['Tehničar', 'Administrator']}>
          <div>Multi-Role Content</div>
        </RoleRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Multi-Role Content')).toBeInTheDocument();
  });

  it('should show error when user has none of multiple allowed roles', () => {
    useAuthModule.useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', role: 'Registrirani_Korisnik', email: 'user@test.com' },
    });

    render(
      <MemoryRouter>
        <RoleRoute allowedRoles={['Tehničar', 'Administrator']}>
          <div>Multi-Role Content</div>
        </RoleRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Nemate pristup')).toBeInTheDocument();
    expect(screen.queryByText('Multi-Role Content')).not.toBeInTheDocument();
  });

  it('should display required and actual role in error message', () => {
    useAuthModule.useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', role: 'Registrirani_Korisnik', email: 'user@test.com' },
    });

    render(
      <MemoryRouter>
        <RoleRoute allowedRoles="Administrator">
          <div>Admin Content</div>
        </RoleRoute>
      </MemoryRouter>
    );

    expect(screen.getByText(/Potrebna uloga: Administrator/i)).toBeInTheDocument();
    expect(screen.getByText(/Vaša uloga: Registrirani_Korisnik/i)).toBeInTheDocument();
  });

  it('should display back button in error view', () => {
    useAuthModule.useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', role: 'Registrirani_Korisnik', email: 'user@test.com' },
    });

    render(
      <MemoryRouter>
        <RoleRoute allowedRoles="Administrator">
          <div>Admin Content</div>
        </RoleRoute>
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /natrag/i })).toBeInTheDocument();
  });

  it('should handle user without role gracefully', () => {
    useAuthModule.useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', email: 'user@test.com' }, // No role property
    });

    render(
      <MemoryRouter>
        <RoleRoute allowedRoles="Administrator">
          <div>Admin Content</div>
        </RoleRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Nemate pristup')).toBeInTheDocument();
    expect(screen.getByText(/Vaša uloga: Nepoznata/i)).toBeInTheDocument();
  });
});
