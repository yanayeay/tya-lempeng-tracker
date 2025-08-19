// hooks/useAuth.js
import { useState } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Login with username and password
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Promise<Object|null>} User object if successful, null if failed
   */
  const login = async (username, password) => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return null;
    }

    setLoading(true);
    setError('');

    try {
      const user = await authService.login(username, password);
      setCurrentUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout current user
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      setIsAuthenticated(false);
      setError('');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  /**
   * Clear authentication error
   */
  const clearError = () => {
    setError('');
  };

  /**
   * Set authentication state (useful for testing or initial setup)
   * @param {Object} user - User object
   */
  const setAuthenticatedUser = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setError('');
  };

  return {
    // State
    isAuthenticated,
    currentUser,
    loading,
    error,

    // Actions
    login,
    logout,
    clearError,
    setAuthenticatedUser,

    // Utilities
    setError // For external error setting if needed
  };
};