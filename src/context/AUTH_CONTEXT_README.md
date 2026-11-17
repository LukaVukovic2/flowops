# Authentication Context & Hooks

This document describes the authentication system implementation for FlowOps Platform, including the AuthContext, useAuth hook, and related services.

## Overview

The authentication system provides:
- User registration and login
- JWT token management with automatic injection
- Automatic token expiry handling (24-hour expiry)
- Token refresh on page reload
- Secure localStorage-based token storage
- Role-based access control foundation

## Architecture

### Components

1. **api.js** - Base Axios client with JWT token injection
2. **authService.js** - Authentication API service layer
3. **AuthContext.jsx** - React Context for global auth state
4. **useAuth.js** - Custom hook for accessing auth context

## Usage

### 1. Setup AuthProvider

Wrap your application with the `AuthProvider` in your root component:

```jsx
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}
```

### 2. Use the useAuth Hook

Access authentication state and functions in any component:

```jsx
import { useAuth } from './hooks/useAuth';

function LoginForm() {
  const { login, isLoading, error, isAuthenticated } = useAuth();

  const handleSubmit = async (email, password) => {
    try {
      await login(email, password);
      // User is now logged in
    } catch (error) {
      // Handle error
    }
  };

  return (
    // Your form JSX
  );
}
```

### 3. Check Authentication Status

```jsx
function ProtectedComponent() {
  const { isAuthenticated, user, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <p>Dobrodošli, {user.email}</p>
      <p>Uloga: {role}</p>
    </div>
  );
}
```

## API Reference

### useAuth Hook

Returns an object with the following properties and methods:

#### State Properties

- **user** (Object | null) - Current authenticated user
  ```js
  {
    id: string,
    email: string,
    role: string,
    firstName?: string,
    lastName?: string
  }
  ```

- **role** (string | null) - User role
  - `'Posjetitelj'` - Visitor (public access)
  - `'Registrirani_Korisnik'` - Registered User
  - `'Tehničar'` - Technician/Editor
  - `'Administrator'` - Administrator

- **isAuthenticated** (boolean) - Whether user is logged in

- **isLoading** (boolean) - Loading state during async operations

- **error** (string | null) - Error message in Croatian

#### Methods

- **login(email, password)**
  - Authenticate user and store token
  - Returns: Promise<User>
  - Throws: Error with Croatian message on failure

- **register(userData)**
  - Register new user account
  - Parameters:
    ```js
    {
      email: string,
      password: string,
      firstName?: string,
      lastName?: string
    }
    ```
  - Returns: Promise<User>
  - Throws: Error with Croatian message on failure

- **logout()**
  - Log out user and clear token
  - Returns: Promise<void>

- **clearError()**
  - Clear error message
  - Returns: void

- **refreshUser()**
  - Refresh user data from server
  - Returns: Promise<User>

## Token Management

### Automatic Token Injection

All API requests automatically include the JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

This is handled by the Axios request interceptor in `api.js`.

### Token Storage

Tokens are stored in `localStorage`:
- Key: `'authToken'`
- Format: JWT string

User data is also stored for quick access:
- Key: `'user'`
- Format: JSON string of user object

### Token Expiry

- Tokens expire after 24 hours (configured on backend)
- When a token expires (401 response), the system:
  1. Clears token from localStorage
  2. Clears user state
  3. Dispatches `'auth:token-expired'` event
  4. Sets error message in Croatian
  5. User must log in again

### Token Refresh on Page Load

When the page loads:
1. Check if token exists in localStorage
2. If token exists, verify it with backend (`GET /api/v1/auth/me`)
3. If valid, restore user state
4. If invalid, clear token and require re-login

## Error Handling

All errors are displayed in Croatian. Common error messages:

- `"Neispravne vjerodajnice"` - Invalid credentials
- `"Korisnik već postoji"` - User already exists
- `"Vaša sesija je istekla. Molimo prijavite se ponovno."` - Session expired
- `"Greška pri prijavi"` - Login error
- `"Greška pri registraciji"` - Registration error

## Security Features

1. **Password Complexity** - Validated on backend
2. **HTTPS Only** - Enforced in production
3. **JWT Signatures** - All tokens verified on backend
4. **Automatic Logout** - On token expiry
5. **Rate Limiting** - Applied to auth endpoints on backend
6. **XSS Protection** - No sensitive data in HTML
7. **CSRF Protection** - JWT tokens don't use cookies

## Testing

Run tests with:

```bash
npm test
```

Test files:
- `src/services/authService.test.js` - Service layer tests
- `src/context/AuthContext.test.jsx` - Context tests
- `src/hooks/useAuth.test.jsx` - Hook tests

All tests include:
- Unit tests for each function
- Integration tests for auth flow
- Error handling tests
- Token expiry tests

## Backend Integration

The system integrates with these backend endpoints:

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Authenticate user
- `POST /api/v1/auth/logout` - Logout (optional)
- `GET /api/v1/auth/me` - Get current user profile

## Configuration

Set the API base URL in `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Default: `http://localhost:3000`

## Requirements Satisfied

This implementation satisfies the following requirements:

- **1.1** - User authentication with session creation
- **1.2** - Credential validation with Croatian error messages
- **1.4** - Session expiry after 24 hours
- **1.5** - Role assignment to authenticated users
- **1.6** - Unauthorized access handling with Croatian errors
- **11.7** - JWT token verification
- **11.11** - Session expiry after 24 hours

## Next Steps

After implementing the authentication system, the next tasks are:

1. **5.2** - Build login and registration pages (UI components)
2. **5.3** - Create protected route components (route guards)
3. **6.1** - User management backend API (admin functions)
4. **6.2** - User management UI (admin panel)
