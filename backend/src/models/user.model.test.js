/**
 * User Model Tests
 * Basic tests for user model functions
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as userModel from './user.model.js';

describe('User Model', () => {
  describe('getUserById', () => {
    it('should return null for non-existent user', async () => {
      const user = await userModel.getUserById('00000000-0000-0000-0000-000000000000');
      assert.strictEqual(user, null);
    });
  });

  describe('countAdministrators', () => {
    it('should return a number', async () => {
      const count = await userModel.countAdministrators();
      assert.strictEqual(typeof count, 'number');
      assert.ok(count >= 0);
    });
  });

  describe('getUsers', () => {
    it('should return users with pagination structure', async () => {
      const result = await userModel.getUsers({ page: 1, limit: 10 });
      
      assert.ok(result.users);
      assert.ok(Array.isArray(result.users));
      assert.ok(result.pagination);
      assert.strictEqual(typeof result.pagination.page, 'number');
      assert.strictEqual(typeof result.pagination.limit, 'number');
      assert.strictEqual(typeof result.pagination.total, 'number');
      assert.strictEqual(typeof result.pagination.totalPages, 'number');
    });

    it('should filter by role when provided', async () => {
      const result = await userModel.getUsers({ role: 'Administrator', page: 1, limit: 10 });
      
      // All returned users should be Administrators
      result.users.forEach(user => {
        assert.strictEqual(user.role, 'Administrator');
      });
    });

    it('should filter by isActive when provided', async () => {
      const result = await userModel.getUsers({ isActive: true, page: 1, limit: 10 });
      
      // All returned users should be active
      result.users.forEach(user => {
        assert.strictEqual(user.is_active, true);
      });
    });
  });
});
