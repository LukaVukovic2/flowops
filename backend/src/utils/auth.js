/**
 * Authentication utility functions for password hashing and validation
 * Implements requirements 1.3 and 11.5
 */

import bcrypt from 'bcrypt';

/**
 * Salt rounds for bcrypt hashing
 * Higher value = more secure but slower
 */
const SALT_ROUNDS = 12;

/**
 * Password complexity requirements
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Hash a plain text password using bcrypt
 * 
 * @param {string} plainPassword - The plain text password to hash
 * @returns {Promise<string>} The hashed password
 * @throws {Error} If password is invalid or hashing fails
 */
export async function hashPassword(plainPassword) {
  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  if (plainPassword.length === 0) {
    throw new Error('Password cannot be empty');
  }

  try {
    const hash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    return hash;
  } catch (error) {
    throw new Error(`Failed to hash password: ${error.message}`);
  }
}

/**
 * Verify a plain text password against a hashed password
 * 
 * @param {string} plainPassword - The plain text password to verify
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 * @throws {Error} If verification fails due to invalid inputs
 */
export async function verifyPassword(plainPassword, hashedPassword) {
  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  if (!hashedPassword || typeof hashedPassword !== 'string') {
    throw new Error('Hashed password must be a non-empty string');
  }

  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error(`Failed to verify password: ${error.message}`);
  }
}

/**
 * Validate password complexity requirements
 * 
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one digit (0-9)
 * - At least one special character (@$!%*?&)
 * 
 * @param {string} password - The password to validate
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export function validatePasswordComplexity(password) {
  const errors = [];

  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      errors: ['Lozinka mora biti tekst']
    };
  }

  // Check minimum length
  if (password.length < 8) {
    errors.push('Lozinka mora imati najmanje 8 znakova');
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Lozinka mora sadržavati barem jedno veliko slovo');
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Lozinka mora sadržavati barem jedno malo slovo');
  }

  // Check for digit
  if (!/\d/.test(password)) {
    errors.push('Lozinka mora sadržavati barem jednu znamenku');
  }

  // Check for special character
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Lozinka mora sadržavati barem jedan poseban znak (@$!%*?&)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate password using regex pattern
 * This is a quick validation method that checks all requirements at once
 * 
 * @param {string} password - The password to validate
 * @returns {boolean} True if password meets all complexity requirements
 */
export function isPasswordValid(password) {
  if (!password || typeof password !== 'string') {
    return false;
  }
  return PASSWORD_REGEX.test(password);
}

/**
 * Export constants for testing purposes
 */
export const AUTH_CONSTANTS = {
  SALT_ROUNDS,
  PASSWORD_REGEX
};
