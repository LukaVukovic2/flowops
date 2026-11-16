/**
 * Integration Example: Authentication Flow
 * Demonstrates how password hashing and JWT utilities work together
 * 
 * This file is for demonstration purposes and shows the complete
 * authentication flow from registration to authenticated requests.
 */

import { hashPassword, verifyPassword, validatePasswordComplexity } from './auth.js';
import { generateToken, verifyToken, extractTokenFromHeader } from './jwt.js';

/**
 * Example 1: User Registration
 * Validates password complexity and stores hashed password
 */
async function exampleRegistration() {
  console.log('\n=== Example 1: User Registration ===\n');

  const userData = {
    email: 'novi.korisnik@flowops.com',
    password: 'SecurePass123!',
    firstName: 'Ivan',
    lastName: 'Horvat',
    role: 'Registrirani_Korisnik'
  };

  // Step 1: Validate password complexity
  const validation = validatePasswordComplexity(userData.password);
  
  if (!validation.isValid) {
    console.error('Greške validacije lozinke:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    return null;
  }
  
  console.log('✓ Lozinka zadovoljava sve zahtjeve');

  // Step 2: Hash the password
  const passwordHash = await hashPassword(userData.password);
  console.log('✓ Lozinka je hashirana');
  console.log(`  Hash: ${passwordHash.substring(0, 30)}...`);

  // Step 3: Store user in database (simulated)
  const user = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: userData.email,
    passwordHash: passwordHash,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: userData.role,
    createdAt: new Date()
  };

  console.log('✓ Korisnik spremljen u bazu podataka');
  console.log(`  ID: ${user.id}`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Uloga: ${user.role}`);

  return user;
}

/**
 * Example 2: User Login
 * Verifies password and generates JWT token
 */
async function exampleLogin(storedUser, providedPassword) {
  console.log('\n=== Example 2: User Login ===\n');

  console.log(`Pokušaj prijave: ${storedUser.email}`);

  // Step 1: Verify password
  const isPasswordCorrect = await verifyPassword(providedPassword, storedUser.passwordHash);

  if (!isPasswordCorrect) {
    console.error('✗ Netočna lozinka');
    return null;
  }

  console.log('✓ Lozinka je točna');

  // Step 2: Generate JWT token
  const token = generateToken({
    userId: storedUser.id,
    email: storedUser.email,
    role: storedUser.role
  });

  console.log('✓ JWT token generiran');
  console.log(`  Token: ${token.substring(0, 50)}...`);

  // Step 3: Return token to client
  const loginResponse = {
    user: {
      id: storedUser.id,
      email: storedUser.email,
      role: storedUser.role,
      firstName: storedUser.firstName,
      lastName: storedUser.lastName
    },
    token: token
  };

  console.log('✓ Prijava uspješna');

  return loginResponse;
}

/**
 * Example 3: Authenticated Request
 * Client sends request with token in Authorization header
 */
function exampleAuthenticatedRequest(token) {
  console.log('\n=== Example 3: Authenticated Request ===\n');

  // Step 1: Client creates Authorization header
  const authHeader = `Bearer ${token}`;
  console.log('Klijent šalje zahtjev s Authorization headerom');

  // Step 2: Server extracts token
  const extractedToken = extractTokenFromHeader(authHeader);
  
  if (!extractedToken) {
    console.error('✗ Token nije pronađen u headeru');
    return null;
  }

  console.log('✓ Token ekstrahiran iz headera');

  // Step 3: Server verifies token
  try {
    const decoded = verifyToken(extractedToken);
    console.log('✓ Token verificiran');
    console.log(`  User ID: ${decoded.userId}`);
    console.log(`  Email: ${decoded.email}`);
    console.log(`  Uloga: ${decoded.role}`);
    console.log(`  Izdano: ${new Date(decoded.iat * 1000).toLocaleString('hr-HR')}`);
    console.log(`  Ističe: ${new Date(decoded.exp * 1000).toLocaleString('hr-HR')}`);

    return {
      authenticated: true,
      user: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      }
    };
  } catch (error) {
    console.error(`✗ Greška pri verifikaciji: ${error.message}`);
    return null;
  }
}

/**
 * Example 4: Role-Based Access Control
 * Check if user has permission for specific action
 */
function exampleRoleCheck(userRole, requiredRoles) {
  console.log('\n=== Example 4: Role-Based Access Control ===\n');

  console.log(`Uloga korisnika: ${userRole}`);
  console.log(`Potrebne uloge: ${requiredRoles.join(', ')}`);

  const hasAccess = requiredRoles.includes(userRole);

  if (hasAccess) {
    console.log('✓ Pristup odobren');
  } else {
    console.log('✗ Pristup odbijen - nedovoljne ovlasti');
  }

  return hasAccess;
}

/**
 * Example 5: Failed Login Attempt
 * Shows what happens with incorrect password
 */
async function exampleFailedLogin(storedUser) {
  console.log('\n=== Example 5: Failed Login Attempt ===\n');

  const wrongPassword = 'WrongPassword123!';
  console.log(`Pokušaj prijave s netočnom lozinkom`);

  const isPasswordCorrect = await verifyPassword(wrongPassword, storedUser.passwordHash);

  if (!isPasswordCorrect) {
    console.log('✗ Autentifikacija neuspješna - netočna lozinka');
    return null;
  }

  return true;
}

/**
 * Example 6: Invalid Token
 * Shows what happens with tampered or expired token
 */
function exampleInvalidToken() {
  console.log('\n=== Example 6: Invalid Token ===\n');

  const invalidToken = 'invalid.jwt.token';
  console.log('Pokušaj verifikacije neispravnog tokena');

  try {
    verifyToken(invalidToken);
    console.log('Token je valjan (ne bi se trebalo dogoditi)');
  } catch (error) {
    console.log(`✗ Token odbijen: ${error.message}`);
  }
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  FlowOps Authentication Flow - Integration Demo  ║');
  console.log('╚══════════════════════════════════════════════════╝');

  try {
    // Example 1: Register a new user
    const registeredUser = await exampleRegistration();
    
    if (!registeredUser) {
      console.error('\nRegistracija neuspješna. Primjeri zaustavljeni.');
      return;
    }

    // Example 2: Login with correct password
    const loginResponse = await exampleLogin(registeredUser, 'SecurePass123!');
    
    if (!loginResponse) {
      console.error('\nPrijava neuspješna. Primjeri zaustavljeni.');
      return;
    }

    // Example 3: Make authenticated request
    const authResult = exampleAuthenticatedRequest(loginResponse.token);
    
    if (!authResult) {
      console.error('\nAuthentikacija neuspješna. Primjeri zaustavljeni.');
      return;
    }

    // Example 4: Check role-based access
    exampleRoleCheck('Registrirani_Korisnik', ['Registrirani_Korisnik', 'Tehničar', 'Administrator']);
    exampleRoleCheck('Registrirani_Korisnik', ['Administrator']);

    // Example 5: Failed login attempt
    await exampleFailedLogin(registeredUser);

    // Example 6: Invalid token
    exampleInvalidToken();

    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║  All Examples Completed Successfully             ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n✗ Greška pri izvođenju primjera:', error.message);
    console.error(error.stack);
  }
}

/**
 * Example API Endpoint Implementations
 * Shows how to use these utilities in Express routes
 */
export const exampleEndpoints = {
  /**
   * POST /api/v1/auth/register
   * Register a new user
   */
  register: async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    // Validate password
    const validation = validatePasswordComplexity(password);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Nevažeća lozinka',
        errors: validation.errors
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Save user to database (simplified)
    const user = {
      id: 'generated-uuid',
      email,
      passwordHash,
      firstName,
      lastName,
      role: 'Registrirani_Korisnik'
    };

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token
    });
  },

  /**
   * POST /api/v1/auth/login
   * Login existing user
   */
  login: async (req, res) => {
    const { email, password } = req.body;

    // Find user in database (simplified)
    const user = await findUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({
        error: 'Neautorizirani pristup',
        message: 'Netočni pristupni podaci'
      });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    
    if (!isValid) {
      return res.status(401).json({
        error: 'Neautorizirani pristup',
        message: 'Netočni pristupni podaci'
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token
    });
  }
};

// Simplified database function (would be replaced with actual Supabase query)
async function findUserByEmail(email) {
  // This would query Supabase in real implementation
  return null;
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}
