/**
 * useAuth Hook
 * Custom hook for accessing authentication context
 * Requirements: 1.1, 1.4
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

/**
 * Hook to access authentication context
 * Must be used within AuthProvider
 * 
 * @returns {Object} Authentication context value
 * @returns {Object|null} return.user - Current authenticated user
 * @returns {string|null} return.role - Current user role
 * @returns {boolean} return.isAuthenticated - Authentication status
 * @returns {boolean} return.isLoading - Loading state
 * @returns {string|null} return.error - Error message if any
 * @returns {Function} return.login - Login function (email, password)
 * @returns {Function} return.logout - Logout function
 * @returns {Function} return.register - Register function (userData)
 * @returns {Function} return.clearError - Clear error message
 * @returns {Function} return.refreshUser - Refresh user data from server
 * 
 * @example
 * const { user, login, logout, isAuthenticated } = useAuth();
 * 
 * @throws {Error} If used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;
