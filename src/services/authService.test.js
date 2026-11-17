/**
 * Authentication Service Tests
 * Tests for authService functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as authService from './authService.js';
import apiClient from './api.js';

// Mock the API client
vi.mock('./api.js', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return user data and token', async () => {
      const mockResponse = {
        data: {
          user: {
            id: '123',
            email: 'test@example.com',
            role: 'Registrirani_Korisnik',
            firstName: 'Test',
            lastName: 'User',
          },
          token: 'mock-jwt-token',
        },
      };

      apiClient.post.mockResolvedValueOnce(mockResponse);

      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const result = await authService.register(userData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse.data);
      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw error on registration failure', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Korisnik već postoji',
          },
        },
      };

      apiClient.post.mockRejectedValueOnce(mockError);

      await expect(
        authService.register({
          email: 'existing@example.com',
          password: 'SecurePass123!',
        })
      ).rejects.toEqual(mockError);
    });
  });

  describe('login', () => {
    it('should authenticate user and return user data and token', async () => {
      const mockResponse = {
        data: {
          user: {
            id: '123',
            email: 'test@example.com',
            role: 'Registrirani_Korisnik',
          },
          token: 'mock-jwt-token',
        },
      };

      apiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.login('test@example.com', 'SecurePass123!');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'SecurePass123!',
      });
      expect(result).toEqual(mockResponse.data);
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should throw error on invalid credentials', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Neispravna e-mail adresa ili lozinka',
          },
        },
      };

      apiClient.post.mockRejectedValueOnce(mockError);

      await expect(
        authService.login('wrong@example.com', 'wrongpassword')
      ).rejects.toEqual(mockError);
    });
  });

  describe('logout', () => {
    it('should call logout endpoint and clear localStorage', async () => {
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: '123' }));

      apiClient.post.mockResolvedValueOnce({ data: { message: 'Success' } });

      await authService.logout();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('should clear localStorage even if API call fails', async () => {
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: '123' }));

      apiClient.post.mockRejectedValueOnce(new Error('Network error'));

      await authService.logout();

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should fetch current user profile', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        role: 'Registrirani_Korisnik',
        firstName: 'Test',
        lastName: 'User',
      };

      apiClient.get.mockResolvedValueOnce({ data: mockUser });

      const result = await authService.getCurrentUser();

      expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('authToken', 'mock-token');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false when token does not exist', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('token management', () => {
    it('should store and retrieve token', () => {
      authService.setToken('test-token');
      expect(authService.getToken()).toBe('test-token');
      expect(localStorage.getItem('authToken')).toBe('test-token');
    });

    it('should return null when no token stored', () => {
      expect(authService.getToken()).toBeNull();
    });
  });

  describe('user management', () => {
    it('should store and retrieve user data', () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        role: 'Registrirani_Korisnik',
      };

      authService.setUser(mockUser);
      const retrievedUser = authService.getUser();

      expect(retrievedUser).toEqual(mockUser);
      expect(JSON.parse(localStorage.getItem('user'))).toEqual(mockUser);
    });

    it('should return null when no user stored', () => {
      expect(authService.getUser()).toBeNull();
    });
  });
});
