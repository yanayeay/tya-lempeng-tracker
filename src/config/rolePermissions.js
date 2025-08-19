// config/rolePermissions.js
export const DEFAULT_ROLE_PERMISSIONS = {
  'Administrator': {
    dashboard: { viewDashboard: true },
    transactions: {
      viewTransactions: true, addTransaction: true, editTransaction: true,
      deleteTransaction: true, filterTransaction: true, exportCSV: true
    },
    orders: {
      viewOrders: true, addOrder: true, editOrder: true,
      deleteOrder: true, filterOrder: true, exportOrderCSV: true
    },
    admin: {
      viewAdmin: true, manageUser: true, manageAccess: true,
      backupData: true, importBackup: true, clearAllData: true
    }
  },
  'Manager': {
    dashboard: { viewDashboard: true },
    transactions: {
      viewTransactions: true, addTransaction: true, editTransaction: true,
      deleteTransaction: false, filterTransaction: true, exportCSV: true
    },
    orders: {
      viewOrders: true, addOrder: true, editOrder: true,
      deleteOrder: false, filterOrder: true, exportOrderCSV: true
    },
    admin: {
      viewAdmin: true, manageUser: false, manageAccess: false,
      backupData: true, importBackup: false, clearAllData: false
    }
  },
  'User': {
    dashboard: { viewDashboard: true },
    transactions: {
      viewTransactions: true, addTransaction: true, editTransaction: false,
      deleteTransaction: false, filterTransaction: true, exportCSV: false
    },
    orders: {
      viewOrders: true, addOrder: true, editOrder: false,
      deleteOrder: false, filterOrder: true, exportOrderCSV: false
    },
    admin: {
      viewAdmin: false, manageUser: false, manageAccess: false,
      backupData: false, importBackup: false, clearAllData: false
    }
  }
};

export const ROLE_NAMES = ['Administrator', 'Manager', 'User'];

export const PERMISSION_CATEGORIES = {
  dashboard: 'Dashboard',
  transactions: 'Transactions',
  orders: 'Orders',
  admin: 'Administration'
};