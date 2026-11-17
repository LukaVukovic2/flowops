/**
 * useAuth Hook Tests
 * Tests for useAuth custom hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from './useAuth.js';
import { AuthProvider } from '../context/AuthContext.jsx';

describe('useAuth', () => {
  it('should throw error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    console.error = originalError;
  });

  it('should return auth context when used within AuthProvider', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('role');
    expect(result.current).toHaveProperty('isAuthenticated');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('logout');
    expect(result.current).toHaveProperty('register');
    expect(result.current).toHaveProperty('clearError');
    expect(result.current).toHaveProperty('refreshUser');
  });

  it('should have correct initial state', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
