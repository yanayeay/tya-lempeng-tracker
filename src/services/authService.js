// services/authService.js
import { supabase } from '../lib/supabase';

export const authService = {
  /**
   * Authenticate user with username and password
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Promise<Object>} User object if successful
   * @throws {Error} If authentication fails
   */
  async login(username, password) {
    try {
      // Fetch user from Supabase
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('active', true)
        .single();

      if (error || !users) {
        throw new Error('Invalid username or password');
      }

      // Compare with stored password (in production, you'd use bcrypt.compare)
      if (password === users.password_hash) {
        // Update last login timestamp
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', users.id);

        return users;
      } else {
        throw new Error('Invalid username or password');
      }
    } catch (err) {
      // Re-throw with consistent error message
      if (err.message === 'Invalid username or password') {
        throw err;
      }
      throw new Error('Login failed. Please try again.');
    }
  },

  /**
   * Logout user and clear any session data
   * @returns {Promise<void>}
   */
  async logout() {
    // Clear any local storage or session data if needed
    // For now, this is just a placeholder for future session management
    return Promise.resolve();
  },

  /**
   * Check if a username is available
   * @param {string} username - Username to check
   * @param {string} excludeUserId - User ID to exclude from check (for editing)
   * @returns {Promise<boolean>} True if username is available
   */
  async isUsernameAvailable(username, excludeUserId = null) {
    try {
      const query = supabase
        .from('users')
        .select('id')
        .eq('username', username.toLowerCase());

      if (excludeUserId) {
        query.neq('id', excludeUserId);
      }

      const { data } = await query;
      return !data || data.length === 0;
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  }
};