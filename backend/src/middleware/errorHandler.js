/**
 * Error Handler Middleware
 * Global error handling for Express application
 * Returns Croatian error messages to clients
 */

export function errorHandler(err, req, res, next) {
  // Log error for debugging
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Validation errors from express-validator
  if (err.name === 'ValidationError' || err.type === 'validation') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Nevažeći unos podataka',
        details: err.details || err.errors
      }
    });
  }

  // JWT authentication errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Nevažeći token za autentifikaciju'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Token je istekao. Molimo prijavite se ponovno.'
      }
    });
  }

  // Authorization errors
  if (err.name === 'AuthorizationError' || err.status === 403) {
    return res.status(403).json({
      error: {
        code: 'AUTHORIZATION_ERROR',
        message: 'Nemate dozvolu za ovu akciju'
      }
    });
  }

  // Not found errors
  if (err.status === 404 || err.name === 'NotFoundError') {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: err.message || 'Resurs nije pronađen'
      }
    });
  }

  // PostgreSQL unique constraint violation
  if (err.code === '23505') {
    return res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'Resurs već postoji'
      }
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Nevažeća referenca na povezani resurs'
      }
    });
  }

  // Conflict errors (e.g., duplicate email)
  if (err.status === 409) {
    return res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: err.message || 'Resurs već postoji'
      }
    });
  }

  // Default server error - don't expose internal details
  res.status(err.status || 500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Greška na poslužitelju'
    }
  });
}

export default errorHandler;
