# Authentication API Documentation

This document describes the authentication endpoints for the FlowOps Platform.

## Base URL

All authentication endpoints are prefixed with `/api/v1/auth`.

## Endpoints

### 1. Register New User

**Endpoint:** `POST /api/v1/auth/register`

**Description:** Register a new user account with default role `Registrirani_Korisnik`.

**Access:** Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "Ivan",
  "lastName": "Horvat"
}
```

**Request Fields:**
- `email` (required): Valid email address
- `password` (required): Password with complexity requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one digit
- `firstName` (optional): User's first name (max 100 characters)
- `lastName` (optional): User's last name (max 100 characters)

**Success Response (201 Created):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "Registrirani_Korisnik",
    "firstName": "Ivan",
    "lastName": "Horvat",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

400 Bad Request - Validation Error:
```json
{
  "error": "Greška validacije",
  "message": "Neispravan format e-mail adrese",
  "errors": [...]
}
```

400 Bad Request - Password Complexity:
```json
{
  "error": "Greška validacije lozinke",
  "message": "Lozinka mora sadržavati najmanje jedno veliko slovo",
  "errors": [...]
}
```

400 Bad Request - User Exists:
```json
{
  "error": "Korisnik već postoji",
  "message": "Korisnik s tom e-mail adresom već je registriran"
}
```

500 Internal Server Error:
```json
{
  "error": "Interna greška poslužitelja",
  "message": "Došlo je do greške prilikom registracije"
}
```

---

### 2. User Login

**Endpoint:** `POST /api/v1/auth/login`

**Description:** Authenticate user and receive JWT token.

**Access:** Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Request Fields:**
- `email` (required): User's email address
- `password` (required): User's password

**Success Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "Registrirani_Korisnik",
    "firstName": "Ivan",
    "lastName": "Horvat"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

400 Bad Request - Validation Error:
```json
{
  "error": "Greška validacije",
  "message": "Neispravan format e-mail adrese",
  "errors": [...]
}
```

401 Unauthorized - Invalid Credentials:
```json
{
  "error": "Neispravne vjerodajnice",
  "message": "Neispravna e-mail adresa ili lozinka"
}
```

401 Unauthorized - Account Deactivated:
```json
{
  "error": "Račun deaktiviran",
  "message": "Vaš korisnički račun je deaktiviran"
}
```

500 Internal Server Error:
```json
{
  "error": "Interna greška poslužitelja",
  "message": "Došlo je do greške prilikom prijave"
}
```

---

### 3. User Logout

**Endpoint:** `POST /api/v1/auth/logout`

**Description:** Logout user. With JWT stateless authentication, logout is primarily client-side (removing token). Future implementation may include token blacklist.

**Access:** Authenticated (requires valid JWT token)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:** None

**Success Response (200 OK):**
```json
{
  "message": "Uspješno ste se odjavili"
}
```

**Error Responses:**

401 Unauthorized - No Token:
```json
{
  "error": "Neautorizirani pristup",
  "message": "Authorization header nije pronađen"
}
```

401 Unauthorized - Invalid Token:
```json
{
  "error": "Neautorizirani pristup",
  "message": "Neispravan token"
}
```

401 Unauthorized - Expired Token:
```json
{
  "error": "Token istekao",
  "message": "Vaša sesija je istekla. Molimo prijavite se ponovno."
}
```

500 Internal Server Error:
```json
{
  "error": "Interna greška poslužitelja",
  "message": "Došlo je do greške prilikom odjave"
}
```

---

### 4. Get Current User Profile

**Endpoint:** `GET /api/v1/auth/me`

**Description:** Retrieve the authenticated user's profile information.

**Access:** Authenticated (requires valid JWT token)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:** None

**Success Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "Registrirani_Korisnik",
  "firstName": "Ivan",
  "lastName": "Horvat",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**

401 Unauthorized - No Token:
```json
{
  "error": "Neautorizirani pristup",
  "message": "Authorization header nije pronađen"
}
```

401 Unauthorized - Invalid Token:
```json
{
  "error": "Neautorizirani pristup",
  "message": "Neispravan token"
}
```

401 Unauthorized - Expired Token:
```json
{
  "error": "Token istekao",
  "message": "Vaša sesija je istekla. Molimo prijavite se ponovno."
}
```

404 Not Found - User Not Found:
```json
{
  "error": "Korisnik nije pronađen",
  "message": "Korisnički profil nije pronađen"
}
```

500 Internal Server Error:
```json
{
  "error": "Interna greška poslužitelja",
  "message": "Došlo je do greške prilikom dohvaćanja profila"
}
```

---

## Authentication Flow

### Registration Flow

1. Client sends POST request to `/api/v1/auth/register` with user details
2. Server validates email format and password complexity
3. Server checks if user already exists
4. Server hashes password using bcrypt
5. Server creates user in database with default role `Registrirani_Korisnik`
6. Server generates JWT token
7. Server returns user object and token

### Login Flow

1. Client sends POST request to `/api/v1/auth/login` with credentials
2. Server validates email format
3. Server finds user by email
4. Server checks if user is active
5. Server verifies password against stored hash
6. Server generates JWT token
7. Server returns user object and token

### Authenticated Request Flow

1. Client includes JWT token in Authorization header: `Bearer <token>`
2. Server extracts and verifies token
3. Server attaches user information to request object
4. Server processes request with user context
5. Server returns response

### Logout Flow

1. Client sends POST request to `/api/v1/auth/logout` with JWT token
2. Server verifies token
3. Server returns success message
4. Client removes token from storage

**Note:** Current implementation uses stateless JWT. For server-side token invalidation, implement a token blacklist using Redis or database.

---

## Password Requirements

- **Minimum Length:** 8 characters
- **Maximum Length:** 128 characters
- **Must Contain:**
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one digit (0-9)

---

## JWT Token Details

- **Algorithm:** HS256 (HMAC with SHA-256)
- **Expiry:** 24 hours (configurable via `JWT_EXPIRY` environment variable)
- **Issuer:** flowops-platform
- **Payload Fields:**
  - `userId`: User's unique identifier
  - `email`: User's email address
  - `role`: User's role (Posjetitelj, Registrirani_Korisnik, Tehničar, Administrator)
  - `iat`: Issued at timestamp
  - `exp`: Expiration timestamp
  - `sub`: Subject (user ID)

---

## Security Considerations

1. **Password Storage:** Passwords are hashed using bcrypt with 10 salt rounds
2. **Token Security:** JWT tokens are signed with a secret key
3. **HTTPS Required:** All authentication endpoints should use HTTPS in production
4. **Rate Limiting:** Authentication endpoints are protected by rate limiting
5. **Input Validation:** All inputs are validated and sanitized
6. **SQL Injection Prevention:** Parameterized queries via Supabase client
7. **XSS Prevention:** Output sanitization for all user-generated content

---

## Error Message Localization

All error messages are returned in Croatian (hr-HR) as per requirement 20.1:

- Registration errors: Croatian validation messages
- Login errors: Croatian error messages
- Token errors: Croatian session expiry messages
- Authorization errors: Croatian access denial messages

---

## Requirements Coverage

This implementation satisfies the following requirements:

- **1.1:** User authentication with valid credentials creates a session (JWT token)
- **1.2:** Invalid credentials are rejected with Croatian error message
- **1.3:** Passwords are hashed using bcrypt before storage
- **9.4:** REST API returns 400 for malformed requests with JSON error details
- **9.5:** REST API returns 401 for unauthorized requests with error message
- **20.1:** Validation errors display in Croatian

---

## Testing

### Manual Testing with curl

**Register:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@flowops.hr","password":"TestPassword123","firstName":"Test","lastName":"User"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@flowops.hr","password":"TestPassword123"}'
```

**Get Profile:**
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Logout:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Automated Testing

Run the test suite:
```bash
cd backend
node test-auth.js
```

---

## Environment Variables

Required environment variables for authentication:

```env
# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRY=24h

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
```

---

## Future Enhancements

1. **Token Blacklist:** Implement server-side token invalidation using Redis
2. **Refresh Tokens:** Add refresh token functionality for extended sessions
3. **Two-Factor Authentication:** Add 2FA support
4. **OAuth Integration:** Add social login (Google, GitHub, etc.)
5. **Password Reset:** Implement forgot password functionality
6. **Email Verification:** Add email verification for new registrations
7. **Login History:** Track and display user login history
8. **Session Management:** Allow users to view and revoke active sessions
