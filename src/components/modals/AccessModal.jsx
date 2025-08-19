import React from 'react';
import {
  BarChart3,
  CreditCard,
  Shield
} from 'lucide-react';

const AccessModal = ({
  isOpen,
  onClose,
  selectedRole,
  setSelectedRole,
  rolePermissions,
  updateRolePermission
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Role-Based Access Control</h2>

        {/* Role Selection */}
        <div className="border-b pb-4 mb-6">
          <h3 className="font-semibold mb-3">Select Role to Manage</h3>
          <div className="flex items-center gap-4">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-medium"
            >
              <option value="Administrator">Administrator</option>
              <option value="Manager">Manager</option>
              <option value="User">User</option>
            </select>
            <div className="text-sm text-gray-600">
              Configure permissions for <span className="font-medium text-purple-600">{selectedRole}</span> role
            </div>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="space-y-6">
          {/* Dashboard Permissions */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Dashboard Permissions
            </h4>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={rolePermissions[selectedRole]?.dashboard?.viewDashboard || false}
                  onChange={(e) => updateRolePermission('dashboard', 'viewDashboard', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium">View Dashboard Page</span>
              </label>
            </div>
          </div>

          {/* Transaction Permissions */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Transaction Permissions
            </h4>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={rolePermissions[selectedRole]?.transactions?.viewTransactions || false}
                  onChange={(e) => updateRolePermission('transactions', 'viewTransactions', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium">View Transaction Page</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={rolePermissions[selectedRole]?.transactions?.addTransaction || false}
                  onChange={(e) => updateRolePermission('transactions', 'addTransaction', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Add Transaction</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={rolePermissions[selectedRole]?.transactions?.editTransaction || false}
                  onChange={(e) => updateRolePermission('transactions', 'editTransaction', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Edit Transaction</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={rolePermissions[selectedRole]?.transactions?.deleteTransaction || false}
                  onChange={(e) => updateRolePermission('transactions', 'deleteTransaction', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Delete Transaction</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={rolePermissions[selectedRole]?.transactions?.filterTransaction || false}
                  onChange={(e) => updateRolePermission('transactions', 'filterTransaction', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Filter Transaction</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={rolePermissions[selectedRole]?.transactions?.exportCSV || false}
                  onChange={(e) => updateRolePermission('transactions', 'exportCSV', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Export CSV</span>
              </label>
            </div>
          </div>

          {/* Orders Permissions */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Orders Permissions
            </h4>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={rolePermissions[selectedRole]?.orders?.viewOrders || false}
                  onChange={(e) => updateRolePermission('orders', 'viewOrders', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium">View Orders Page</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={rolePermissions[selectedRole]?.orders?.addOrder || false}
                  onChange={(e) => updateRolePermission('orders', 'addOrder', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Add Order</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={rolePermissions[selectedRole]?.orders?.editOrder || false}
                  onChange={(e) => updateRolePermission('orders', 'editOrder', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Edit Order</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={rolePermissions[selectedRole]?.orders?.deleteOrder || false}
                  onChange={(e) => updateRolePermission('orders', 'deleteOrder', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Delete Order</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={rolePermissions[selectedRole]?.orders?.filterOrder || false}
                  onChange={(e) => updateRolePermission('orders', 'filterOrder', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Filter Orders</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={rolePermissions[selectedRole]?.orders?.exportOrderCSV || false}
                  onChange={(e) => updateRolePermission('orders', 'exportOrderCSV', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Export Orders CSV</span>
              </label>
            </div>
          </div>

          {/* Admin Permissions */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Permissions
            </h4>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={rolePermissions[selectedRole]?.admin?.viewAdmin || false}
                  onChange={(e) => updateRolePermission('admin', 'viewAdmin', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium">View Admin Page</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={rolePermissions[selectedRole]?.admin?.manageUser || false}
                  onChange={(e) => updateRolePermission('admin', 'manageUser', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Manage User</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={rolePermissions[selectedRole]?.admin?.manageAccess || false}
                  onChange={(e) => updateRolePermission('admin', 'manageAccess', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Manage Access</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={rolePermissions[selectedRole]?.admin?.backupData || false}
                  onChange={(e) => updateRolePermission('admin', 'backupData', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Backup Data</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={rolePermissions[selectedRole]?.admin?.importBackup || false}
                  onChange={(e) => updateRolePermission('admin', 'importBackup', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Import Backup</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={rolePermissions[selectedRole]?.admin?.clearAllData || false}
                  onChange={(e) => updateRolePermission('admin', 'clearAllData', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Clear All Data</span>
              </label>
            </div>
          </div>
        </div>

        {/* Permission Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Permission Summary for {selectedRole}:</h4>
          <div className="text-sm text-gray-600">
            <p>
              <strong>Dashboard:</strong> {Object.values(rolePermissions[selectedRole]?.dashboard || {}).filter(Boolean).length} permission(s) •
              <strong> Transactions:</strong> {Object.values(rolePermissions[selectedRole]?.transactions || {}).filter(Boolean).length} permission(s) •
              <strong> Orders:</strong> {Object.values(rolePermissions[selectedRole]?.orders || {}).filter(Boolean).length} permission(s) •
              <strong> Admin:</strong> {Object.values(rolePermissions[selectedRole]?.admin || {}).filter(Boolean).length} permission(s)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <div className="text-sm text-gray-500">
            <p>✅ Changes are automatically saved to the database</p>
            <p className="text-xs text-gray-400 mt-1">All users will see permission updates immediately</p>
          </div>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessModal;