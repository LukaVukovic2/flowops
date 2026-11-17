/**
 * RoleRoute Component
 * Route guard that checks both authentication and role permissions
 * Redirects to login when unauthenticated
 * Displays Croatian error for unauthorized access attempts
 * Requirements: 1.6, 1.7
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

/**
 * RoleRoute - Wrapper component for routes requiring specific role permissions
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string|string[]} props.allowedRoles - Role(s) allowed to access this route
 * @returns {React.ReactElement} Children if authorized, error page if unauthorized, loading spinner while checking, or Navigate to login
 * 
 * @example
 * // Single role
 * <RoleRoute allowedRoles="Administrator">
 *   <AdminPanel />
 * </RoleRoute>
 * 
 * // Multiple roles
 * <RoleRoute allowedRoles={["Tehničar", "Administrator"]}>
 *   <TicketManagement />
 * </RoleRoute>
 */
export const RoleRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
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

  // Check if user has required role
  const userRole = user?.role;
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const hasRequiredRole = rolesArray.includes(userRole);

  // Display Croatian error message for unauthorized access
  if (!hasRequiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-900">
        <div className="max-w-md w-full mx-4">
          <div className="bg-neutral-800 rounded-lg p-8 text-center border border-neutral-700">
            <div className="mb-6">
              <svg
                className="w-16 h-16 mx-auto text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-500 mb-4">
              Nemate pristup
            </h2>
            <p className="text-neutral-300 mb-6">
              Nemate potrebne dozvole za pristup ovoj stranici.
            </p>
            <div className="text-sm text-neutral-400 mb-6">
              <p>
                Potrebna uloga: {rolesArray.join(' ili ')}
              </p>
              <p>
                Vaša uloga: {userRole || 'Nepoznata'}
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Natrag
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and has required role, render children
  return children;
};

export default RoleRoute;
