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
    if (hasPermission(userRole, 'categories', 'viewCategories')) tabs.push('categories');
    if (hasPermission(userRole, 'admin', 'viewAdmin')) tabs.push('admin');

    return tabs;
  };

  /**
   * Get the default tab for a user role
   * @param {string} userRole - User's role
   * @returns {string|null} Default tab ID or null
   */
  const getDefaultTab = (userRole) => {
    const priorities = ['dashboard', 'transactions', 'orders', 'categories', 'admin'];

    for (const tabId of priorities) {
      const permissions = {
        dashboard: () => hasPermission(userRole, 'dashboard', 'viewDashboard'),
        transactions: () => hasPermission(userRole, 'transactions', 'viewTransactions'),
        orders: () => hasPermission(userRole, 'orders', 'viewOrders'),
        categories: () => hasPermission(userRole, 'categories', 'viewCategories'),
        admin: () => hasPermission(userRole, 'admin', 'viewAdmin')
      };

      if (permissions[tabId] && permissions[tabId]()) {
        return tabId;
      }
    }

    return null; // No accessible tabs
  };

  /**
   * Category-specific permission helpers
   */
  const getCategoryPermissions = (userRole) => {
    return {
      canViewCategories: () => hasPermission(userRole, 'categories', 'viewCategories'),
      canAddCategories: () => hasPermission(userRole, 'categories', 'addCategories'),
      canEditCategories: () => hasPermission(userRole, 'categories', 'editCategories'),
      canDeleteCategories: () => hasPermission(userRole, 'categories', 'deleteCategories'),
      canManageCategories: () => hasPermission(userRole, 'categories', 'addCategories') || hasPermission(userRole, 'categories', 'editCategories') || hasPermission(userRole, 'categories', 'deleteCategories')
    };
  };

  /**
   * Transaction-specific permission helpers
   */
  const getTransactionPermissions = (userRole) => {
    return {
      canViewTransactions: () => hasPermission(userRole, 'transactions', 'viewTransactions'),
      canAddTransaction: () => hasPermission(userRole, 'transactions', 'addTransaction'),
      canEditTransaction: () => hasPermission(userRole, 'transactions', 'editTransaction'),
      canDeleteTransaction: () => hasPermission(userRole, 'transactions', 'deleteTransaction'),
      canFilterTransaction: () => hasPermission(userRole, 'transactions', 'filterTransaction'),
      canExportCSV: () => hasPermission(userRole, 'transactions', 'exportCSV')
    };
  };

  /**
   * Order-specific permission helpers
   */
  const getOrderPermissions = (userRole) => {
    return {
      canViewOrders: () => hasPermission(userRole, 'orders', 'viewOrders'),
      canAddOrder: () => hasPermission(userRole, 'orders', 'addOrder'),
      canEditOrder: () => hasPermission(userRole, 'orders', 'editOrder'),
      canDeleteOrder: () => hasPermission(userRole, 'orders', 'deleteOrder'),
      canFilterOrder: () => hasPermission(userRole, 'orders', 'filterOrder'),
      canExportOrderCSV: () => hasPermission(userRole, 'orders', 'exportOrderCSV')
    };
  };

  /**
   * Admin-specific permission helpers
   */
  const getAdminPermissions = (userRole) => {
    return {
      canViewAdmin: () => hasPermission(userRole, 'admin', 'viewAdmin'),
      canManageUser: () => hasPermission(userRole, 'admin', 'manageUser'),
      canManageAccess: () => hasPermission(userRole, 'admin', 'manageAccess'),
      canBackupData: () => hasPermission(userRole, 'admin', 'backupData'),
      canImportBackup: () => hasPermission(userRole, 'admin', 'importBackup'),
      canClearAllData: () => hasPermission(userRole, 'admin', 'clearAllData')
    };
  };

  /**
   * Dashboard-specific permission helpers
   */
  const getDashboardPermissions = (userRole) => {
    return {
      canViewDashboard: () => hasPermission(userRole, 'dashboard', 'viewDashboard')
    };
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
    getDefaultTab,

    // Permission helpers by category
    getCategoryPermissions,
    getTransactionPermissions,
    getOrderPermissions,
    getAdminPermissions,
    getDashboardPermissions
  };
};