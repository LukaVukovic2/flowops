/**
 * Unit tests for authentication utilities
 * Tests password hashing, verification, and validation
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import {
  hashPassword,
  verifyPassword,
  validatePasswordComplexity,
  isPasswordValid,
  AUTH_CONSTANTS
} from './auth.js';

describe('Authentication Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a valid password successfully', async () => {
      const password = 'SecurePass123!';
      const hash = await hashPassword(password);
      
      assert.ok(hash, 'Hash should be generated');
      assert.strictEqual(typeof hash, 'string', 'Hash should be a string');
      assert.ok(hash.length > 0, 'Hash should not be empty');
      assert.ok(hash.startsWith('$2'), 'Hash should start with bcrypt prefix');
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'SecurePass123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      assert.notStrictEqual(hash1, hash2, 'Hashes should be different due to salting');
    });

    it('should throw error for empty string password', async () => {
      await assert.rejects(
        async () => await hashPassword(''),
        /Password cannot be empty/,
        'Should reject empty string'
      );
    });

    it('should throw error for null password', async () => {
      await assert.rejects(
        async () => await hashPassword(null),
        /Password must be a non-empty string/,
        'Should reject null'
      );
    });

    it('should throw error for undefined password', async () => {
      await assert.rejects(
        async () => await hashPassword(undefined),
        /Password must be a non-empty string/,
        'Should reject undefined'
      );
    });

    it('should throw error for non-string password', async () => {
      await assert.rejects(
        async () => await hashPassword(12345),
        /Password must be a non-empty string/,
        'Should reject number'
      );
    });

    it('should handle very long passwords', async () => {
      const longPassword = 'A1@' + 'a'.repeat(1000);
      const hash = await hashPassword(longPassword);
      
      assert.ok(hash, 'Should hash long password');
      assert.ok(hash.length > 0, 'Hash should be generated for long password');
    });
  });

  describe('verifyPassword', () => {
    let testPassword;
    let testHash;

    before(async () => {
      testPassword = 'SecurePass123!';
      testHash = await hashPassword(testPassword);
    });

    it('should verify correct password successfully', async () => {
      const isValid = await verifyPassword(testPassword, testHash);
      assert.strictEqual(isValid, true, 'Should verify correct password');
    });

    it('should reject incorrect password', async () => {
      const isValid = await verifyPassword('WrongPassword123!', testHash);
      assert.strictEqual(isValid, false, 'Should reject incorrect password');
    });

    it('should reject password with different case', async () => {
      const isValid = await verifyPassword('securepass123!', testHash);
      assert.strictEqual(isValid, false, 'Should be case-sensitive');
    });

    it('should reject similar but different password', async () => {
      const isValid = await verifyPassword('SecurePass123', testHash);
      assert.strictEqual(isValid, false, 'Should reject password missing special char');
    });

    it('should throw error for empty plain password', async () => {
      await assert.rejects(
        async () => await verifyPassword('', testHash),
        /Password must be a non-empty string/,
        'Should reject empty password'
      );
    });

    it('should throw error for null plain password', async () => {
      await assert.rejects(
        async () => await verifyPassword(null, testHash),
        /Password must be a non-empty string/,
        'Should reject null password'
      );
    });

    it('should throw error for null hashed password', async () => {
      await assert.rejects(
        async () => await verifyPassword(testPassword, null),
        /Hashed password must be a non-empty string/,
        'Should reject null hash'
      );
    });

    it('should throw error for empty hashed password', async () => {
      await assert.rejects(
        async () => await verifyPassword(testPassword, ''),
        /Hashed password must be a non-empty string/,
        'Should reject empty hash'
      );
    });

    it('should throw error for invalid hash format', async () => {
      await assert.rejects(
        async () => await verifyPassword(testPassword, 'invalid-hash'),
        /Failed to verify password/,
        'Should reject invalid hash format'
      );
    });
  });

  describe('validatePasswordComplexity', () => {
    it('should validate password meeting all requirements', () => {
      const result = validatePasswordComplexity('SecurePass123!');
      
      assert.strictEqual(result.isValid, true, 'Should be valid');
      assert.strictEqual(result.errors.length, 0, 'Should have no errors');
    });

    it('should accept various valid passwords', () => {
      const validPasswords = [
        'Password1!',
        'MyP@ssw0rd',
        'Str0ng!Pass',
        'C0mpl3x@Password',
        'Test123!@#ABC'
      ];

      validPasswords.forEach(password => {
        const result = validatePasswordComplexity(password);
        assert.strictEqual(
          result.isValid,
          true,
          `Password "${password}" should be valid`
        );
      });
    });

    it('should reject password shorter than 8 characters', () => {
      const result = validatePasswordComplexity('Pass1!');
      
      assert.strictEqual(result.isValid, false, 'Should be invalid');
      assert.ok(
        result.errors.some(e => e.includes('najmanje 8 znakova')),
        'Should have length error'
      );
    });

    it('should reject password without uppercase letter', () => {
      const result = validatePasswordComplexity('password123!');
      
      assert.strictEqual(result.isValid, false, 'Should be invalid');
      assert.ok(
        result.errors.some(e => e.includes('veliko slovo')),
        'Should have uppercase error'
      );
    });

    it('should reject password without lowercase letter', () => {
      const result = validatePasswordComplexity('PASSWORD123!');
      
      assert.strictEqual(result.isValid, false, 'Should be invalid');
      assert.ok(
        result.errors.some(e => e.includes('malo slovo')),
        'Should have lowercase error'
      );
    });

    it('should reject password without digit', () => {
      const result = validatePasswordComplexity('Password!');
      
      assert.strictEqual(result.isValid, false, 'Should be invalid');
      assert.ok(
        result.errors.some(e => e.includes('znamenku')),
        'Should have digit error'
      );
    });

    it('should reject password without special character', () => {
      const result = validatePasswordComplexity('Password123');
      
      assert.strictEqual(result.isValid, false, 'Should be invalid');
      assert.ok(
        result.errors.some(e => e.includes('poseban znak')),
        'Should have special character error'
      );
    });

    it('should return multiple errors for weak password', () => {
      const result = validatePasswordComplexity('pass');
      
      assert.strictEqual(result.isValid, false, 'Should be invalid');
      assert.ok(result.errors.length >= 4, 'Should have multiple errors');
      assert.ok(result.errors.some(e => e.includes('8 znakova')));
      assert.ok(result.errors.some(e => e.includes('veliko slovo')));
      assert.ok(result.errors.some(e => e.includes('znamenku')));
      assert.ok(result.errors.some(e => e.includes('poseban znak')));
    });

    it('should reject null password', () => {
      const result = validatePasswordComplexity(null);
      
      assert.strictEqual(result.isValid, false, 'Should be invalid');
      assert.strictEqual(result.errors[0], 'Lozinka mora biti tekst');
    });

    it('should reject undefined password', () => {
      const result = validatePasswordComplexity(undefined);
      
      assert.strictEqual(result.isValid, false, 'Should be invalid');
      assert.strictEqual(result.errors[0], 'Lozinka mora biti tekst');
    });

    it('should reject non-string password', () => {
      const result = validatePasswordComplexity(12345);
      
      assert.strictEqual(result.isValid, false, 'Should be invalid');
      assert.strictEqual(result.errors[0], 'Lozinka mora biti tekst');
    });

    it('should reject empty string password', () => {
      const result = validatePasswordComplexity('');
      
      assert.strictEqual(result.isValid, false, 'Should be invalid');
      assert.ok(result.errors.length > 0, 'Should have errors');
    });

    it('should accept all allowed special characters', () => {
      const specialChars = ['@', '$', '!', '%', '*', '?', '&'];
      
      specialChars.forEach(char => {
        const password = `Password1${char}`;
        const result = validatePasswordComplexity(password);
        assert.strictEqual(
          result.isValid,
          true,
          `Password with ${char} should be valid`
        );
      });
    });
  });

  describe('isPasswordValid', () => {
    it('should return true for valid passwords', () => {
      const validPasswords = [
        'SecurePass123!',
        'Password1!',
        'MyP@ssw0rd',
        'Str0ng!Pass'
      ];

      validPasswords.forEach(password => {
        assert.strictEqual(
          isPasswordValid(password),
          true,
          `Password "${password}" should be valid`
        );
      });
    });

    it('should return false for invalid passwords', () => {
      const invalidPasswords = [
        'short1!',           // Too short
        'password123!',     // No uppercase
        'PASSWORD123!',     // No lowercase
        'Password!',        // No digit
        'Password123',      // No special char
        '',                 // Empty
        'Pass 123!',        // Contains space (not allowed)
      ];

      invalidPasswords.forEach(password => {
        assert.strictEqual(
          isPasswordValid(password),
          false,
          `Password "${password}" should be invalid`
        );
      });
    });

    it('should return false for null', () => {
      assert.strictEqual(isPasswordValid(null), false);
    });

    it('should return false for undefined', () => {
      assert.strictEqual(isPasswordValid(undefined), false);
    });

    it('should return false for non-string', () => {
      assert.strictEqual(isPasswordValid(12345), false);
      assert.strictEqual(isPasswordValid({}), false);
      assert.strictEqual(isPasswordValid([]), false);
    });

    it('should match validatePasswordComplexity results', () => {
      const testPasswords = [
        'ValidPass123!',
        'weak',
        'NoDigit!',
        'nouppercas3!',
        'NOLOWERCASE1!',
        'NoSpecial123'
      ];

      testPasswords.forEach(password => {
        const complexityResult = validatePasswordComplexity(password);
        const regexResult = isPasswordValid(password);
        
        assert.strictEqual(
          regexResult,
          complexityResult.isValid,
          `Results should match for "${password}"`
        );
      });
    });
  });

  describe('AUTH_CONSTANTS', () => {
    it('should export SALT_ROUNDS constant', () => {
      assert.strictEqual(AUTH_CONSTANTS.SALT_ROUNDS, 12);
    });

    it('should export PASSWORD_REGEX constant', () => {
      assert.ok(AUTH_CONSTANTS.PASSWORD_REGEX instanceof RegExp);
    });
  });

  describe('Integration Tests', () => {
    it('should hash and verify password end-to-end', async () => {
      const password = 'IntegrationTest123!';
      
      // Validate password complexity
      const validation = validatePasswordComplexity(password);
      assert.strictEqual(validation.isValid, true, 'Password should be valid');
      
      // Hash the password
      const hash = await hashPassword(password);
      assert.ok(hash, 'Password should be hashed');
      
      // Verify correct password
      const isCorrect = await verifyPassword(password, hash);
      assert.strictEqual(isCorrect, true, 'Correct password should verify');
      
      // Verify wrong password
      const isWrong = await verifyPassword('WrongPassword123!', hash);
      assert.strictEqual(isWrong, false, 'Wrong password should not verify');
    });

    it('should validate, hash, and verify multiple passwords', async () => {
      const passwords = [
        'TestPass1!',
        'Another@Pass2',
        'Secure$Pass3',
        'Complex%Pass4'
      ];

      for (const password of passwords) {
        // Validate
        assert.strictEqual(isPasswordValid(password), true);
        
        // Hash
        const hash = await hashPassword(password);
        
        // Verify
        const isValid = await verifyPassword(password, hash);
        assert.strictEqual(isValid, true, `Password ${password} should verify`);
      }
    });

    it('should not allow invalid password to be hashed without validation', async () => {
      const invalidPassword = 'weak';
      
      // Check validation first
      const validation = validatePasswordComplexity(invalidPassword);
      assert.strictEqual(validation.isValid, false, 'Password should be invalid');
      
      // Hashing should still work (validation is separate concern)
      // But in real application, we should validate before hashing
      const hash = await hashPassword(invalidPassword);
      assert.ok(hash, 'Hash can be generated, but should validate first in practice');
    });
  });
});
