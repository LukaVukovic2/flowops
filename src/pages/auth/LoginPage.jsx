/**
 * Login Page Component
 * User authentication page with email/password form
 * Requirements: 1.1, 1.2, 12.1, 12.6
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { loginSchema } from '../../schemas/authSchemas';
import { Button, Input } from '../../components/common';

/**
 * LoginPage Component
 * Displays login form with validation
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading, error: authError, clearError } = useAuth();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
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
      await login(data.email, data.password);
      // Navigation happens automatically via useEffect when isAuthenticated changes
    } catch (error) {
      // Error is already set in AuthContext, but we can display it locally too
      const errorMessage = error.response?.data?.message || 'Greška pri prijavi. Provjerite email i lozinku.';
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
              <LogIn className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white">
            Prijava
          </h1>
          <p className="mt-2 text-gray-400">
            Prijavite se na FlowOps platformu
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Display server errors */}
            {displayError && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg" role="alert">
                <p className="text-sm">{displayError}</p>
              </div>
            )}

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

            {/* Forgot password link */}
            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Zaboravili ste lozinku?
              </Link>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
              loading={isLoading}
            >
              {isLoading ? 'Prijavljivanje...' : 'Prijavi se'}
            </Button>
          </form>

          {/* Register link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Nemate račun?{' '}
              <Link
                to="/register"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Registrirajte se
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

export default LoginPage;
