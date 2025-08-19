import React from 'react';
import {
  Edit3,
  Trash2,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';

const UserModal = ({
  isOpen,
  onClose,
  users,
  currentUser,
  editingUser,
  userForm,
  setUserForm,
  showUserPassword,
  setShowUserPassword,
  handleUserSubmit,
  handleEditUser,
  handleDeleteUser,
  toggleUserStatus,
  resetUserForm
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">User Management</h2>

        {/* Add/Edit User Section */}
        <div className="border-b pb-4 mb-4">
          <h3 className="font-semibold mb-3">{editingUser ? 'Edit User' : 'Add New User'}</h3>
          <div className="grid md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Username"
              value={userForm.username}
              onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="relative">
              <input
                type={showUserPassword ? "text" : "password"}
                placeholder="Password"
                value={userForm.password}
                onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowUserPassword(!showUserPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showUserPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <select
              value={userForm.role}
              onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="User">User</option>
              <option value="Manager">Manager</option>
              <option value="Administrator">Administrator</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleUserSubmit}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingUser ? 'Update' : 'Add'} User
              </button>
              {editingUser && (
                <button
                  onClick={resetUserForm}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Users List */}
        <div>
          <h3 className="font-semibold mb-3">Current Users ({users.length})</h3>
          <div className="space-y-2">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${user.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {user.username}
                      {user.id === currentUser.id && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">You</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {user.role}
                      </span>
                      {user.last_login && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Last Login: {new Date(user.last_login).toLocaleDateString()}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${user.active ? 'text-green-600' : 'text-red-600'}`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => toggleUserStatus(user.id)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      user.active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                    disabled={user.id === currentUser.id}
                  >
                    {user.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEditUser(user)}
                    className="text-yellow-600 hover:text-yellow-800"
                    title="Edit User"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete User"
                    disabled={user.id === currentUser.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Statistics */}
        <div className="mt-6 grid md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-700">Total Users</p>
            <p className="text-2xl font-bold text-blue-900">{users.length}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-green-700">Active Users</p>
            <p className="text-2xl font-bold text-green-900">{users.filter(u => u.active).length}</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-yellow-700">Administrators</p>
            <p className="text-2xl font-bold text-yellow-900">{users.filter(u => u.role === 'Administrator').length}</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-purple-700">Managers</p>
            <p className="text-2xl font-bold text-purple-900">{users.filter(u => u.role === 'Manager').length}</p>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={() => {
              onClose();
              resetUserForm();
            }}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;