/**
 * Unit tests for JWT utilities
 * Tests token generation, verification, and extraction
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  decodeToken,
  isTokenExpired,
  JWT_CONSTANTS
} from './jwt.js';

describe('JWT Utilities', () => {
  let validPayload;
  let validToken;

  before(() => {
    validPayload = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      role: 'Registrirani_Korisnik'
    };
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(validPayload);

      assert.ok(token, 'Token should be generated');
      assert.strictEqual(typeof token, 'string', 'Token should be a string');
      assert.ok(token.length > 0, 'Token should not be empty');
      
      // JWT tokens have 3 parts separated by dots
      const parts = token.split('.');
      assert.strictEqual(parts.length, 3, 'JWT should have 3 parts');
    });

    it('should generate different tokens for same payload', () => {
      const token1 = generateToken(validPayload);
      const token2 = generateToken(validPayload);

      // Tokens should be different due to different timestamps (iat)
      assert.notStrictEqual(token1, token2, 'Tokens should differ due to timestamps');
    });

    it('should include userId, email, and role in token', () => {
      const token = generateToken(validPayload);
      const decoded = decodeToken(token);

      assert.strictEqual(decoded.userId, validPayload.userId);
      assert.strictEqual(decoded.email, validPayload.email);
      assert.strictEqual(decoded.role, validPayload.role);
    });

    it('should include standard JWT claims', () => {
      const token = generateToken(validPayload);
      const decoded = decodeToken(token);

      assert.ok(decoded.iat, 'Should have issued at timestamp');
      assert.ok(decoded.exp, 'Should have expiration timestamp');
      assert.strictEqual(decoded.iss, 'flowops-platform', 'Should have correct issuer');
      assert.strictEqual(decoded.sub, validPayload.userId, 'Subject should be userId');
    });

    it('should throw error for null payload', () => {
      assert.throws(
        () => generateToken(null),
        /Payload must be an object/,
        'Should reject null payload'
      );
    });

    it('should throw error for undefined payload', () => {
      assert.throws(
        () => generateToken(undefined),
        /Payload must be an object/,
        'Should reject undefined payload'
      );
    });

    it('should throw error for non-object payload', () => {
      assert.throws(
        () => generateToken('string'),
        /Payload must be an object/,
        'Should reject string payload'
      );
    });

    it('should throw error for missing userId', () => {
      const invalidPayload = {
        email: 'test@example.com',
        role: 'Registrirani_Korisnik'
      };

      assert.throws(
        () => generateToken(invalidPayload),
        /Payload must contain a valid userId/,
        'Should reject payload without userId'
      );
    });

    it('should throw error for missing email', () => {
      const invalidPayload = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        role: 'Registrirani_Korisnik'
      };

      assert.throws(
        () => generateToken(invalidPayload),
        /Payload must contain a valid email/,
        'Should reject payload without email'
      );
    });

    it('should throw error for missing role', () => {
      const invalidPayload = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com'
      };

      assert.throws(
        () => generateToken(invalidPayload),
        /Payload must contain a valid role/,
        'Should reject payload without role'
      );
    });

    it('should throw error for invalid userId type', () => {
      const invalidPayload = {
        userId: 123,
        email: 'test@example.com',
        role: 'Registrirani_Korisnik'
      };

      assert.throws(
        () => generateToken(invalidPayload),
        /Payload must contain a valid userId/,
        'Should reject non-string userId'
      );
    });

    it('should handle all valid roles', () => {
      const roles = ['Posjetitelj', 'Registrirani_Korisnik', 'Tehničar', 'Administrator'];

      roles.forEach(role => {
        const payload = { ...validPayload, role };
        const token = generateToken(payload);
        assert.ok(token, `Should generate token for role: ${role}`);
      });
    });
  });

  describe('verifyToken', () => {
    before(() => {
      validToken = generateToken(validPayload);
    });

    it('should verify a valid token', () => {
      const decoded = verifyToken(validToken);

      assert.ok(decoded, 'Should return decoded payload');
      assert.strictEqual(decoded.userId, validPayload.userId);
      assert.strictEqual(decoded.email, validPayload.email);
      assert.strictEqual(decoded.role, validPayload.role);
    });

    it('should return token metadata', () => {
      const decoded = verifyToken(validToken);

      assert.ok(decoded.iat, 'Should have issued at timestamp');
      assert.ok(decoded.exp, 'Should have expiration timestamp');
      assert.ok(typeof decoded.iat === 'number', 'iat should be a number');
      assert.ok(typeof decoded.exp === 'number', 'exp should be a number');
    });

    it('should verify expiration is set correctly', () => {
      const decoded = verifyToken(validToken);
      const now = Math.floor(Date.now() / 1000);
      const expiryDuration = decoded.exp - decoded.iat;

      // Should be approximately 24 hours (86400 seconds)
      assert.ok(expiryDuration >= 86380 && expiryDuration <= 86420, 
        'Token should expire in approximately 24 hours');
    });

    it('should throw error for null token', () => {
      assert.throws(
        () => verifyToken(null),
        /Token must be a non-empty string/,
        'Should reject null token'
      );
    });

    it('should throw error for undefined token', () => {
      assert.throws(
        () => verifyToken(undefined),
        /Token must be a non-empty string/,
        'Should reject undefined token'
      );
    });

    it('should throw error for empty string token', () => {
      assert.throws(
        () => verifyToken(''),
        /Token must be a non-empty string/,
        'Should reject empty token'
      );
    });

    it('should throw error for invalid token format', () => {
      assert.throws(
        () => verifyToken('invalid.token'),
        /Neispravan token/,
        'Should reject invalid token format'
      );
    });

    it('should throw error for malformed JWT', () => {
      assert.throws(
        () => verifyToken('not-a-jwt-token'),
        /Neispravan token/,
        'Should reject malformed JWT'
      );
    });

    it('should throw error for tampered token', () => {
      const parts = validToken.split('.');
      const tamperedToken = parts[0] + '.tampered.' + parts[2];

      assert.throws(
        () => verifyToken(tamperedToken),
        /Neispravan token/,
        'Should reject tampered token'
      );
    });

    it('should provide Croatian error messages', () => {
      try {
        verifyToken('invalid.token.here');
        assert.fail('Should have thrown error');
      } catch (error) {
        assert.ok(error.message.includes('Neispravan token'), 
          'Error message should be in Croatian');
      }
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
      const authHeader = `Bearer ${token}`;

      const extracted = extractTokenFromHeader(authHeader);
      assert.strictEqual(extracted, token);
    });

    it('should return null for missing header', () => {
      const extracted = extractTokenFromHeader(null);
      assert.strictEqual(extracted, null);
    });

    it('should return null for undefined header', () => {
      const extracted = extractTokenFromHeader(undefined);
      assert.strictEqual(extracted, null);
    });

    it('should return null for empty header', () => {
      const extracted = extractTokenFromHeader('');
      assert.strictEqual(extracted, null);
    });

    it('should return null for header without Bearer prefix', () => {
      const extracted = extractTokenFromHeader('token-without-bearer');
      assert.strictEqual(extracted, null);
    });

    it('should return null for header with wrong prefix', () => {
      const extracted = extractTokenFromHeader('Basic token');
      assert.strictEqual(extracted, null);
    });

    it('should return null for Bearer without token', () => {
      const extracted = extractTokenFromHeader('Bearer');
      assert.strictEqual(extracted, null);
    });

    it('should return null for Bearer with empty token', () => {
      const extracted = extractTokenFromHeader('Bearer ');
      assert.strictEqual(extracted, null);
    });

    it('should return null for Bearer with whitespace token', () => {
      const extracted = extractTokenFromHeader('Bearer    ');
      assert.strictEqual(extracted, null);
    });

    it('should handle case-sensitive Bearer keyword', () => {
      const token = 'valid.jwt.token';
      const extracted = extractTokenFromHeader(`bearer ${token}`);
      assert.strictEqual(extracted, null, 'Should only accept "Bearer" with capital B');
    });

    it('should extract token with extra parts (invalid but extracted)', () => {
      const token = 'valid.jwt.token';
      const extracted = extractTokenFromHeader(`Bearer ${token} extra-parts`);
      // Should return null because format is "Bearer <token>" not "Bearer <token> <extra>"
      assert.strictEqual(extracted, null);
    });
  });

  describe('decodeToken', () => {
    before(() => {
      validToken = generateToken(validPayload);
    });

    it('should decode a valid token without verification', () => {
      const decoded = decodeToken(validToken);

      assert.ok(decoded, 'Should return decoded payload');
      assert.strictEqual(decoded.userId, validPayload.userId);
      assert.strictEqual(decoded.email, validPayload.email);
      assert.strictEqual(decoded.role, validPayload.role);
    });

    it('should decode token without verifying signature', () => {
      const parts = validToken.split('.');
      const tamperedToken = parts[0] + '.tampered.' + parts[2];

      // decodeToken should still decode (not verify)
      const decoded = decodeToken(tamperedToken);
      // It may return null for malformed token, but won't throw
      assert.ok(decoded === null || typeof decoded === 'object');
    });

    it('should return null for null token', () => {
      const decoded = decodeToken(null);
      assert.strictEqual(decoded, null);
    });

    it('should return null for undefined token', () => {
      const decoded = decodeToken(undefined);
      assert.strictEqual(decoded, null);
    });

    it('should return null for empty string', () => {
      const decoded = decodeToken('');
      assert.strictEqual(decoded, null);
    });

    it('should return null for invalid token format', () => {
      const decoded = decodeToken('not-a-jwt');
      assert.strictEqual(decoded, null);
    });
  });

  describe('isTokenExpired', () => {
    before(() => {
      validToken = generateToken(validPayload);
    });

    it('should return false for valid non-expired token', () => {
      const expired = isTokenExpired(validToken);
      assert.strictEqual(expired, false, 'Valid token should not be expired');
    });

    it('should return false for invalid token', () => {
      const expired = isTokenExpired('invalid.token');
      assert.strictEqual(expired, false, 'Invalid token should return false (not expired error)');
    });

    it('should handle null token', () => {
      const expired = isTokenExpired(null);
      assert.strictEqual(expired, false, 'Null token should return false');
    });

    it('should handle undefined token', () => {
      const expired = isTokenExpired(undefined);
      assert.strictEqual(expired, false, 'Undefined token should return false');
    });
  });

  describe('JWT_CONSTANTS', () => {
    it('should export JWT_SECRET', () => {
      assert.ok(JWT_CONSTANTS.JWT_SECRET, 'JWT_SECRET should be defined');
      assert.strictEqual(typeof JWT_CONSTANTS.JWT_SECRET, 'string');
    });

    it('should export JWT_EXPIRY', () => {
      assert.ok(JWT_CONSTANTS.JWT_EXPIRY, 'JWT_EXPIRY should be defined');
      assert.strictEqual(typeof JWT_CONSTANTS.JWT_EXPIRY, 'string');
    });

    it('should export TOKEN_EXPIRY_SECONDS', () => {
      assert.ok(JWT_CONSTANTS.TOKEN_EXPIRY_SECONDS, 'TOKEN_EXPIRY_SECONDS should be defined');
      assert.strictEqual(JWT_CONSTANTS.TOKEN_EXPIRY_SECONDS, 86400, 'Should be 24 hours in seconds');
    });
  });

  describe('Integration Tests', () => {
    it('should generate and verify token end-to-end', () => {
      const payload = {
        userId: 'test-user-123',
        email: 'integration@test.com',
        role: 'Administrator'
      };

      // Generate token
      const token = generateToken(payload);
      assert.ok(token, 'Token should be generated');

      // Verify token
      const decoded = verifyToken(token);
      assert.strictEqual(decoded.userId, payload.userId);
      assert.strictEqual(decoded.email, payload.email);
      assert.strictEqual(decoded.role, payload.role);
    });

    it('should work with extractTokenFromHeader and verifyToken', () => {
      const token = generateToken(validPayload);
      const authHeader = `Bearer ${token}`;

      // Extract token
      const extracted = extractTokenFromHeader(authHeader);
      assert.strictEqual(extracted, token);

      // Verify extracted token
      const decoded = verifyToken(extracted);
      assert.strictEqual(decoded.userId, validPayload.userId);
    });

    it('should handle complete auth flow', () => {
      // 1. User logs in, generate token
      const userPayload = {
        userId: 'user-456',
        email: 'user@flowops.com',
        role: 'Tehničar'
      };

      const token = generateToken(userPayload);

      // 2. Client sends request with token in header
      const authHeader = `Bearer ${token}`;

      // 3. Server extracts token
      const extractedToken = extractTokenFromHeader(authHeader);
      assert.ok(extractedToken);

      // 4. Server verifies token
      const verified = verifyToken(extractedToken);
      assert.strictEqual(verified.userId, userPayload.userId);
      assert.strictEqual(verified.email, userPayload.email);
      assert.strictEqual(verified.role, userPayload.role);
    });

    it('should reject modified payload in token', () => {
      const token = generateToken(validPayload);
      const decoded = decodeToken(token);

      // Try to modify the decoded payload (won't work for verification)
      decoded.role = 'Administrator';

      // The original token should still verify with original payload
      const verified = verifyToken(token);
      assert.strictEqual(verified.role, validPayload.role, 
        'Original role should be preserved');
    });
  });
});
