/**
 * JWT Authentication Middleware
 * Implements requirements 1.1, 1.4, and 11.7
 * 
 * Verifies JWT tokens from Authorization header and attaches user info to request
 */

import { verifyToken, extractTokenFromHeader } from '../utils/jwt.js';

/**
 * Authentication middleware
 * Extracts and verifies JWT token from Authorization header
 * Attaches decoded user information to req.user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function authMiddleware(req, res, next) {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Neautorizirani pristup',
        message: 'Authorization header nije pronađen'
      });
    }

    // Extract token from "Bearer <token>" format
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        error: 'Neautorizirani pristup',
        message: 'Neispravan format Authorization headera. Očekivani format: Bearer <token>'
      });
    }

    // Verify token
    try {
      const decoded = verifyToken(token);

      // Attach user information to request object
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };

      // Attach token metadata for potential use
      req.tokenMeta = {
        issuedAt: decoded.iat,
        expiresAt: decoded.exp
      };

      next();
    } catch (error) {
      // Handle expired tokens specifically
      if (error.message === 'Token je istekao') {
        return res.status(401).json({
          error: 'Token istekao',
          message: 'Vaša sesija je istekla. Molimo prijavite se ponovno.'
        });
      }

      // Handle invalid tokens
      return res.status(401).json({
        error: 'Neautorizirani pristup',
        message: error.message || 'Neispravan token'
      });
    }
  } catch (error) {
    // Handle unexpected errors
    return res.status(500).json({
      error: 'Interna greška poslužitelja',
      message: 'Došlo je do greške prilikom provjere autentifikacije'
    });
  }
}

/**
 * Optional authentication middleware
 * Similar to authMiddleware but doesn't reject requests without tokens
 * Useful for endpoints that have different behavior for authenticated vs anonymous users
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function optionalAuthMiddleware(req, res, next) {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization;

    // If no auth header, continue without user info
    if (!authHeader) {
      req.user = null;
      return next();
    }

    // Extract token
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      req.user = null;
      return next();
    }

    // Try to verify token
    try {
      const decoded = verifyToken(token);

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };

      req.tokenMeta = {
        issuedAt: decoded.iat,
        expiresAt: decoded.exp
      };
    } catch (error) {
      // Token verification failed, but continue without user info
      req.user = null;
    }

    next();
  } catch (error) {
    // On unexpected error, continue without user info
    req.user = null;
    next();
  }
}

/**
 * Role-based access control middleware factory
 * Creates middleware that checks if user has one of the allowed roles
 * 
 * @param {...string} allowedRoles - Allowed role names
 * @returns {Function} Express middleware function
 * 
 * @example
 * app.get('/admin', authMiddleware, requireRole('Administrator'), handler);
 * app.get('/tickets', authMiddleware, requireRole('Registrirani_Korisnik', 'Tehničar', 'Administrator'), handler);
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    // Ensure user is authenticated (should be set by authMiddleware)
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        error: 'Neautorizirani pristup',
        message: 'Korisnik nije autentificiran'
      });
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Zabranjen pristup',
        message: 'Nemate ovlasti za pristup ovom resursu'
      });
    }

    next();
  };
}

/**
 * Middleware to check if user owns a resource
 * Useful for endpoints where users can only access their own resources
 * 
 * @param {string} userIdParam - Name of the parameter containing the user ID to check
 * @returns {Function} Express middleware function
 * 
 * @example
 * app.get('/users/:userId/profile', authMiddleware, requireOwnership('userId'), handler);
 */
export function requireOwnership(userIdParam = 'userId') {
  return (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        error: 'Neautorizirani pristup',
        message: 'Korisnik nije autentificiran'
      });
    }

    // Get the resource owner ID from params
    const resourceUserId = req.params[userIdParam];

    // Check if authenticated user matches resource owner
    if (req.user.userId !== resourceUserId) {
      return res.status(403).json({
        error: 'Zabranjen pristup',
        message: 'Možete pristupiti samo vlastitim resursima'
      });
    }

    next();
  };
}

/**
 * Combined middleware for ownership OR elevated role
 * Allows access if user owns the resource OR has an elevated role (e.g., Administrator)
 * 
 * @param {string} userIdParam - Name of the parameter containing the user ID to check
 * @param {...string} elevatedRoles - Roles that bypass ownership check
 * @returns {Function} Express middleware function
 * 
 * @example
 * app.get('/tickets/:creatorId', authMiddleware, requireOwnershipOr('creatorId', 'Tehničar', 'Administrator'), handler);
 */
export function requireOwnershipOr(userIdParam, ...elevatedRoles) {
  return (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user || !req.user.userId || !req.user.role) {
      return res.status(401).json({
        error: 'Neautorizirani pristup',
        message: 'Korisnik nije autentificiran'
      });
    }

    // Check if user has elevated role
    if (elevatedRoles.includes(req.user.role)) {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[userIdParam];
    if (req.user.userId === resourceUserId) {
      return next();
    }

    // Neither owner nor elevated role
    return res.status(403).json({
      error: 'Zabranjen pristup',
      message: 'Nemate ovlasti za pristup ovom resursu'
    });
  };
}
