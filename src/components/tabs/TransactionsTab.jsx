import React from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Filter,
  X,
  Calendar,
  Tag
} from 'lucide-react';
import { calculateTransactionTotals } from '../../utils/calculations';

const TransactionsTab = ({
  transactions,
  filteredTransactions,
  hasPermission,
  openTransactionModal,
  exportToCSV,
  handleEdit,
  handleDelete,
  showFilters,
  setShowFilters,
  filters,
  updateFilter,
  toggleArrayFilter,
  resetFilters,
  getActiveFiltersCount,
  allCategories
}) => {
  // Calculate totals for quick stats
  const totals = calculateTransactionTotals(filteredTransactions);
  const { income, expenses, balance } = totals;
  console.log('Filters applied:', filters);
  console.log('Filtered transactions:', filteredTransactions.map(t => t.date));

  return (
    <div className="space-y-6">
      {/* Transaction Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap gap-3 mb-4">
          {hasPermission('transactions', 'addTransaction') && (
            <button
              onClick={() => openTransactionModal()}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </button>
          )}
          {hasPermission('transactions', 'filterTransaction') && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                showFilters ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
            </button>
          )}
          {hasPermission('transactions', 'exportCSV') && transactions.length > 0 && (
            <button
              onClick={exportToCSV}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              📊 Export CSV
            </button>
          )}
          {!hasPermission('transactions', 'addTransaction') && !hasPermission('transactions', 'filterTransaction') && !hasPermission('transactions', 'exportCSV') && (
            <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
              ⚠️ Limited access - Contact admin for additional permissions
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">RM {income.toFixed(2)}</p>
            <p className="text-sm text-green-600">Total Sales</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-700">RM {expenses.toFixed(2)}</p>
            <p className="text-sm text-red-600">Business Expenses</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-700">RM {balance.toFixed(2)}</p>
            <p className="text-sm text-yellow-600">Net Balance</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">{filteredTransactions.length}</p>
            <p className="text-sm text-blue-600">Transactions</p>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Filter Transactions</h3>
            <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text" placeholder="Search description, category, amount..."
                value={filters.searchText} onChange={(e) => updateFilter('searchText', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date" value={filters.dateFrom} onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date" value={filters.dateTo} onChange={(e) => updateFilter('dateTo', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
              <div className="space-y-2">
                {['income', 'expense'].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox" checked={filters.types.includes(type)} onChange={() => toggleArrayFilter('types', type)}
                      className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="text-sm capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <div className="space-y-2">
                {['cash', 'online'].map(method => (
                  <label key={method} className="flex items-center">
                    <input
                      type="checkbox" checked={filters.paymentMethods.includes(method)} onChange={() => toggleArrayFilter('paymentMethods', method)}
                      className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="text-sm capitalize">{method}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <div className="max-h-32 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
                {allCategories.map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox" checked={filters.categories.includes(category)} onChange={() => toggleArrayFilter('categories', category)}
                      className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={resetFilters} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
              Reset Filters
            </button>
            <div className="text-sm text-gray-600 flex items-center">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Recent Transactions</h3>
            {getActiveFiltersCount() > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-600 font-medium">
                  {getActiveFiltersCount()} filter{getActiveFiltersCount() > 1 ? 's' : ''} active
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="p-6">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              {transactions.length === 0 ? (
                <div>
                  <p className="text-gray-500 mb-4">🎉 Start tracking your lempeng business!</p>
                  <p className="text-sm text-gray-400">Add your first transaction to get started</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 mb-2">No transactions match your current filters.</p>
                  <button onClick={resetFilters} className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                    Reset filters to see all transactions
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="font-medium">{transaction.description || 'No description'}</p>
                        <p className="text-sm text-gray-600">
                          <span className="inline-flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {transaction.category}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="inline-flex items-center gap-1">
                            {transaction.payment_method === 'online' ? '💳' : '💵'}
                            {transaction.payment_method === 'online' ? 'Online' : 'Cash'}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {transaction.date}
                          </span>
                          {transaction.quantity && transaction.quantity !== 1 && (
                            <>
                              <span className="mx-2">•</span>
                              <span>RM {transaction.amount.toFixed(2)} × {transaction.quantity}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}RM {(transaction.total_amount || transaction.amount).toFixed(2)}
                    </span>
                    {hasPermission('transactions', 'editTransaction') && (
                      <button onClick={() => handleEdit(transaction)} className="text-yellow-600 hover:text-yellow-800" title="Edit Transaction">
                        <Edit3 className="h-4 w-4" />
                      </button>
                    )}
                    {hasPermission('transactions', 'deleteTransaction') && (
                      <button onClick={() => handleDelete(transaction.id)} className="text-red-600 hover:text-red-800" title="Delete Transaction">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    {!hasPermission('transactions', 'editTransaction') && !hasPermission('transactions', 'deleteTransaction') && (
                      <span className="text-xs text-gray-400">View Only</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsTab;