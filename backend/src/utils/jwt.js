/**
 * JWT token generation and verification utilities
 * Implements requirements 1.1, 1.4, and 11.7
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * JWT configuration
 */
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

/**
 * Token expiry time in seconds (24 hours)
 */
const TOKEN_EXPIRY_SECONDS = 24 * 60 * 60;

/**
 * Generate a JWT token for a user
 * 
 * @param {Object} payload - Token payload containing user information
 * @param {string} payload.userId - User ID
 * @param {string} payload.email - User email
 * @param {string} payload.role - User role
 * @returns {string} Signed JWT token
 * @throws {Error} If payload is invalid or token generation fails
 */
export function generateToken(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload must be an object');
  }

  if (!payload.userId || typeof payload.userId !== 'string') {
    throw new Error('Payload must contain a valid userId');
  }

  if (!payload.email || typeof payload.email !== 'string') {
    throw new Error('Payload must contain a valid email');
  }

  if (!payload.role || typeof payload.role !== 'string') {
    throw new Error('Payload must contain a valid role');
  }

  try {
    const token = jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRY,
        issuer: 'flowops-platform',
        subject: payload.userId
      }
    );

    return token;
  } catch (error) {
    throw new Error(`Failed to generate token: ${error.message}`);
  }
}

/**
 * Verify and decode a JWT token
 * 
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid, expired, or verification fails
 */
export function verifyToken(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Token must be a non-empty string');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'flowops-platform'
    });

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token je istekao');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Neispravan token');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Token još nije valjan');
    } else {
      throw new Error(`Neuspjela verifikacija tokena: ${error.message}`);
    }
  }
}

/**
 * Extract token from Authorization header
 * Expected format: "Bearer <token>"
 * 
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Extracted token or null if not found
 */
export function extractTokenFromHeader(authHeader) {
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }

  const parts = authHeader.split(' ');

  // Check if header follows "Bearer <token>" format
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  const token = parts[1];

  // Ensure token is not empty
  if (!token || token.trim().length === 0) {
    return null;
  }

  return token;
}

/**
 * Decode token without verification (useful for expired token inspection)
 * WARNING: This does not verify the token signature. Use only for debugging.
 * 
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export function decodeToken(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  try {
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Check if a token is expired without throwing an error
 * 
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired, false otherwise
 */
export function isTokenExpired(token) {
  try {
    verifyToken(token);
    return false;
  } catch (error) {
    if (error.message === 'Token je istekao') {
      return true;
    }
    return false;
  }
}

/**
 * Export configuration constants for testing
 */
export const JWT_CONSTANTS = {
  JWT_SECRET,
  JWT_EXPIRY,
  TOKEN_EXPIRY_SECONDS
};
