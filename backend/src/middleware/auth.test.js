/**
 * Unit tests for authentication middleware
 * Tests JWT verification middleware and role-based access control
 */

import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import {
  authMiddleware,
  optionalAuthMiddleware,
  requireRole,
  requireOwnership,
  requireOwnershipOr
} from './auth.js';
import { generateToken } from '../utils/jwt.js';

describe('Authentication Middleware', () => {
  let validToken;
  let validPayload;
  let req;
  let res;
  let next;

  beforeEach(() => {
    // Setup valid token and payload
    validPayload = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      role: 'Registrirani_Korisnik'
    };
    validToken = generateToken(validPayload);

    // Mock request, response, and next
    req = {
      headers: {},
      params: {},
      user: null,
      tokenMeta: null
    };

    res = {
      status: mock.fn(function(code) {
        this.statusCode = code;
        return this;
      }),
      json: mock.fn(function(data) {
        this.body = data;
        return this;
      }),
      statusCode: null,
      body: null
    };

    next = mock.fn();
  });

  describe('authMiddleware', () => {
    it('should authenticate valid token and attach user to request', () => {
      req.headers.authorization = `Bearer ${validToken}`;

      authMiddleware(req, res, next);

      assert.ok(next.mock.calls.length === 1, 'next() should be called once');
      assert.ok(req.user, 'req.user should be set');
      assert.strictEqual(req.user.userId, validPayload.userId);
      assert.strictEqual(req.user.email, validPayload.email);
      assert.strictEqual(req.user.role, validPayload.role);
    });

    it('should attach token metadata to request', () => {
      req.headers.authorization = `Bearer ${validToken}`;

      authMiddleware(req, res, next);

      assert.ok(req.tokenMeta, 'req.tokenMeta should be set');
      assert.ok(req.tokenMeta.issuedAt, 'Should have issuedAt timestamp');
      assert.ok(req.tokenMeta.expiresAt, 'Should have expiresAt timestamp');
    });

    it('should handle lowercase authorization header', () => {
      req.headers.authorization = `Bearer ${validToken}`;

      authMiddleware(req, res, next);

      assert.ok(next.mock.calls.length === 1, 'next() should be called');
      assert.ok(req.user, 'req.user should be set');
    });

    it('should handle Authorization header (uppercase)', () => {
      req.headers.Authorization = `Bearer ${validToken}`;

      authMiddleware(req, res, next);

      assert.ok(next.mock.calls.length === 1, 'next() should be called');
      assert.ok(req.user, 'req.user should be set');
    });

    it('should return 401 when Authorization header is missing', () => {
      authMiddleware(req, res, next);

      assert.strictEqual(next.mock.calls.length, 0, 'next() should not be called');
      assert.strictEqual(res.statusCode, 401);
      assert.ok(res.body.error, 'Should have error message');
      assert.ok(res.body.message.includes('Authorization header'));
    });

    it('should return 401 when token is missing from header', () => {
      req.headers.authorization = 'Bearer';

      authMiddleware(req, res, next);

      assert.strictEqual(next.mock.calls.length, 0, 'next() should not be called');
      assert.strictEqual(res.statusCode, 401);
      assert.ok(res.body.message.includes('format'));
    });

    it('should return 401 when Bearer prefix is missing', () => {
      req.headers.authorization = validToken;

      authMiddleware(req, res, next);

      assert.strictEqual(next.mock.calls.length, 0, 'next() should not be called');
      assert.strictEqual(res.statusCode, 401);
    });

    it('should return 401 for invalid token', () => {
      req.headers.authorization = 'Bearer invalid.token.here';

      authMiddleware(req, res, next);

      assert.strictEqual(next.mock.calls.length, 0, 'next() should not be called');
      assert.strictEqual(res.statusCode, 401);
      assert.ok(res.body.error, 'Should have error message');
    });

    it('should return 401 for tampered token', () => {
      const parts = validToken.split('.');
      const tamperedToken = parts[0] + '.tampered.' + parts[2];
      req.headers.authorization = `Bearer ${tamperedToken}`;

      authMiddleware(req, res, next);

      assert.strictEqual(next.mock.calls.length, 0, 'next() should not be called');
      assert.strictEqual(res.statusCode, 401);
    });

    it('should provide Croatian error messages', () => {
      authMiddleware(req, res, next);

      assert.ok(res.body.error.includes('Neautorizirani'), 
        'Error should be in Croatian');
    });

    it('should handle all valid roles', () => {
      const roles = ['Posjetitelj', 'Registrirani_Korisnik', 'Tehničar', 'Administrator'];

      roles.forEach(role => {
        const payload = { ...validPayload, role };
        const token = generateToken(payload);
        
        const freshReq = { headers: { authorization: `Bearer ${token}` } };
        const freshRes = {
          status: mock.fn(function(code) { this.statusCode = code; return this; }),
          json: mock.fn(function(data) { this.body = data; return this; })
        };
        const freshNext = mock.fn();

        authMiddleware(freshReq, freshRes, freshNext);

        assert.ok(freshNext.mock.calls.length === 1, `Should authenticate ${role}`);
        assert.strictEqual(freshReq.user.role, role);
      });
    });
  });

  describe('optionalAuthMiddleware', () => {
    it('should attach user when valid token is provided', () => {
      req.headers.authorization = `Bearer ${validToken}`;

      optionalAuthMiddleware(req, res, next);

      assert.ok(next.mock.calls.length === 1, 'next() should be called');
      assert.ok(req.user, 'req.user should be set');
      assert.strictEqual(req.user.userId, validPayload.userId);
    });

    it('should set user to null when no token is provided', () => {
      optionalAuthMiddleware(req, res, next);

      assert.ok(next.mock.calls.length === 1, 'next() should be called');
      assert.strictEqual(req.user, null, 'req.user should be null');
    });

    it('should set user to null for invalid token', () => {
      req.headers.authorization = 'Bearer invalid.token';

      optionalAuthMiddleware(req, res, next);

      assert.ok(next.mock.calls.length === 1, 'next() should be called');
      assert.strictEqual(req.user, null, 'req.user should be null for invalid token');
    });

    it('should continue without error for malformed header', () => {
      req.headers.authorization = 'not-a-bearer-token';

      optionalAuthMiddleware(req, res, next);

      assert.ok(next.mock.calls.length === 1, 'next() should be called');
      assert.strictEqual(req.user, null);
    });

    it('should not call res.status or res.json', () => {
      optionalAuthMiddleware(req, res, next);

      assert.strictEqual(res.status.mock.calls.length, 0, 
        'res.status should not be called');
      assert.strictEqual(res.json.mock.calls.length, 0, 
        'res.json should not be called');
    });
  });

  describe('requireRole', () => {
    beforeEach(() => {
      req.user = {
        userId: validPayload.userId,
        email: validPayload.email,
        role: 'Registrirani_Korisnik'
      };
    });

    it('should allow access when user has required role', () => {
      const middleware = requireRole('Registrirani_Korisnik');
      middleware(req, res, next);

      assert.ok(next.mock.calls.length === 1, 'next() should be called');
      assert.strictEqual(res.status.mock.calls.length, 0, 
        'res.status should not be called');
    });

    it('should allow access when user has one of multiple allowed roles', () => {
      const middleware = requireRole('Tehničar', 'Registrirani_Korisnik', 'Administrator');
      middleware(req, res, next);

      assert.ok(next.mock.calls.length === 1, 'next() should be called');
    });

    it('should deny access when user does not have required role', () => {
      const middleware = requireRole('Administrator');
      middleware(req, res, next);

      assert.strictEqual(next.mock.calls.length, 0, 'next() should not be called');
      assert.strictEqual(res.statusCode, 403);
      assert.ok(res.body.error.includes('Zabranjen'));
    });

    it('should return 401 when user is not authenticated', () => {
      req.user = null;
      const middleware = requireRole('Registrirani_Korisnik');
      middleware(req, res, next);

      assert.strictEqual(next.mock.calls.length, 0, 'next() should not be called');
      assert.strictEqual(res.statusCode, 401);
    });

    it('should return 401 when user has no role', () => {
      req.user = { userId: '123', email: 'test@test.com' };
      const middleware = requireRole('Registrirani_Korisnik');
      middleware(req, res, next);

      assert.strictEqual(next.mock.calls.length, 0, 'next() should not be called');
      assert.strictEqual(res.statusCode, 401);
    });

    it('should handle Administrator role', () => {
      req.user.role = 'Administrator';
      const middleware = requireRole('Administrator');
      middleware(req, res, next);

      assert.ok(next.mock.calls.length === 1, 'next() should be called');
    });

    it('should handle Tehničar role', () => {
      req.user.role = 'Tehničar';
      const middleware = requireRole('Tehničar');
      middleware(req, res, next);

      assert.ok(next.mock.calls.length === 1, 'next() should be called');
    });
  });

  describe('requireOwnership', () => {
    beforeEach(() => {
      req.user = {
        userId: 'user-123',
        email: 'owner@test.com',
        role: 'Registrirani_Korisnik'
      };
      req.params = {
        userId: 'user-123'
      };
    });

    it('should allow access when user owns the resource', () => {
      const middleware = requireOwnership('userId');
      middleware(req, res, next);

      assert.ok(next.mock.calls.length === 1, 'next() should be called');
      assert.strictEqual(res.status.mock.calls.length, 0);
    });

    it('should deny access when user does not own the resource', () => {
      req.params.userId = 'different-user-456';
      const middleware = requireOwnership('userId');
      middleware(req, res, next);

      assert.strictEqual(next.mock.calls.length, 0, 'next() should not be called');
      assert.strictEqual(res.statusCode, 403);
      assert.ok(res.body.message.includes('vlastitim'));
    });

    it('should return 401 when user is not authenticated', () => {
      req.user = null;
      const middleware = requireOwnership('userId');
      middleware(req, res, next);

      assert.strictEqual(next.mock.calls.length, 0);
      assert.strictEqual(res.statusCode, 401);
    });

    it('should use default parameter name "userId"', () => {
      req.params = { userId: 'user-123' };
      const middleware = requireOwnership();
      middleware(req, res, next);

      assert.ok(next.mock.calls.length === 1, 'next() should be called with default param');
    });

    it('should handle custom parameter names', () => {
      req.params = { creatorId: 'user-123' };
      const middleware = requireOwnership('creatorId');
      middleware(req, res, next);

      assert.ok(next.mock.calls.length === 1, 'next() should be called');
    });
  });

  describe('requireOwnershipOr', () => {
    beforeEach(() => {
      req.user = {
        userId: 'user-123',
        email: 'user@test.com',
        role: 'Registrirani_Korisnik'
      };
      req.params = {
        creatorId: 'user-123'
      };
    });

    it('should allow access when user owns the resource', () => {
      const middleware = requireOwnershipOr('creatorId', 'Administrator');
      middleware(req, res, next);

      assert.ok(next.mock.calls.length === 1, 'next() should be called');
    });

    it('should allow access when user has elevated role', () => {
      req.params.creatorId = 'different-user';
      req.user.role = 'Administrator';
      const middleware = requireOwnershipOr('creatorId', 'Administrator');
      middleware(req, res, next);

      assert.ok(next.mock.calls.length === 1, 'next() should be called');
    });

    it('should allow access for Tehničar elevated role', () => {
      req.params.creatorId = 'different-user';
      req.user.role = 'Tehničar';
      const middleware = requireOwnershipOr('creatorId', 'Tehničar', 'Administrator');
      middleware(req, res, next);

      assert.ok(next.mock.calls.length === 1, 'next() should be called');
    });

    it('should deny access when user is not owner and has no elevated role', () => {
      req.params.creatorId = 'different-user';
      const middleware = requireOwnershipOr('creatorId', 'Administrator');
      middleware(req, res, next);

      assert.strictEqual(next.mock.calls.length, 0, 'next() should not be called');
      assert.strictEqual(res.statusCode, 403);
    });

    it('should return 401 when user is not authenticated', () => {
      req.user = null;
      const middleware = requireOwnershipOr('creatorId', 'Administrator');
      middleware(req, res, next);

      assert.strictEqual(next.mock.calls.length, 0);
      assert.strictEqual(res.statusCode, 401);
    });

    it('should handle multiple elevated roles', () => {
      req.params.creatorId = 'different-user';
      req.user.role = 'Tehničar';
      const middleware = requireOwnershipOr('creatorId', 'Tehničar', 'Administrator');
      middleware(req, res, next);

      assert.ok(next.mock.calls.length === 1, 'next() should be called');
    });
  });

  describe('Integration: Middleware Chain', () => {
    it('should work with authMiddleware followed by requireRole', () => {
      req.headers.authorization = `Bearer ${validToken}`;

      // Step 1: authMiddleware
      authMiddleware(req, res, next);
      assert.ok(req.user, 'User should be authenticated');

      // Reset next mock
      next = mock.fn();

      // Step 2: requireRole
      const roleMiddleware = requireRole('Registrirani_Korisnik');
      roleMiddleware(req, res, next);

      assert.ok(next.mock.calls.length === 1, 'Should pass role check');
    });

    it('should work with authMiddleware followed by requireOwnership', () => {
      const userPayload = {
        userId: 'owner-123',
        email: 'owner@test.com',
        role: 'Registrirani_Korisnik'
      };
      const token = generateToken(userPayload);
      req.headers.authorization = `Bearer ${token}`;
      req.params.userId = 'owner-123';

      // Step 1: authMiddleware
      authMiddleware(req, res, next);
      assert.ok(req.user, 'User should be authenticated');

      // Reset next mock
      next = mock.fn();

      // Step 2: requireOwnership
      const ownershipMiddleware = requireOwnership('userId');
      ownershipMiddleware(req, res, next);

      assert.ok(next.mock.calls.length === 1, 'Should pass ownership check');
    });

    it('should block request at requireRole if role does not match', () => {
      const userPayload = {
        userId: 'user-123',
        email: 'user@test.com',
        role: 'Registrirani_Korisnik'
      };
      const token = generateToken(userPayload);
      req.headers.authorization = `Bearer ${token}`;

      // Step 1: authMiddleware
      authMiddleware(req, res, next);
      assert.ok(req.user, 'User should be authenticated');

      // Reset mocks
      next = mock.fn();
      res.status = mock.fn(function(code) { this.statusCode = code; return this; });
      res.json = mock.fn(function(data) { this.body = data; return this; });

      // Step 2: requireRole with Administrator
      const roleMiddleware = requireRole('Administrator');
      roleMiddleware(req, res, next);

      assert.strictEqual(next.mock.calls.length, 0, 'Should not call next()');
      assert.strictEqual(res.statusCode, 403, 'Should return 403 Forbidden');
    });
  });
});
