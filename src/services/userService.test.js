/**
 * User Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as userService from './userService.js';
import apiClient from './api.js';

// Mock the API client
vi.mock('./api.js', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUsers', () => {
    it('fetches users with default parameters', async () => {
      const mockUsers = {
        users: [
          { id: '1', email: 'user1@example.com', role: 'Registrirani_Korisnik' },
          { id: '2', email: 'user2@example.com', role: 'Tehničar' },
        ],
      };

      apiClient.get.mockResolvedValueOnce({ data: mockUsers });

      const result = await userService.getUsers();

      expect(apiClient.get).toHaveBeenCalledWith('/users', { params: {} });
      expect(result).toEqual(mockUsers);
    });

    it('fetches users with query parameters', async () => {
      const params = { page: 1, limit: 10, role: 'Administrator' };
      apiClient.get.mockResolvedValueOnce({ data: { users: [] } });

      await userService.getUsers(params);

      expect(apiClient.get).toHaveBeenCalledWith('/users', { params });
    });
  });

  describe('getUserById', () => {
    it('fetches user by ID', async () => {
      const mockUser = { id: '123', email: 'user@example.com' };
      apiClient.get.mockResolvedValueOnce({ data: mockUser });

      const result = await userService.getUserById('123');

      expect(apiClient.get).toHaveBeenCalledWith('/users/123');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUserRole', () => {
    it('updates user role', async () => {
      const mockUser = { id: '123', role: 'Administrator' };
      apiClient.patch.mockResolvedValueOnce({ data: mockUser });

      const result = await userService.updateUserRole('123', 'Administrator');

      expect(apiClient.patch).toHaveBeenCalledWith('/users/123/role', {
        role: 'Administrator',
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('deactivateUser', () => {
    it('deactivates user', async () => {
      const mockUser = { id: '123', isActive: false };
      apiClient.patch.mockResolvedValueOnce({ data: mockUser });

      const result = await userService.deactivateUser('123');

      expect(apiClient.patch).toHaveBeenCalledWith('/users/123/deactivate');
      expect(result).toEqual(mockUser);
    });
  });

  describe('activateUser', () => {
    it('activates user', async () => {
      const mockUser = { id: '123', isActive: true };
      apiClient.patch.mockResolvedValueOnce({ data: mockUser });

      const result = await userService.activateUser('123');

      expect(apiClient.patch).toHaveBeenCalledWith('/users/123/activate');
      expect(result).toEqual(mockUser);
    });
  });
});
