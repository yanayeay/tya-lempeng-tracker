// utils/permissions.js

/**
 * Check if a tab is accessible for a user
 * @param {string} activeTab - Tab ID to check
 * @param {Function} hasPermissionFn - Permission checking function
 * @returns {boolean} True if tab is accessible
 */
export const checkTabAccess = (activeTab, hasPermissionFn) => {
  const tabPermissions = {
    dashboard: () => hasPermissionFn('dashboard', 'viewDashboard'),
    transactions: () => hasPermissionFn('transactions', 'viewTransactions'),
    orders: () => hasPermissionFn('orders', 'viewOrders'),
    categories: () => hasPermissionFn('transactions', 'viewTransactions'),
    admin: () => hasPermissionFn('admin', 'viewAdmin')
  };

  return tabPermissions[activeTab] ? tabPermissions[activeTab]() : false;
};

/**
 * Get all accessible tabs for a user
 * @param {Function} hasPermissionFn - Permission checking function
 * @returns {Array} Array of accessible tab IDs
 */
export const getAccessibleTabs = (hasPermissionFn) => {
  const tabs = [
    { id: 'dashboard', permission: () => hasPermissionFn('dashboard', 'viewDashboard') },
    { id: 'transactions', permission: () => hasPermissionFn('transactions', 'viewTransactions') },
    { id: 'orders', permission: () => hasPermissionFn('orders', 'viewOrders') },
    { id: 'categories', permission: () => hasPermissionFn('transactions', 'viewTransactions') },
    { id: 'admin', permission: () => hasPermissionFn('admin', 'viewAdmin') }
  ];

  return tabs.filter(tab => tab.permission()).map(tab => tab.id);
};

/**
 * Get the default accessible tab for a user
 * @param {Function} hasPermissionFn - Permission checking function
 * @returns {string|null} Default tab ID or null
 */
export const getDefaultTab = (hasPermissionFn) => {
  const priorities = ['dashboard', 'transactions', 'orders','categories', 'admin'];

  for (const tabId of priorities) {
    if (checkTabAccess(tabId, hasPermissionFn)) {
      return tabId;
    }
  }

  return null; // No accessible tabs
};

/**
 * Create a permission checker function for a specific user
 * @param {string} userRole - User's role
 * @param {Object} rolePermissions - Role permissions object
 * @returns {Function} Permission checking function
 */
export const createPermissionChecker = (userRole, rolePermissions) => {
  return (category, permission) => {
    if (!userRole) return false;
    return rolePermissions[userRole]?.[category]?.[permission] || false;
  };
};

/**
 * Count total permissions for a role
 * @param {Object} rolePermissions - Role permissions object
 * @param {string} role - Role name
 * @returns {number} Total number of permissions
 */
export const countRolePermissions = (rolePermissions, role) => {
  if (!rolePermissions[role]) return 0;

  return Object.values(rolePermissions[role]).reduce((total, category) => {
    return total + Object.values(category).filter(Boolean).length;
  }, 0);
};

/**
 * Get permission summary for a role
 * @param {Object} rolePermissions - Role permissions object
 * @param {string} role - Role name
 * @returns {Object} Permission summary by category
 */
export const getPermissionSummary = (rolePermissions, role) => {
  if (!rolePermissions[role]) return {};

  const summary = {};

  Object.entries(rolePermissions[role]).forEach(([category, permissions]) => {
    summary[category] = Object.values(permissions).filter(Boolean).length;
  });

  return summary;
};