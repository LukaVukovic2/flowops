/**
 * Authentication Validation Schemas
 * Zod schemas for login and registration forms
 * Requirements: 1.1, 1.2, 12.1, 12.6, 12.8
 */

import { z } from 'zod';

/**
 * Login schema
 * Validates email and password for login form
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email je obavezan')
    .email('Unesite valjanu email adresu'),
  password: z
    .string()
    .min(1, 'Lozinka je obavezna')
});

/**
 * Registration schema
 * Validates all fields for user registration
 */
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email je obavezan')
    .email('Unesite valjanu email adresu'),
  password: z
    .string()
    .min(8, 'Lozinka mora imati najmanje 8 znakova')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Lozinka mora sadržavati malo slovo, veliko slovo i broj'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Potvrdite lozinku'),
  firstName: z
    .string()
    .min(1, 'Ime je obavezno')
    .max(100, 'Ime može imati najviše 100 znakova'),
  lastName: z
    .string()
    .min(1, 'Prezime je obavezno')
    .max(100, 'Prezime može imati najviše 100 znakova')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Lozinke se ne podudaraju',
  path: ['confirmPassword']
});

/**
 * Password reset request schema
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email je obavezan')
    .email('Unesite valjanu email adresu')
});

/**
 * Password reset schema
 */
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Lozinka mora imati najmanje 8 znakova')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Lozinka mora sadržavati malo slovo, veliko slovo i broj'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Potvrdite lozinku')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Lozinke se ne podudaraju',
  path: ['confirmPassword']
});
