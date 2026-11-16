/**
 * Authentication Routes
 * Implements requirements 1.1, 1.2, 9.4, 9.5, and 20.1
 * 
 * Provides authentication endpoints:
 * - POST /api/v1/auth/register - User registration
 * - POST /api/v1/auth/login - User authentication
 * - POST /api/v1/auth/logout - User logout (optional token blacklist)
 * - GET /api/v1/auth/me - Get current user profile
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { hashPassword, verifyPassword, validatePasswordComplexity } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { authMiddleware } from '../middleware/auth.js';
import supabase from '../config/database.js';

const router = express.Router();

/**
 * POST /api/v1/auth/register
 * Register a new user account
 * Access: Public
 */
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Neispravan format e-mail adrese')
      .normalizeEmail(),
    body('password')
      .exists()
      .withMessage('Lozinka je obavezna'),
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Ime može imati najviše 100 znakova'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Prezime može imati najviše 100 znakova')
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Greška validacije',
          message: errors.array()[0].msg,
          errors: errors.array()
        });
      }

      const { email, password, firstName, lastName } = req.body;

      // Validate password complexity
      const passwordValidation = validatePasswordComplexity(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          error: 'Greška validacije lozinke',
          message: passwordValidation.errors[0],
          errors: passwordValidation.errors
        });
      }

      // Check if user already exists
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(400).json({
          error: 'Korisnik već postoji',
          message: 'Korisnik s tom e-mail adresom već je registriran'
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user with default role
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email,
          password_hash: passwordHash,
          role: 'Registrirani_Korisnik',
          first_name: firstName || null,
          last_name: lastName || null,
          is_active: true
        })
        .select('id, email, role, first_name, last_name, created_at')
        .single();

      if (createError) {
        console.error('User creation error:', createError);
        return res.status(500).json({
          error: 'Greška pri registraciji',
          message: 'Došlo je do greške prilikom kreiranja korisničkog računa'
        });
      }

      // Generate JWT token
      const token = generateToken({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role
      });

      // Return user and token
      res.status(201).json({
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          createdAt: newUser.created_at
        },
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Interna greška poslužitelja',
        message: 'Došlo je do greške prilikom registracije'
      });
    }
  }
);

/**
 * POST /api/v1/auth/login
 * Authenticate user and return JWT token
 * Access: Public
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Neispravan format e-mail adrese')
      .normalizeEmail(),
    body('password')
      .exists()
      .withMessage('Lozinka je obavezna')
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Greška validacije',
          message: errors.array()[0].msg,
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const { data: user, error: findError } = await supabase
        .from('users')
        .select('id, email, password_hash, role, first_name, last_name, is_active')
        .eq('email', email)
        .single();

      if (findError || !user) {
        return res.status(401).json({
          error: 'Neispravne vjerodajnice',
          message: 'Neispravna e-mail adresa ili lozinka'
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({
          error: 'Račun deaktiviran',
          message: 'Vaš korisnički račun je deaktiviran'
        });
      }

      // Verify password
      const isPasswordValid = await verifyPassword(password, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Neispravne vjerodajnice',
          message: 'Neispravna e-mail adresa ili lozinka'
        });
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Return user and token
      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Interna greška poslužitelja',
        message: 'Došlo je do greške prilikom prijave'
      });
    }
  }
);

/**
 * POST /api/v1/auth/logout
 * Logout user (optional token blacklist implementation)
 * Access: Authenticated
 * 
 * Note: This is a placeholder for future token blacklist implementation.
 * With JWT stateless authentication, logout is primarily client-side (removing token).
 * For server-side token invalidation, implement a token blacklist in Redis or database.
 */
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // In a full implementation, you might:
    // 1. Add the token to a blacklist table with expiry
    // 2. Store the token in Redis with TTL matching token expiry
    // 3. Update user's last_logout timestamp
    
    // For now, return success - client should remove token
    res.status(200).json({
      message: 'Uspješno ste se odjavili'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Interna greška poslužitelja',
      message: 'Došlo je do greške prilikom odjave'
    });
  }
});

/**
 * GET /api/v1/auth/me
 * Get current authenticated user's profile
 * Access: Authenticated
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // User info is attached by authMiddleware
    const { userId } = req.user;

    // Fetch user details from database
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, email, role, first_name, last_name, is_active, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (findError || !user) {
      return res.status(404).json({
        error: 'Korisnik nije pronađen',
        message: 'Korisnički profil nije pronađen'
      });
    }

    // Return user profile
    res.status(200).json({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Interna greška poslužitelja',
      message: 'Došlo je do greške prilikom dohvaćanja profila'
    });
  }
});

export default router;
