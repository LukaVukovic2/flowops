/**
 * Authentication Usage Example
 * 
 * This file demonstrates how to use the authentication system
 * in FlowOps Platform components.
 * 
 * This is an example file - not used in production.
 */

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * Example Login Component
 */
function LoginExample() {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);
      // Success - user is now logged in
      // Redirect or update UI
    } catch (err) {
      // Error is automatically set in context
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Prijava</h2>
      
      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            disabled={isLoading}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Lozinka</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Prijavljivanje...' : 'Prijavi se'}
        </button>
      </form>
    </div>
  );
}

/**
 * Example Register Component
 */
function RegisterExample() {
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    try {
      await register(formData);
      // Success - user is now registered and logged in
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Registracija</h2>
      
      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">E-mail</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            disabled={isLoading}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Lozinka</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            disabled={isLoading}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Ime</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            disabled={isLoading}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Prezime</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Registracija...' : 'Registriraj se'}
        </button>
      </form>
    </div>
  );
}

/**
 * Example User Profile Component
 */
function UserProfileExample() {
  const { user, role, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <p>Molimo prijavite se.</p>;
  }

  const handleLogout = async () => {
    try {
      await logout();
      // User is now logged out
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Profil korisnika</h2>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <p><strong>E-mail:</strong> {user.email}</p>
        <p><strong>Uloga:</strong> {role}</p>
        {user.firstName && (
          <p><strong>Ime:</strong> {user.firstName}</p>
        )}
        {user.lastName && (
          <p><strong>Prezime:</strong> {user.lastName}</p>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="w-full bg-red-500 text-white py-2 rounded"
      >
        Odjavi se
      </button>
    </div>
  );
}

/**
 * Example Protected Component
 * Shows how to check authentication and roles
 */
function ProtectedExample() {
  const { isAuthenticated, role, user } = useAuth();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="text-center mt-8">
        <p>Pristup odbijen. Molimo prijavite se.</p>
      </div>
    );
  }

  // Check if user has required role
  const canAccessAdminFeatures = role === 'Administrator' || role === 'Tehničar';

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Zaštićena stranica</h2>
      
      <p className="mb-4">Dobrodošli, {user.email}!</p>
      
      {canAccessAdminFeatures ? (
        <div className="bg-green-100 p-4 rounded">
          <p>Imate pristup administratorskim funkcijama.</p>
        </div>
      ) : (
        <div className="bg-yellow-100 p-4 rounded">
          <p>Nemate pristup administratorskim funkcijama.</p>
        </div>
      )}
    </div>
  );
}

/**
 * Example App with Authentication
 */
export function AuthExampleApp() {
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState('login');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          FlowOps Authentication Example
        </h1>

        {!isAuthenticated ? (
          <>
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setView('login')}
                className={`px-4 py-2 rounded ${
                  view === 'login' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                Prijava
              </button>
              <button
                onClick={() => setView('register')}
                className={`px-4 py-2 rounded ${
                  view === 'register' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                Registracija
              </button>
            </div>

            {view === 'login' && <LoginExample />}
            {view === 'register' && <RegisterExample />}
          </>
        ) : (
          <>
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setView('profile')}
                className={`px-4 py-2 rounded ${
                  view === 'profile' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                Profil
              </button>
              <button
                onClick={() => setView('protected')}
                className={`px-4 py-2 rounded ${
                  view === 'protected' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                Zaštićena stranica
              </button>
            </div>

            {view === 'profile' && <UserProfileExample />}
            {view === 'protected' && <ProtectedExample />}
          </>
        )}
      </div>
    </div>
  );
}

export default AuthExampleApp;
