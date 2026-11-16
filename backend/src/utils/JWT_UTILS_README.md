# JWT Utilities and Authentication Middleware

## Overview

This module provides JWT (JSON Web Token) generation, verification, and authentication middleware for the FlowOps Platform. It implements security requirements 1.1, 1.4, and 11.7 from the requirements document.

## Features

- **Token Generation**: Create JWT tokens with 24-hour expiry
- **Token Verification**: Verify token signatures and validate expiration
- **Token Extraction**: Extract tokens from Authorization headers
- **Authentication Middleware**: Protect routes with JWT verification
- **Role-Based Access Control**: Enforce role-based permissions
- **Ownership Validation**: Ensure users can only access their own resources
- **Croatian Error Messages**: User-friendly error messages in Croatian

## JWT Utilities (`src/utils/jwt.js`)

### Functions

#### `generateToken(payload)`

Generates a signed JWT token with 24-hour expiry.

**Parameters:**
- `payload` (Object): Token payload
  - `userId` (string): User ID (required)
  - `email` (string): User email (required)
  - `role` (string): User role (required)

**Returns:** `string` - Signed JWT token

**Throws:** Error if payload is invalid

**Example:**
```javascript
import { generateToken } from './utils/jwt.js';

const token = generateToken({
  userId: '123e4567-e89b-12d3-a456-426614174000',
  email: 'user@flowops.com',
  role: 'Registrirani_Korisnik'
});
```

#### `verifyToken(token)`

Verifies JWT token signature and expiration.

**Parameters:**
- `token` (string): JWT token to verify

**Returns:** Object containing:
- `userId` (string): User ID
- `email` (string): User email
- `role` (string): User role
- `iat` (number): Issued at timestamp
- `exp` (number): Expiration timestamp

**Throws:** Error with Croatian message if token is invalid or expired

**Example:**
```javascript
import { verifyToken } from './utils/jwt.js';

try {
  const decoded = verifyToken(token);
  console.log(`User: ${decoded.email}, Role: ${decoded.role}`);
} catch (error) {
  console.error(error.message); // "Token je istekao" or "Neispravan token"
}
```

#### `extractTokenFromHeader(authHeader)`

Extracts JWT token from Authorization header.

**Parameters:**
- `authHeader` (string): Authorization header value (format: "Bearer <token>")

**Returns:** `string|null` - Extracted token or null if not found

**Example:**
```javascript
import { extractTokenFromHeader } from './utils/jwt.js';

const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const token = extractTokenFromHeader(authHeader);
```

#### `decodeToken(token)`

Decodes token without verification (for debugging only).

**Parameters:**
- `token` (string): JWT token

**Returns:** `Object|null` - Decoded payload or null

**Warning:** Does not verify signature. Use only for debugging.

#### `isTokenExpired(token)`

Checks if a token is expired without throwing an error.

**Parameters:**
- `token` (string): JWT token

**Returns:** `boolean` - True if expired, false otherwise

## Authentication Middleware (`src/middleware/auth.js`)

### Middleware Functions

#### `authMiddleware(req, res, next)`

Main authentication middleware. Verifies JWT token and attaches user info to request.

**Behavior:**
- Extracts token from `Authorization` header
- Verifies token signature and expiration
- Attaches `req.user` with user information
- Attaches `req.tokenMeta` with token metadata
- Returns 401 if authentication fails

**Usage:**
```javascript
import { authMiddleware } from './middleware/auth.js';

app.get('/api/v1/profile', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});
```

**Request Object After Authentication:**
```javascript
req.user = {
  userId: '123e4567-e89b-12d3-a456-426614174000',
  email: 'user@flowops.com',
  role: 'Registrirani_Korisnik'
};

req.tokenMeta = {
  issuedAt: 1704067200,
  expiresAt: 1704153600
};
```

#### `optionalAuthMiddleware(req, res, next)`

Optional authentication middleware. Does not reject unauthenticated requests.

**Behavior:**
- If token is valid: attaches `req.user`
- If token is missing/invalid: sets `req.user = null`
- Always calls `next()` without errors

**Usage:**
```javascript
import { optionalAuthMiddleware } from './middleware/auth.js';

// Public endpoint with optional auth
app.get('/api/v1/announcements', optionalAuthMiddleware, (req, res) => {
  if (req.user) {
    // Show unpublished announcements for authenticated users
  } else {
    // Show only published announcements
  }
});
```

#### `requireRole(...allowedRoles)`

Role-based access control middleware factory.

**Parameters:**
- `...allowedRoles` (string[]): One or more allowed role names

**Returns:** Middleware function

**Usage:**
```javascript
import { authMiddleware, requireRole } from './middleware/auth.js';

// Single role
app.get('/api/v1/admin/users', 
  authMiddleware, 
  requireRole('Administrator'), 
  handler
);

// Multiple roles
app.get('/api/v1/tickets', 
  authMiddleware, 
  requireRole('Registrirani_Korisnik', 'Tehničar', 'Administrator'), 
  handler
);
```

**Valid Roles:**
- `Posjetitelj` - Visitor (public access)
- `Registrirani_Korisnik` - Registered User
- `Tehničar` - Technician/Editor
- `Administrator` - Administrator

#### `requireOwnership(userIdParam)`

Ownership validation middleware factory. Ensures user can only access their own resources.

**Parameters:**
- `userIdParam` (string): Parameter name containing user ID (default: 'userId')

**Returns:** Middleware function

**Usage:**
```javascript
import { authMiddleware, requireOwnership } from './middleware/auth.js';

app.get('/api/v1/users/:userId/profile', 
  authMiddleware, 
  requireOwnership('userId'), 
  handler
);
```

#### `requireOwnershipOr(userIdParam, ...elevatedRoles)`

Combined ownership and role-based access control.

**Parameters:**
- `userIdParam` (string): Parameter name containing user ID
- `...elevatedRoles` (string[]): Roles that bypass ownership check

**Returns:** Middleware function

**Usage:**
```javascript
import { authMiddleware, requireOwnershipOr } from './middleware/auth.js';

// User can access own tickets OR Tehničar/Administrator can access any
app.get('/api/v1/tickets/:creatorId', 
  authMiddleware, 
  requireOwnershipOr('creatorId', 'Tehničar', 'Administrator'), 
  handler
);
```

## Configuration

### Environment Variables

Set these in your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=24h
```

**Important:**
- `JWT_SECRET`: Use a strong, random secret in production (minimum 32 characters)
- `JWT_EXPIRY`: Token expiration time (default: 24h)
  - Supported formats: `15m`, `2h`, `7d`, `24h`

### Token Expiry

Tokens expire after 24 hours by default (86400 seconds). After expiration:
- `verifyToken()` throws: "Token je istekao"
- `authMiddleware` returns 401 with Croatian message
- Frontend should prompt user to log in again

## Error Messages

All error messages are in Croatian for user-facing consistency:

| English | Croatian |
|---------|----------|
| Token expired | Token je istekao |
| Invalid token | Neispravan token |
| Unauthorized access | Neautorizirani pristup |
| Forbidden access | Zabranjen pristup |
| Not authenticated | Korisnik nije autentificiran |
| No permission | Nemate ovlasti za pristup ovom resursu |

## Security Features

### Token Security
- **Signature Verification**: All tokens verified with HMAC SHA256
- **Expiration Enforcement**: Expired tokens rejected automatically
- **Issuer Validation**: Tokens must be issued by 'flowops-platform'
- **Subject Validation**: Token subject matches user ID

### Header Security
- **Bearer Format Required**: Only accepts "Bearer <token>" format
- **Case-Sensitive**: "Bearer" must have capital B
- **Whitespace Handling**: Rejects empty or whitespace-only tokens

### Middleware Security
- **Role Validation**: Enforces role-based permissions
- **Ownership Validation**: Prevents unauthorized resource access
- **Error Handling**: Returns generic errors to prevent information leakage

## Testing

Run tests with:

```bash
# Run all tests
npm test

# Run JWT utility tests only
node --test src/utils/jwt.test.js

# Run auth middleware tests only
node --test src/middleware/auth.test.js
```

### Test Coverage

**JWT Utilities (`jwt.test.js`):**
- Token generation with valid/invalid payloads
- Token verification with valid/expired/tampered tokens
- Token extraction from various header formats
- Token decoding and expiration checking
- Integration tests for complete auth flow

**Auth Middleware (`auth.test.js`):**
- Authentication with valid/invalid tokens
- Optional authentication handling
- Role-based access control
- Ownership validation
- Combined ownership and role checks
- Middleware chain integration

## Usage Examples

### Complete Authentication Flow

```javascript
import express from 'express';
import { generateToken } from './utils/jwt.js';
import { authMiddleware, requireRole } from './middleware/auth.js';

const app = express();

// Login endpoint - generate token
app.post('/api/v1/auth/login', async (req, res) => {
  // ... validate credentials ...
  
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  res.json({ token, user });
});

// Protected endpoint - verify token
app.get('/api/v1/profile', authMiddleware, (req, res) => {
  res.json({ 
    userId: req.user.userId,
    email: req.user.email,
    role: req.user.role
  });
});

// Admin-only endpoint
app.get('/api/v1/admin/users', 
  authMiddleware, 
  requireRole('Administrator'), 
  (req, res) => {
    // Only administrators can access
  }
);

// Resource ownership check
app.get('/api/v1/tickets/:creatorId', 
  authMiddleware, 
  requireOwnershipOr('creatorId', 'Tehničar', 'Administrator'), 
  (req, res) => {
    // User can view own tickets OR Tehničar/Admin can view any
  }
);
```

### Frontend Integration

```javascript
// Store token after login
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { token } = await response.json();
localStorage.setItem('authToken', token);

// Use token in subsequent requests
const token = localStorage.getItem('authToken');
const response = await fetch('/api/v1/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Handle expired token
if (response.status === 401) {
  const error = await response.json();
  if (error.error === 'Token istekao') {
    // Redirect to login
    window.location.href = '/login';
  }
}
```

## Best Practices

1. **Always use authMiddleware first** in middleware chain
2. **Use requireRole after authMiddleware** for role checks
3. **Store JWT_SECRET securely** - never commit to version control
4. **Use HTTPS in production** to protect tokens in transit
5. **Implement token refresh** for better UX (optional)
6. **Clear tokens on logout** in frontend
7. **Validate token on every protected request** (never trust client)
8. **Use ownership checks** to prevent unauthorized access
9. **Log authentication failures** for security monitoring
10. **Test middleware chains** to ensure proper security

## Related Files

- `src/utils/jwt.js` - JWT utility functions
- `src/utils/jwt.test.js` - JWT unit tests
- `src/middleware/auth.js` - Authentication middleware
- `src/middleware/auth.test.js` - Middleware unit tests
- `src/utils/auth.js` - Password hashing utilities (task 4.1)
- `.env` - Environment configuration

## Requirements Implementation

This implementation satisfies:

- **Requirement 1.1**: User authentication with JWT tokens
- **Requirement 1.4**: Session expiration after 24 hours
- **Requirement 11.7**: JWT token validation on protected requests
- **Requirement 11.5**: Secure authentication implementation
- **Requirement 2**: Role-based access control for ticket management
- **Requirement 5**: Administrator permissions enforcement

## Future Enhancements

Potential improvements for future implementation:

1. **Token Refresh**: Implement refresh tokens for seamless re-authentication
2. **Token Revocation**: Add blacklist for revoked tokens
3. **Rate Limiting**: Add rate limiting to authentication endpoints
4. **Audit Logging**: Log all authentication attempts
5. **Multi-Factor Authentication**: Add 2FA support
6. **Session Management**: Track active sessions per user
7. **Token Rotation**: Automatic token rotation on sensitive operations
