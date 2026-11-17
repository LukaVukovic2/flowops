/**
 * Authentication Schemas Tests
 */

import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from './authSchemas';

describe('loginSchema', () => {
  it('validates correct login data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects empty email', () => {
    const invalidData = {
      email: '',
      password: 'password123'
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe('Email je obavezan');
  });

  it('rejects invalid email format', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'password123'
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe('Unesite valjanu email adresu');
  });

  it('rejects empty password', () => {
    const invalidData = {
      email: 'test@example.com',
      password: ''
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe('Lozinka je obavezna');
  });
});

describe('registerSchema', () => {
  it('validates correct registration data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      firstName: 'Ivan',
      lastName: 'Horvat'
    };

    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects password without uppercase letter', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      firstName: 'Ivan',
      lastName: 'Horvat'
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toContain('veliko slovo');
  });

  it('rejects password without lowercase letter', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'PASSWORD123',
      confirmPassword: 'PASSWORD123',
      firstName: 'Ivan',
      lastName: 'Horvat'
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toContain('malo slovo');
  });

  it('rejects password without number', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'PasswordABC',
      confirmPassword: 'PasswordABC',
      firstName: 'Ivan',
      lastName: 'Horvat'
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toContain('broj');
  });

  it('rejects password shorter than 8 characters', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'Pass1',
      confirmPassword: 'Pass1',
      firstName: 'Ivan',
      lastName: 'Horvat'
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toContain('8 znakova');
  });

  it('rejects mismatched passwords', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password456',
      firstName: 'Ivan',
      lastName: 'Horvat'
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe('Lozinke se ne podudaraju');
  });

  it('rejects empty first name', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      firstName: '',
      lastName: 'Horvat'
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe('Ime je obavezno');
  });

  it('rejects empty last name', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      firstName: 'Ivan',
      lastName: ''
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe('Prezime je obavezno');
  });

  it('rejects first name longer than 100 characters', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      firstName: 'A'.repeat(101),
      lastName: 'Horvat'
    };

    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toContain('100 znakova');
  });
});

describe('forgotPasswordSchema', () => {
  it('validates correct email', () => {
    const validData = {
      email: 'test@example.com'
    };

    const result = forgotPasswordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects empty email', () => {
    const invalidData = {
      email: ''
    };

    const result = forgotPasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe('Email je obavezan');
  });

  it('rejects invalid email format', () => {
    const invalidData = {
      email: 'invalid-email'
    };

    const result = forgotPasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe('Unesite valjanu email adresu');
  });
});

describe('resetPasswordSchema', () => {
  it('validates correct password reset data', () => {
    const validData = {
      password: 'NewPassword123',
      confirmPassword: 'NewPassword123'
    };

    const result = resetPasswordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const invalidData = {
      password: 'NewPassword123',
      confirmPassword: 'DifferentPassword123'
    };

    const result = resetPasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toBe('Lozinke se ne podudaraju');
  });

  it('rejects weak password', () => {
    const invalidData = {
      password: 'weak',
      confirmPassword: 'weak'
    };

    const result = resetPasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
