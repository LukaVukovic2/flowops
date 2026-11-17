/**
 * Authentication Context
 * Manages global authentication state and provides auth operations
 * Requirements: 1.1, 1.4, 11.11
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService.js';

export const AuthContext = createContext(null);

/**
 * AuthProvider component
 * Wraps the application and provides authentication context
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Initialize auth state from localStorage on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        const storedUser = authService.getUser();

        if (token && storedUser) {
          // Verify token is still valid by fetching current user
          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            setIsAuthenticated(true);
          } catch (error) {
            // Token is invalid or expired
            console.warn('Token validation failed:', error);
            await logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError('Greška pri inicijalizaciji autentifikacije');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Listen for token expiry events from API interceptor
   */
  useEffect(() => {
    const handleTokenExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
      setError('Vaša sesija je istekla. Molimo prijavite se ponovno.');
    };

    window.addEventListener('auth:token-expired', handleTokenExpired);

    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired);
    };
  }, []);

  /**
   * Login function
   * @param {string} email - User email
   * @param {string} password - User password
   */
  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);

      const { user: userData, token } = await authService.login(email, password);

      // Store token and user in localStorage
      authService.setToken(token);
      authService.setUser(userData);

      // Update state
      setUser(userData);
      setIsAuthenticated(true);

      return userData;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Greška pri prijavi';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register function
   * @param {Object} userData - Registration data (email, password, firstName, lastName)
   */
  const register = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      setError(null);

      const { user: newUser, token } = await authService.register(userData);

      // Store token and user in localStorage
      authService.setToken(token);
      authService.setUser(newUser);

      // Update state
      setUser(newUser);
      setIsAuthenticated(true);

      return newUser;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Greška pri registraciji';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await authService.logout();

      // Update state
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh user data from server
   */
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      authService.setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error('Refresh user error:', error);
      throw error;
    }
  }, []);

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    clearError,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
