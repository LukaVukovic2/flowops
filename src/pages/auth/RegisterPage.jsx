/**
 * Register Page Component
 * User registration page with complete signup form
 * Requirements: 1.1, 1.2, 12.1, 12.6
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { registerSchema } from '../../schemas/authSchemas';
import { Button, Input } from '../../components/common';

/**
 * RegisterPage Component
 * Displays registration form with validation
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser, isAuthenticated, isLoading: authLoading, error: authError, clearError } = useAuth();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: ''
    }
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
      setServerError(null);
    };
  }, [clearError]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data) => {
    try {
      setServerError(null);
      
      // Prepare user data (exclude confirmPassword)
      const { confirmPassword, ...userData } = data;
      
      await registerUser(userData);
      // Navigation happens automatically via useEffect when isAuthenticated changes
    } catch (error) {
      // Error is already set in AuthContext, but we can display it locally too
      const errorMessage = error.response?.data?.message || 'Greška pri registraciji. Pokušajte ponovno.';
      setServerError(errorMessage);
    }
  };

  const isLoading = isSubmitting || authLoading;
  const displayError = serverError || authError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-full">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white">
            Registracija
          </h1>
          <p className="mt-2 text-gray-400">
            Stvorite novi račun na FlowOps platformi
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Display server errors */}
            {displayError && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg" role="alert">
                <p className="text-sm">{displayError}</p>
              </div>
            )}

            {/* First name field */}
            <Input
              label="Ime"
              name="firstName"
              type="text"
              placeholder="Vaše ime"
              required
              error={errors.firstName?.message}
              disabled={isLoading}
              {...register('firstName')}
            />

            {/* Last name field */}
            <Input
              label="Prezime"
              name="lastName"
              type="text"
              placeholder="Vaše prezime"
              required
              error={errors.lastName?.message}
              disabled={isLoading}
              {...register('lastName')}
            />

            {/* Email field */}
            <Input
              label="Email adresa"
              name="email"
              type="email"
              placeholder="ime@primjer.com"
              required
              error={errors.email?.message}
              disabled={isLoading}
              {...register('email')}
            />

            {/* Password field */}
            <Input
              label="Lozinka"
              name="password"
              type="password"
              placeholder="Unesite lozinku"
              required
              error={errors.password?.message}
              disabled={isLoading}
              {...register('password')}
            />

            {/* Confirm password field */}
            <Input
              label="Potvrda lozinke"
              name="confirmPassword"
              type="password"
              placeholder="Potvrdite lozinku"
              required
              error={errors.confirmPassword?.message}
              disabled={isLoading}
              {...register('confirmPassword')}
            />

            {/* Password requirements */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1 font-medium">Zahtjevi za lozinku:</p>
              <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                <li>Najmanje 8 znakova</li>
                <li>Jedno malo slovo (a-z)</li>
                <li>Jedno veliko slovo (A-Z)</li>
                <li>Jedan broj (0-9)</li>
              </ul>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
              loading={isLoading}
            >
              {isLoading ? 'Registracija u tijeku...' : 'Registriraj se'}
            </Button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Već imate račun?{' '}
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Prijavite se
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm">
          &copy; 2024 FlowOps. Sva prava pridržana.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
