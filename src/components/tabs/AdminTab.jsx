import React from 'react';
import {
  Settings,
  Shield
} from 'lucide-react';

const AdminTab = ({
  currentUser,
  users,
  transactions,
  incomeCategories,
  expenseCategories,
  hasPermission,
  openUserModal,
  openAccessModal,
  openCategoryModal,
  exportBackup,
  importBackup,
  clearAllData
}) => {
  return (
    <div className="space-y-6">
      {/* User Management */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">User Management</h3>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            Current User: <span className="font-medium text-blue-600">{currentUser.username}</span> ({currentUser.role})
          </div>
          <div className="flex gap-2">
            {hasPermission('admin', 'manageUser') && (
              <button
                onClick={() => openUserModal() }
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Manage Users
              </button>
            )}
            {hasPermission('admin', 'manageAccess') && (
              <button
                onClick={() => openAccessModal()}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors"
              >
                <Shield className="h-4 w-4" />
                Manage Access
              </button>
            )}
            {!hasPermission('admin', 'manageUser') && !hasPermission('admin', 'manageAccess') && (
              <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                👀 View-only access
              </div>
            )}
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-700 mb-1">Total Users</p>
            <p className="text-2xl font-bold text-blue-900">{users.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-sm font-medium text-green-700 mb-1">Active Users</p>
            <p className="text-2xl font-bold text-green-900">{users.filter(u => u.active).length}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <p className="text-sm font-medium text-yellow-700 mb-1">Administrators</p>
            <p className="text-2xl font-bold text-yellow-900">{users.filter(u => u.role === 'Administrator').length}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Recent Users</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {users.slice(0, 5).map(user => (
              <div key={user.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                <span className="font-medium">{user.username}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{user.role}</span>
                  <span className={`w-2 h-2 rounded-full ${user.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Management */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Category Management</h3>
        <button
          onClick={() => openCategoryModal()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors"
        >
          <Settings className="h-4 w-4" />
          Manage Categories
        </button>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-green-700 mb-2">Income Categories ({incomeCategories.length})</p>
            <div className="bg-green-50 rounded-lg p-3 max-h-50 overflow-y-auto">
              <div className="text-sm text-green-800 space-y-1">
                {incomeCategories.map(cat => <div key={cat}>• {cat}</div>)}
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-red-700 mb-2">Expense Categories ({expenseCategories.length})</p>
            <div className="bg-red-50 rounded-lg p-3 max-h-50 overflow-y-auto">
              <div className="text-sm text-red-800 space-y-1">
                {expenseCategories.map(cat => <div key={cat}>• {cat}</div>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Data Management</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {hasPermission('admin', 'backupData') && (
              <button
                onClick={exportBackup}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
              >
                💾 Backup Data
              </button>
            )}
            {hasPermission('admin', 'importBackup') && (
              <label className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 transition-colors cursor-pointer">
                📂 Import Backup
                <input type="file" accept=".json" onChange={importBackup} className="hidden" />
              </label>
            )}
            {!hasPermission('admin', 'backupData') && !hasPermission('admin', 'importBackup') && (
              <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg text-center">
                ⚠️ No data management permissions
              </div>
            )}
          </div>
          <div className="space-y-3">
            {hasPermission('admin', 'clearAllData') && (
              <button
                onClick={clearAllData}
                className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 transition-colors"
              >
                🗑️ Clear All Data
              </button>
            )}
            <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
              <p><strong>Data Status:</strong></p>
              <p>• Transactions: {transactions.length}</p>
              <p>• Categories: {incomeCategories.length + expenseCategories.length}</p>
              <p>• Users: {users.length}</p>
              <p>• Storage: Cloud Database (Supabase)</p>
              <p>• Your Role: <span className="font-medium text-blue-600">{currentUser.role}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Security & Access</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="font-medium text-blue-900">Current Session</p>
              <p className="text-sm text-blue-700">Logged in as {currentUser.username} • {currentUser.role}</p>
              <p className="text-xs text-blue-600 mt-1">Use the logout button in the top right corner to end your session</p>
            </div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Security Tips:</strong> Change default passwords, manage user access regularly,
              and export backups regularly for data safety.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTab;