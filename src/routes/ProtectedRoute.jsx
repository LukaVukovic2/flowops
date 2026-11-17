/**
 * ProtectedRoute Component
 * Route guard that checks if user is authenticated
 * Redirects to login page when unauthenticated
 * Requirements: 1.6, 1.7
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

/**
 * ProtectedRoute - Wrapper component for routes requiring authentication
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {React.ReactElement} Children if authenticated, loading spinner while checking, or Navigate to login
 * 
 * @example
 * <ProtectedRoute>
 *   <DashboardPage />
 * </ProtectedRoute>
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-neutral-300">Učitavanje...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated, preserving the intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render children
  return children;
};

export default ProtectedRoute;
