import React from 'react';
import {
  Edit3,
  Trash2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

const CategoryModal = ({
  isOpen,
  onClose,
  categories,
  newCategory,
  setNewCategory,
  categoryType,
  setCategoryType,
  editingCategory,
  editCategoryValue,
  setEditCategoryValue,
  addCategory,
  removeCategory,
  startEditCategory,
  saveEditCategory,
  cancelEditCategory,
  moveCategoryUp,
  moveCategoryDown
}) => {
  if (!isOpen) return null;

  const incomeCategories = categories.filter(c => c.type === 'income').map(c => c.name);
  const expenseCategories = categories.filter(c => c.type === 'expense').map(c => c.name);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Manage Categories</h2>

        {/* Add New Category Section */}
        <div className="border-b pb-4 mb-4">
          <h3 className="font-semibold mb-3">Add New Category</h3>
          <div className="flex gap-2">
            <select
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Category name"
            />
            <button
              onClick={addCategory}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Income Categories */}
          <div>
            <h3 className="font-semibold mb-3 text-green-700">Income Categories ({incomeCategories.length})</h3>
            <div className="space-y-2">
              {incomeCategories.map((category, index) => (
                <div key={category} className="flex items-center gap-2 bg-green-50 p-2 rounded">
                  {editingCategory && editingCategory.category === category && editingCategory.type === 'income' ? (
                    <>
                      <input
                        type="text"
                        value={editCategoryValue}
                        onChange={(e) => setEditCategoryValue(e.target.value)}
                        className="flex-1 border border-green-300 rounded px-2 py-1 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && saveEditCategory()}
                      />
                      <button
                        onClick={saveEditCategory}
                        className="text-green-600 hover:text-green-800 px-2"
                        title="Save"
                      >
                        ✓
                      </button>
                      <button
                        onClick={cancelEditCategory}
                        className="text-red-600 hover:text-red-800 px-2"
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveCategoryUp(category, 'income')}
                          disabled={index === 0}
                          className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-green-600 hover:text-green-800 hover:bg-green-100'}`}
                          title="Move Up"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => moveCategoryDown(category, 'income')}
                          disabled={index === incomeCategories.length - 1}
                          className={`p-1 rounded ${index === incomeCategories.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-green-600 hover:text-green-800 hover:bg-green-100'}`}
                          title="Move Down"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="flex-1">{category}</span>
                      <button
                        onClick={() => startEditCategory(category, 'income')}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeCategory(category, 'income')}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Expense Categories */}
          <div>
            <h3 className="font-semibold mb-3 text-red-700">Expense Categories ({expenseCategories.length})</h3>
            <div className="space-y-2">
              {expenseCategories.map((category, index) => (
                <div key={category} className="flex items-center gap-2 bg-red-50 p-2 rounded">
                  {editingCategory && editingCategory.category === category && editingCategory.type === 'expense' ? (
                    <>
                      <input
                        type="text"
                        value={editCategoryValue}
                        onChange={(e) => setEditCategoryValue(e.target.value)}
                        className="flex-1 border border-red-300 rounded px-2 py-1 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && saveEditCategory()}
                      />
                      <button
                        onClick={saveEditCategory}
                        className="text-green-600 hover:text-green-800 px-2"
                        title="Save"
                      >
                        ✓
                      </button>
                      <button
                        onClick={cancelEditCategory}
                        className="text-red-600 hover:text-red-800 px-2"
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveCategoryUp(category, 'expense')}
                          disabled={index === 0}
                          className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:text-red-800 hover:bg-red-100'}`}
                          title="Move Up"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => moveCategoryDown(category, 'expense')}
                          disabled={index === expenseCategories.length - 1}
                          className={`p-1 rounded ${index === expenseCategories.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:text-red-800 hover:bg-red-100'}`}
                          title="Move Down"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="flex-1">{category}</span>
                      <button
                        onClick={() => startEditCategory(category, 'expense')}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeCategory(category, 'expense')}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={() => {
              onClose();
              cancelEditCategory();
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

export default CategoryModal;