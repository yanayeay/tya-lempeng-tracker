// hooks/usePermissions.js
import { useState, useEffect } from 'react';
import { permissionService } from '../services/permissionService';
import { DEFAULT_ROLE_PERMISSIONS } from '../config/rolePermissions';

export const usePermissions = () => {
  const [rolePermissions, setRolePermissions] = useState(DEFAULT_ROLE_PERMISSIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load permissions from database
   */
  const loadPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const permissions = await permissionService.loadRolePermissions();
      setRolePermissions(permissions);
    } catch (err) {
      setError('Failed to load permissions');
      console.error('Error loading permissions:', err);
      // Keep default permissions if database load fails
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if a user role has a specific permission
   * @param {string} userRole - User's role
   * @param {string} category - Permission category
   * @param {string} permission - Permission name
   * @returns {boolean} True if user has permission
   */
  const hasPermission = (userRole, category, permission) => {
    if (!userRole) return false;
    return rolePermissions[userRole]?.[category]?.[permission] || false;
  };

  /**
   * Update a role permission and save to database
   * @param {string} role - Role name
   * @param {string} category - Permission category
   * @param {string} permission - Permission name
   * @param {boolean} value - Permission value
   */
  const updateRolePermission = async (role, category, permission, value) => {
    // Update local state immediately for responsive UI
    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [category]: {
          ...prev[role][category],
          [permission]: value
        }
      }
    }));

    // Save to database
    try {
      await permissionService.saveRolePermission(role, category, permission, value);
    } catch (error) {
      console.error('Error saving permission:', error);
      setError('Failed to save permission changes');
      // Optionally revert local state on error
      await loadPermissions();
    }
  };

  /**
   * Get all permissions for a specific role
   * @param {string} role - Role name
   * @returns {Object} Role permissions
   */
  const getRolePermissions = (role) => {
    return rolePermissions[role] || {};
  };

  /**
   * Get accessible tabs for a user role
   * @param {string} userRole - User's role
   * @returns {Array} Array of accessible tab IDs
   */
  const getAccessibleTabs = (userRole) => {
    const tabs = [];

    if (hasPermission(userRole, 'dashboard', 'viewDashboard')) tabs.push('dashboard');
    if (hasPermission(userRole, 'transactions', 'viewTransactions')) tabs.push('transactions');
    if (hasPermission(userRole, 'orders', 'viewOrders')) tabs.push('orders');
    if (hasPermission(userRole, 'admin', 'viewAdmin')) tabs.push('admin');

    return tabs;
  };

  /**
   * Get the default tab for a user role
   * @param {string} userRole - User's role
   * @returns {string|null} Default tab ID or null
   */
  const getDefaultTab = (userRole) => {
    const priorities = ['dashboard', 'transactions', 'orders', 'admin'];

    for (const tabId of priorities) {
      const permissions = {
        dashboard: () => hasPermission(userRole, 'dashboard', 'viewDashboard'),
        transactions: () => hasPermission(userRole, 'transactions', 'viewTransactions'),
        orders: () => hasPermission(userRole, 'orders', 'viewOrders'),
        admin: () => hasPermission(userRole, 'admin', 'viewAdmin')
      };

      if (permissions[tabId] && permissions[tabId]()) {
        return tabId;
      }
    }

    return null; // No accessible tabs
  };

  /**
   * Clear any permission errors
   */
  const clearError = () => {
    setError(null);
  };

  // Load permissions on hook initialization
  useEffect(() => {
    loadPermissions();
  }, []);

  return {
    // State
    rolePermissions,
    loading,
    error,

    // Actions
    loadPermissions,
    updateRolePermission,
    clearError,

    // Utilities
    hasPermission,
    getRolePermissions,
    getAccessibleTabs,
    getDefaultTab
  };
};