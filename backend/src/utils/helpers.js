/**
 * Helper Utilities
 * Common helper functions used across the application
 */

/**
 * Create pagination metadata
 */
export function createPagination(page, limit, total) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total: parseInt(total),
    totalPages
  };
}

/**
 * Parse pagination parameters from request query
 */
export function parsePagination(query) {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}

/**
 * Create a not found error
 */
export function createNotFoundError(resource) {
  const error = new Error(`${resource} nije pronađen`);
  error.name = 'NotFoundError';
  error.status = 404;
  return error;
}

/**
 * Create an authorization error
 */
export function createAuthorizationError(message = 'Nemate dozvolu za ovu akciju') {
  const error = new Error(message);
  error.name = 'AuthorizationError';
  error.status = 403;
  return error;
}

/**
 * Create a validation error
 */
export function createValidationError(message, details = []) {
  const error = new Error(message);
  error.name = 'ValidationError';
  error.type = 'validation';
  error.status = 400;
  error.details = details;
  return error;
}

/**
 * Sanitize object by removing undefined values
 */
export function sanitizeObject(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  );
}

export default {
  createPagination,
  parsePagination,
  createNotFoundError,
  createAuthorizationError,
  createValidationError,
  sanitizeObject
};
