/**
 * AuthContext Tests
 * Tests for authentication context and provider
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider } from './AuthContext.jsx';
import { useAuth } from '../hooks/useAuth.js';
import * as authService from '../services/authService.js';

// Mock authService
vi.mock('../services/authService.js', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
  getToken: vi.fn(),
  getUser: vi.fn(),
  setToken: vi.fn(),
  setUser: vi.fn(),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

  describe('initialization', () => {
    it('should initialize with no user when no token exists', async () => {
      authService.getToken.mockReturnValue(null);
      authService.getUser.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should initialize with user when valid token exists', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        role: 'Registrirani_Korisnik',
      };

      authService.getToken.mockReturnValue('mock-token');
      authService.getUser.mockReturnValue(mockUser);
      authService.getCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear state when token validation fails', async () => {
      authService.getToken.mockReturnValue('invalid-token');
      authService.getUser.mockReturnValue({ id: '123' });
      authService.getCurrentUser.mockRejectedValue(new Error('Invalid token'));
      authService.logout.mockResolvedValue();

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('should successfully login user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        role: 'Registrirani_Korisnik',
      };

      const mockLoginResponse = {
        user: mockUser,
        token: 'mock-token',
      };

      authService.getToken.mockReturnValue(null);
      authService.getUser.mockReturnValue(null);
      authService.login.mockResolvedValue(mockLoginResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(authService.setToken).toHaveBeenCalledWith('mock-token');
      expect(authService.setUser).toHaveBeenCalledWith(mockUser);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle login errors', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Neispravne vjerodajnice',
          },
        },
      };

      authService.getToken.mockReturnValue(null);
      authService.getUser.mockReturnValue(null);
      authService.login.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let caughtError;
      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrongpassword');
        } catch (e) {
          caughtError = e;
        }
      });

      expect(caughtError).toEqual(mockError);
      
      await waitFor(() => {
        expect(result.current.error).toBe('Neispravne vjerodajnice');
      });
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('register', () => {
    it('should successfully register user', async () => {
      const mockUser = {
        id: '123',
        email: 'newuser@example.com',
        role: 'Registrirani_Korisnik',
      };

      const mockRegisterResponse = {
        user: mockUser,
        token: 'mock-token',
      };

      authService.getToken.mockReturnValue(null);
      authService.getUser.mockReturnValue(null);
      authService.register.mockResolvedValue(mockRegisterResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'New',
        lastName: 'User',
      };

      await act(async () => {
        await result.current.register(userData);
      });

      expect(authService.register).toHaveBeenCalledWith(userData);
      expect(authService.setToken).toHaveBeenCalledWith('mock-token');
      expect(authService.setUser).toHaveBeenCalledWith(mockUser);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle registration errors', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Korisnik već postoji',
          },
        },
      };

      authService.getToken.mockReturnValue(null);
      authService.getUser.mockReturnValue(null);
      authService.register.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let caughtError;
      await act(async () => {
        try {
          await result.current.register({
            email: 'existing@example.com',
            password: 'SecurePass123!',
          });
        } catch (e) {
          caughtError = e;
        }
      });

      expect(caughtError).toEqual(mockError);
      
      await waitFor(() => {
        expect(result.current.error).toBe('Korisnik već postoji');
      });
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        role: 'Registrirani_Korisnik',
      };

      authService.getToken.mockReturnValue('mock-token');
      authService.getUser.mockReturnValue(mockUser);
      authService.getCurrentUser.mockResolvedValue(mockUser);
      authService.logout.mockResolvedValue();

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(authService.logout).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('token expiry', () => {
    it('should handle token expiry event', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        role: 'Registrirani_Korisnik',
      };

      authService.getToken.mockReturnValue('mock-token');
      authService.getUser.mockReturnValue(mockUser);
      authService.getCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      // Simulate token expiry event
      act(() => {
        window.dispatchEvent(new CustomEvent('auth:token-expired'));
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.error).toBe('Vaša sesija je istekla. Molimo prijavite se ponovno.');
      });
    });
  });

  describe('refreshUser', () => {
    it('should refresh user data from server', async () => {
      const initialUser = {
        id: '123',
        email: 'test@example.com',
        role: 'Registrirani_Korisnik',
      };

      const updatedUser = {
        ...initialUser,
        firstName: 'Updated',
        lastName: 'Name',
      };

      authService.getToken.mockReturnValue('mock-token');
      authService.getUser.mockReturnValue(initialUser);
      authService.getCurrentUser
        .mockResolvedValueOnce(initialUser)
        .mockResolvedValueOnce(updatedUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(initialUser);
      });

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(result.current.user).toEqual(updatedUser);
      expect(authService.setUser).toHaveBeenCalledWith(updatedUser);
    });
  });

  describe('clearError', () => {
    it('should clear error message', async () => {
      authService.getToken.mockReturnValue(null);
      authService.getUser.mockReturnValue(null);
      authService.login.mockRejectedValue({
        response: { data: { message: 'Error message' } },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrong');
        } catch (e) {
          // Expected error
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Error message');
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
