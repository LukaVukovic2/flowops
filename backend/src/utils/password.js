/**
 * Password utilities for hashing, verification, and complexity validation
 * Implements requirements 1.3 and 11.5
 */

import bcrypt from 'bcrypt';

/**
 * Number of salt rounds for bcrypt hashing
 */
const SALT_ROUNDS = 10;

/**
 * Password complexity requirements
 */
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const PASSWORD_REQUIRE_UPPERCASE = true;
const PASSWORD_REQUIRE_LOWERCASE = true;
const PASSWORD_REQUIRE_DIGIT = true;
const PASSWORD_REQUIRE_SPECIAL = false;

/**
 * Hash a password using bcrypt
 * 
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} Hashed password
 * @throws {Error} If password is invalid or hashing fails
 */
export async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Lozinka mora biti tekst');
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new Error(`Lozinka mora imati najmanje ${PASSWORD_MIN_LENGTH} znakova`);
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    throw new Error(`Lozinka ne smije biti dulja od ${PASSWORD_MAX_LENGTH} znakova`);
  }

  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    throw new Error(`Greška pri hashiranju lozinke: ${error.message}`);
  }
}

/**
 * Verify a password against a hash
 * 
 * @param {string} password - Plain text password to verify
 * @param {string} hash - Hashed password to compare against
 * @returns {Promise<boolean>} True if password matches hash, false otherwise
 * @throws {Error} If inputs are invalid or verification fails
 */
export async function verifyPassword(password, hash) {
  if (!password || typeof password !== 'string') {
    throw new Error('Lozinka mora biti tekst');
  }

  if (!hash || typeof hash !== 'string') {
    throw new Error('Hash mora biti tekst');
  }

  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    throw new Error(`Greška pri verifikaciji lozinke: ${error.message}`);
  }
}

/**
 * Validate password complexity requirements
 * 
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid flag and error messages
 */
export function validatePasswordComplexity(password) {
  const errors = [];

  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      errors: ['Lozinka mora biti tekst']
    };
  }

  // Check length
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Lozinka mora imati najmanje ${PASSWORD_MIN_LENGTH} znakova`);
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`Lozinka ne smije biti dulja od ${PASSWORD_MAX_LENGTH} znakova`);
  }

  // Check uppercase requirement
  if (PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Lozinka mora sadržavati najmanje jedno veliko slovo');
  }

  // Check lowercase requirement
  if (PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Lozinka mora sadržavati najmanje jedno malo slovo');
  }

  // Check digit requirement
  if (PASSWORD_REQUIRE_DIGIT && !/\d/.test(password)) {
    errors.push('Lozinka mora sadržavati najmanje jednu znamenku');
  }

  // Check special character requirement
  if (PASSWORD_REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Lozinka mora sadržavati najmanje jedan poseban znak');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Export password configuration for testing
 */
export const PASSWORD_CONFIG = {
  SALT_ROUNDS,
  MIN_LENGTH: PASSWORD_MIN_LENGTH,
  MAX_LENGTH: PASSWORD_MAX_LENGTH,
  REQUIRE_UPPERCASE: PASSWORD_REQUIRE_UPPERCASE,
  REQUIRE_LOWERCASE: PASSWORD_REQUIRE_LOWERCASE,
  REQUIRE_DIGIT: PASSWORD_REQUIRE_DIGIT,
  REQUIRE_SPECIAL: PASSWORD_REQUIRE_SPECIAL
};
