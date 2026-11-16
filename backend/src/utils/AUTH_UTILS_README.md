# Authentication Utilities Documentation

## Overview

This module provides password hashing and validation utilities for the FlowOps platform, implementing requirements 1.3 (secure password storage) and 11.5 (bcrypt hashing).

## Files

- `auth.js` - Main authentication utilities module
- `auth.test.js` - Comprehensive unit tests

## Features

### Password Hashing
- Uses bcrypt with 12 salt rounds for secure password hashing
- Each password hash is unique due to automatic salting
- Resistant to rainbow table attacks

### Password Validation
- Enforces strong password complexity requirements
- Provides user-friendly error messages in Croatian
- Supports both detailed validation and quick regex check

## API Reference

### `hashPassword(plainPassword)`

Hashes a plain text password using bcrypt.

**Parameters:**
- `plainPassword` (string) - The plain text password to hash

**Returns:**
- Promise<string> - The hashed password

**Throws:**
- Error if password is invalid or hashing fails

**Example:**
```javascript
import { hashPassword } from './utils/auth.js';

const hash = await hashPassword('SecurePass123!');
// Returns: $2b$12$randomsaltandhash...
```

### `verifyPassword(plainPassword, hashedPassword)`

Verifies a plain text password against a hashed password.

**Parameters:**
- `plainPassword` (string) - The plain text password to verify
- `hashedPassword` (string) - The hashed password to compare against

**Returns:**
- Promise<boolean> - True if passwords match, false otherwise

**Throws:**
- Error if verification fails due to invalid inputs

**Example:**
```javascript
import { verifyPassword } from './utils/auth.js';

const isValid = await verifyPassword('SecurePass123!', storedHash);
if (isValid) {
  // Password is correct
}
```

### `validatePasswordComplexity(password)`

Validates password against complexity requirements with detailed error messages.

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one digit (0-9)
- At least one special character (@$!%*?&)

**Parameters:**
- `password` (string) - The password to validate

**Returns:**
- Object with:
  - `isValid` (boolean) - Whether password meets all requirements
  - `errors` (string[]) - Array of error messages in Croatian

**Example:**
```javascript
import { validatePasswordComplexity } from './utils/auth.js';

const result = validatePasswordComplexity('weak');
console.log(result.isValid); // false
console.log(result.errors);
// [
//   'Lozinka mora imati najmanje 8 znakova',
//   'Lozinka mora sadržavati barem jedno veliko slovo',
//   'Lozinka mora sadržavati barem jednu znamenku',
//   'Lozinka mora sadržavati barem jedan poseban znak (@$!%*?&)'
// ]
```

### `isPasswordValid(password)`

Quick validation using regex pattern. Returns boolean only.

**Parameters:**
- `password` (string) - The password to validate

**Returns:**
- boolean - True if password meets all requirements

**Example:**
```javascript
import { isPasswordValid } from './utils/auth.js';

if (isPasswordValid(password)) {
  // Password is valid
}
```

### `AUTH_CONSTANTS`

Exported constants for configuration and testing.

**Properties:**
- `SALT_ROUNDS` (number) - Bcrypt salt rounds (12)
- `PASSWORD_REGEX` (RegExp) - Password validation regex pattern

## Error Messages (Croatian)

All error messages are provided in Croatian for consistent user experience:

- `Lozinka mora biti tekst` - Password must be text
- `Lozinka mora imati najmanje 8 znakova` - Password must have at least 8 characters
- `Lozinka mora sadržavati barem jedno veliko slovo` - Password must contain at least one uppercase letter
- `Lozinka mora sadržavati barem jedno malo slovo` - Password must contain at least one lowercase letter
- `Lozinka mora sadržavati barem jednu znamenku` - Password must contain at least one digit
- `Lozinka mora sadržavati barem jedan poseban znak (@$!%*?&)` - Password must contain at least one special character

## Usage Example - Registration Flow

```javascript
import { validatePasswordComplexity, hashPassword } from './utils/auth.js';

async function registerUser(email, password, firstName, lastName) {
  // 1. Validate password complexity
  const validation = validatePasswordComplexity(password);
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  // 2. Hash the password
  const passwordHash = await hashPassword(password);

  // 3. Store user in database
  const user = await db.users.create({
    email,
    password_hash: passwordHash,
    first_name: firstName,
    last_name: lastName,
    role: 'Registrirani_Korisnik'
  });

  return {
    success: true,
    user
  };
}
```

## Usage Example - Login Flow

```javascript
import { verifyPassword } from './utils/auth.js';

async function loginUser(email, password) {
  // 1. Fetch user from database
  const user = await db.users.findOne({ email });
  if (!user) {
    return {
      success: false,
      error: 'Neispravna e-mail adresa ili lozinka'
    };
  }

  // 2. Verify password
  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    return {
      success: false,
      error: 'Neispravna e-mail adresa ili lozinka'
    };
  }

  // 3. Generate JWT token
  const token = generateToken(user);

  return {
    success: true,
    user,
    token
  };
}
```

## Security Considerations

1. **Salt Rounds**: Set to 12 for good balance between security and performance
   - Higher values increase security but slow down hashing
   - Current setting takes ~100-300ms per hash on modern hardware

2. **Password Complexity**: Enforced requirements prevent weak passwords
   - Minimum 8 characters ensures reasonable entropy
   - Mix of character types prevents dictionary attacks
   - Special characters add extra complexity

3. **Generic Error Messages**: In production, use generic messages for login failures
   - Don't reveal whether email exists or password is wrong
   - Example: "Neispravna e-mail adresa ili lozinka" (Invalid email or password)

4. **Timing Attacks**: bcrypt comparison is timing-safe by design
   - Prevents attackers from determining password correctness via timing

5. **Rate Limiting**: Implement rate limiting on authentication endpoints
   - See `rateLimiter.js` middleware (task 35.1)

## Testing

Run unit tests with:
```bash
npm test src/utils/auth.test.js
```

Or using Node.js directly:
```bash
node --test src/utils/auth.test.js
```

Test coverage includes:
- Password hashing with various inputs
- Password verification with correct/incorrect passwords
- Validation of all complexity requirements
- Edge cases (null, undefined, empty strings, long passwords)
- Integration tests combining hash + verify

## Performance

Typical performance on modern hardware:
- `hashPassword()`: 100-300ms per operation
- `verifyPassword()`: 100-300ms per operation
- `validatePasswordComplexity()`: <1ms per operation
- `isPasswordValid()`: <1ms per operation

Note: Hashing is intentionally slow to prevent brute force attacks.

## Dependencies

- `bcrypt` (^6.0.0) - Password hashing library

## Requirements Fulfilled

✅ **Requirement 1.3**: THE FLOWOPS_System SHALL hash passwords using a secure algorithm before storage
- Implements bcrypt with 12 salt rounds
- Each hash is unique due to automatic salting

✅ **Requirement 11.5**: THE FLOWOPS_System SHALL store passwords as hashed values using bcrypt or similar algorithm
- Uses bcrypt for all password hashing
- Never stores plain text passwords

## Future Enhancements

Potential improvements for future iterations:
- Configurable salt rounds via environment variable
- Password strength meter for UI feedback
- Password history to prevent reuse
- Multi-factor authentication support
- Passwordless authentication options
