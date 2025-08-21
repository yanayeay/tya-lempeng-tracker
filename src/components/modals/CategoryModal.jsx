// src/components/modals/CategoryModal.jsx
import React, { useState } from 'react';
import { Edit3, Trash2, ChevronUp, ChevronDown, Plus, X, Lock, Shield, Users, AlertTriangle } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';

const CategoryModal = ({ isOpen, onClose, hasPermission }) => {
  const {
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    moveCategoryUp,
    moveCategoryDown,
    getIncomeCategories,
    getExpenseCategories
  } = useCategories();

  // Local state for form
  const [newCategory, setNewCategory] = useState('');
  const [categoryType, setCategoryType] = useState('expense');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Permission checks
  const canViewCategories = hasPermission ? hasPermission('categories', 'viewCategories') : false;
  const canAddCategories = hasPermission ? hasPermission('categories', 'addCategories') : false;
  const canEditCategories = hasPermission ? hasPermission('categories', 'editCategories') : false;
  const canDeleteCategories = hasPermission ? hasPermission('categories', 'deleteCategories') : false;

  // Handle adding new category
  const handleAddCategory = async () => {
    if (!newCategory.trim() || isSubmitting || !canAddCategories) return;

    setIsSubmitting(true);
    try {
      const result = await addCategory(newCategory.trim(), categoryType);
      if (result.success) {
        setNewCategory('');
      } else {
        alert(result.error || 'Failed to add category');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle category deletion
  const handleRemoveCategory = async (categoryName, categoryType) => {
    if (!canDeleteCategories) return;

    if (!window.confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      return;
    }

    try {
      const result = await deleteCategory(categoryName, categoryType);
      if (!result.success) {
        alert(result.error || 'Failed to delete category');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Start editing category
  const startEditCategory = (category, type) => {
    if (!canEditCategories) return;
    setEditingCategory({ category, type });
    setEditCategoryValue(category);
  };

  // Save edited category
  const saveEditCategory = async () => {
    if (!editCategoryValue.trim() || !editingCategory || isSubmitting || !canEditCategories) return;

    setIsSubmitting(true);
    try {
      const result = await updateCategory(
        editingCategory.category,
        editingCategory.type,
        editCategoryValue.trim()
      );

      if (result.success) {
        setEditingCategory(null);
        setEditCategoryValue('');
      } else {
        alert(result.error || 'Failed to update category');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel editing
  const cancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryValue('');
  };

  // Handle moving category up/down
  const handleMoveUp = async (categoryName, categoryType) => {
    if (!canEditCategories) return;
    try {
      const result = await moveCategoryUp(categoryName, categoryType);
      if (!result.success) {
        alert(result.error || 'Failed to move category');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleMoveDown = async (categoryName, categoryType) => {
    if (!canEditCategories) return;
    try {
      const result = await moveCategoryDown(categoryName, categoryType);
      if (!result.success) {
        alert(result.error || 'Failed to move category');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Handle key press for adding category
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && canAddCategories) {
      handleAddCategory();
    }
  };

  // Handle key press for editing
  const handleEditKeyPress = (e) => {
    if (e.key === 'Enter' && canEditCategories) {
      saveEditCategory();
    } else if (e.key === 'Escape') {
      cancelEditCategory();
    }
  };

  const incomeCategories = getIncomeCategories();
  const expenseCategories = getExpenseCategories();

  if (!isOpen) return null;

  // If user cannot view categories at all
  if (!canViewCategories) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md text-center">
          <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to view categories.
          </p>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {canAddCategories || canEditCategories || canDeleteCategories ? 'Manage Categories' : 'View Categories'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {canAddCategories
                ? 'Add, edit, and manage your category list'
                : 'Viewing categories in read-only mode'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Permission Status Banner */}
        <div className="mb-6 p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            {canAddCategories ? (
              <>
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">Full Management Access</span>
              </>
            ) : (
              <>
                <Users className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-700 font-medium">Limited Access</span>
              </>
            )}
          </div>
          <div className="text-xs text-gray-600">
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

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Add New Category Section - Only if user has permission */}
        {canAddCategories ? (
          <div className="border-b pb-6 mb-6">
            <h3 className="font-semibold mb-3">Add New Category</h3>
            <div className="flex gap-2">
              <select
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value)}
                disabled={isSubmitting}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSubmitting}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Category name"
              />
              <button
                onClick={handleAddCategory}
                disabled={!newCategory.trim() || isSubmitting}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  !newCategory.trim() || isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add
              </button>
            </div>
          </div>
        ) : (
          <div className="border-b pb-6 mb-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Lock className="h-4 w-4" />
              <span className="text-sm">Category creation requires additional permissions</span>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Income Categories */}
          <div>
            <h3 className="font-semibold mb-3 text-green-700 flex items-center justify-between">
              Income Categories ({incomeCategories.length})
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>}
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {incomeCategories.map((category, index) => (
                <div key={`income-${category.name}`} className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                  {editingCategory && editingCategory.category === category.name && editingCategory.type === 'income' && canEditCategories ? (
                    // Edit Mode
                    <>
                      <input
                        type="text"
                        value={editCategoryValue}
                        onChange={(e) => setEditCategoryValue(e.target.value)}
                        onKeyPress={handleEditKeyPress}
                        disabled={isSubmitting}
                        className="flex-1 border border-green-300 rounded px-2 py-1 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        autoFocus
                      />
                      <button
                        onClick={saveEditCategory}
                        disabled={isSubmitting}
                        className="text-green-600 hover:text-green-800 px-2"
                        title="Save"
                      >
                        ✓
                      </button>
                      <button
                        onClick={cancelEditCategory}
                        disabled={isSubmitting}
                        className="text-red-600 hover:text-red-800 px-2"
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    // View Mode
                    <>
                      <span className="flex-1 font-medium">{category.name}</span>
                      <div className="flex items-center gap-1">
                        {/* Show action buttons only if user has permissions */}
                        {canEditCategories ? (
                          <>
                            {/* Move Up */}
                            <button
                              onClick={() => handleMoveUp(category.name, 'income')}
                              disabled={index === 0}
                              className={`p-1 rounded ${
                                index === 0
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-600 hover:text-gray-800 hover:bg-green-100'
                              }`}
                              title="Move Up"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            {/* Move Down */}
                            <button
                              onClick={() => handleMoveDown(category.name, 'income')}
                              disabled={index === incomeCategories.length - 1}
                              className={`p-1 rounded ${
                                index === incomeCategories.length - 1
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-600 hover:text-gray-800 hover:bg-green-100'
                              }`}
                              title="Move Down"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                            {/* Edit */}
                            <button
                              onClick={() => startEditCategory(category.name, 'income')}
                              className="text-yellow-600 hover:text-yellow-800 p-1 rounded hover:bg-green-100"
                              title="Edit"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          </>
                        ) : null}

                        {/* Delete - separate check */}
                        {canDeleteCategories ? (
                          <button
                            onClick={() => handleRemoveCategory(category.name, 'income')}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-green-100"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}

                        {/* Show lock icon if user has limited permissions */}
                        {!canEditCategories && !canDeleteCategories && (
                          <Lock className="h-4 w-4 text-gray-400" title="View only" />
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
              {incomeCategories.length === 0 && !loading && (
                <div className="text-center py-4 text-gray-500">
                  No income categories yet. {canAddCategories ? 'Add one above!' : 'Contact your administrator to add categories.'}
                </div>
              )}
            </div>
          </div>

          {/* Expense Categories */}
          <div>
            <h3 className="font-semibold mb-3 text-red-700 flex items-center justify-between">
              Expense Categories ({expenseCategories.length})
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>}
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {expenseCategories.map((category, index) => (
                <div key={`expense-${category.name}`} className="flex items-center gap-2 bg-red-50 p-3 rounded-lg">
                  {editingCategory && editingCategory.category === category.name && editingCategory.type === 'expense' && canEditCategories ? (
                    // Edit Mode
                    <>
                      <input
                        type="text"
                        value={editCategoryValue}
                        onChange={(e) => setEditCategoryValue(e.target.value)}
                        onKeyPress={handleEditKeyPress}
                        disabled={isSubmitting}
                        className="flex-1 border border-red-300 rounded px-2 py-1 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        autoFocus
                      />
                      <button
                        onClick={saveEditCategory}
                        disabled={isSubmitting}
                        className="text-green-600 hover:text-green-800 px-2"
                        title="Save"
                      >
                        ✓
                      </button>
                      <button
                        onClick={cancelEditCategory}
                        disabled={isSubmitting}
                        className="text-red-600 hover:text-red-800 px-2"
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    // View Mode
                    <>
                      <span className="flex-1 font-medium">{category.name}</span>
                      <div className="flex items-center gap-1">
                        {/* Show action buttons only if user has permissions */}
                        {canEditCategories ? (
                          <>
                            {/* Move Up */}
                            <button
                              onClick={() => handleMoveUp(category.name, 'expense')}
                              disabled={index === 0}
                              className={`p-1 rounded ${
                                index === 0
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-600 hover:text-gray-800 hover:bg-red-100'
                              }`}
                              title="Move Up"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            {/* Move Down */}
                            <button
                              onClick={() => handleMoveDown(category.name, 'expense')}
                              disabled={index === expenseCategories.length - 1}
                              className={`p-1 rounded ${
                                index === expenseCategories.length - 1
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-600 hover:text-gray-800 hover:bg-red-100'
                              }`}
                              title="Move Down"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                            {/* Edit */}
                            <button
                              onClick={() => startEditCategory(category.name, 'expense')}
                              className="text-yellow-600 hover:text-yellow-800 p-1 rounded hover:bg-red-100"
                              title="Edit"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          </>
                        ) : null}

                        {/* Delete - separate check */}
                        {canDeleteCategories ? (
                          <button
                            onClick={() => handleRemoveCategory(category.name, 'expense')}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}

                        {/* Show lock icon if user has limited permissions */}
                        {!canEditCategories && !canDeleteCategories && (
                          <Lock className="h-4 w-4 text-gray-400" title="View only" />
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
              {expenseCategories.length === 0 && !loading && (
                <div className="text-center py-4 text-gray-500">
                  No expense categories yet. {canAddCategories ? 'Add one above!' : 'Contact your administrator to add categories.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Limited Access Warning */}
        {!canAddCategories && (
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm text-orange-800 font-medium">Limited Category Access</p>
                <p className="text-sm text-orange-700 mt-1">
                  You're viewing categories in read-only mode. Contact your administrator to request category management permissions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;