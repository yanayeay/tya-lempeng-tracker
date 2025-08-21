// src/components/tabs/CategoriesTab.jsx
import React from 'react';
import { useCategories } from '../../hooks/useCategories';
import { Settings, Plus, Tag, AlertTriangle, Lock, Shield, Users } from 'lucide-react';

const CategoriesTab = ({ openCategoryModal, hasPermission }) => {
  const { getIncomeCategories, getExpenseCategories, loading } = useCategories();

  const incomeCategories = getIncomeCategories();
  const expenseCategories = getExpenseCategories();

  // Permission checks
  const canViewCategories = hasPermission('categories', 'viewCategories');
  const canAddCategories = hasPermission('categories', 'addCategories');
  const canEditCategories = hasPermission('categories', 'editCategories');
  const canDeleteCategories = hasPermission('categories', 'deleteCategories');

  // If user can't view categories at all, show access denied
  if (!canViewCategories) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Access Denied</p>
          <p className="text-sm text-gray-400 mt-1">You don't have permission to view categories</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Permission Status Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          {canAddCategories ? (
            <>
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">Full Category Management Access</span>
            </>
          ) : (
            <>
              <Users className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-700 font-medium">View-Only Access</span>
            </>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-600">
          <span className={canViewCategories ? 'text-green-600' : 'text-red-600'}>
            ✓ View Categories
          </span>
          <span className="mx-2">•</span>
          <span className={canAddCategories ? 'text-green-600' : 'text-gray-400'}>
            {canAddCategories ? '✓' : '✗'} Add Categories
          </span>
          <span className="mx-2">•</span>
          <span className={canEditCategories ? 'text-green-600' : 'text-gray-400'}>
            {canEditCategories ? '✓' : '✗'} Edit Categories
          </span>
          <span className="mx-2">•</span>
          <span className={canDeleteCategories ? 'text-green-600' : 'text-gray-400'}>
            {canDeleteCategories ? '✓' : '✗'} Delete Categories
          </span>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Category Management</h2>
            <p className="text-gray-600">
              {canAddCategories
                ? "Manage your income and expense categories. Categories are used when adding transactions."
                : "View your income and expense categories. Contact your administrator for management permissions."
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            {loading && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
            )}
            {canAddCategories ? (
              <button
                onClick={() => openCategoryModal()}
                className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 flex items-center gap-2 transition-colors"
              >
                <Settings className="h-5 w-5" />
                Manage Categories
              </button>
            ) : (
              <button
                onClick={() => openCategoryModal()}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-colors"
              >
                <Tag className="h-5 w-5" />
                View Categories
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Summary Cards */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Tag className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Total Categories</h3>
              <p className="text-sm text-gray-600">All categories combined</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {incomeCategories.length + expenseCategories.length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Plus className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Income Categories</h3>
              <p className="text-sm text-gray-600">Revenue sources</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{incomeCategories.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Settings className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Expense Categories</h3>
              <p className="text-sm text-gray-600">Cost categories</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600">{expenseCategories.length}</p>
        </div>
      </div>

      {/* Category Lists */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Income Categories */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-green-700">Income Categories</h3>
            <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
              {incomeCategories.length} categories
            </span>
          </div>

          {incomeCategories.length > 0 ? (
            <div className="bg-green-50 rounded-lg p-4 max-h-100 overflow-y-auto">
              <div className="space-y-2">
                {incomeCategories.map((cat, index) => (
                  <div key={cat.name || cat} className="flex items-center justify-between p-2 bg-white rounded border border-green-200">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-green-700">#{index + 1}</span>
                      <span className="text-green-800">{cat.name || cat}</span>
                    </div>
                    {!canEditCategories && !canDeleteCategories && (
                      <Lock className="h-4 w-4 text-gray-400" title="View only" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <Tag className="h-12 w-12 text-green-300 mx-auto mb-3" />
              <p className="text-green-600 font-medium">No income categories yet</p>
              <p className="text-sm text-green-500 mt-1">
                {canAddCategories
                  ? 'Click "Manage Categories" to add some'
                  : 'Contact your administrator to add categories'
                }
              </p>
            </div>
          )}
        </div>

        {/* Expense Categories */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-red-700">Expense Categories</h3>
            <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">
              {expenseCategories.length} categories
            </span>
          </div>

          {expenseCategories.length > 0 ? (
            <div className="bg-red-50 rounded-lg p-4 max-h-100 overflow-y-auto">
              <div className="space-y-2">
                {expenseCategories.map((cat, index) => (
                  <div key={cat.name || cat} className="flex items-center justify-between p-2 bg-white rounded border border-red-200">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-red-700">#{index + 1}</span>
                      <span className="text-red-800">{cat.name || cat}</span>
                    </div>
                    {!canEditCategories && !canDeleteCategories && (
                      <Lock className="h-4 w-4 text-gray-400" title="View only" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 rounded-lg p-6 text-center">
              <Tag className="h-12 w-12 text-red-300 mx-auto mb-3" />
              <p className="text-red-600 font-medium">No expense categories yet</p>
              <p className="text-sm text-red-500 mt-1">
                {canAddCategories
                  ? 'Click "Manage Categories" to add some'
                  : 'Contact your administrator to add categories'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Limited Access Warning */}
      {!canAddCategories && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="text-sm text-orange-800 font-medium">Limited Category Access</p>
              <p className="text-sm text-orange-700 mt-1">
                You're viewing categories in read-only mode. Contact your administrator to request category management permissions or get elevated access.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesTab;