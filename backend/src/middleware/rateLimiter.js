/**
 * Rate Limiter Middleware
 * Implements rate limiting to prevent abuse
 */

// Simple in-memory rate limiter
// For production, consider using Redis-backed rate limiter

const requests = new Map();

function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
  const max = options.max || 100;
  const message = options.message || 'Previše pokušaja. Pokušajte ponovo kasnije.';

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Get or create request log for this IP
    if (!requests.has(key)) {
      requests.set(key, []);
    }
    
    const userRequests = requests.get(key);
    
    // Remove old requests outside the time window
    const recentRequests = userRequests.filter(timestamp => now - timestamp < windowMs);
    
    // Update the map with recent requests only
    requests.set(key, recentRequests);
    
    // Check if limit exceeded
    if (recentRequests.length >= max) {
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message
        }
      });
    }
    
    // Add current request
    recentRequests.push(now);
    requests.set(key, recentRequests);
    
    next();
  };
}

// Authentication rate limiter: 5 requests per 15 minutes
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Previše pokušaja prijave. Pokušajte ponovo za 15 minuta.'
});

// General API rate limiter: 100 requests per 15 minutes
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Previše zahtjeva. Pokušajte ponovo kasnije.'
});

// Cleanup old entries periodically (every 30 minutes)
setInterval(() => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  
  for (const [key, timestamps] of requests.entries()) {
    const recentRequests = timestamps.filter(timestamp => now - timestamp < windowMs);
    if (recentRequests.length === 0) {
      requests.delete(key);
    } else {
      requests.set(key, recentRequests);
    }
  }
}, 30 * 60 * 1000);

export default createRateLimiter;
