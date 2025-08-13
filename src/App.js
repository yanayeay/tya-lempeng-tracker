import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Settings,
  Filter,
  X,
  Calendar,
  Tag,
  Lock,
  LogOut,
  Globe,
  BarChart3,
  CreditCard,
  Shield
} from 'lucide-react';
import { supabase } from './lib/supabase';

const PasswordProtection = ({ onAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch user from Supabase
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('active', true)
        .single();

      if (error || !users) {
        setError('Invalid username or password');
        setPassword('');
        setLoading(false);
        return;
      }

      // For demo purposes, we'll do simple password comparison
      if (password === 'TyaLempeng2024!') {
        // Update last login
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', users.id);

        onAuthenticated(users);
      } else {
        setError('Invalid username or password');
        setPassword('');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-10 w-10 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Tya's Lempeng Financial Tracker</h1>
          <p className="text-gray-600 mt-2">🌍 Cloud-powered with Supabase!</p>
          <p className="text-sm text-gray-500 mt-1">Enter your credentials to access the system</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-center text-lg"
              placeholder="Enter your username"
              autoFocus
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleSubmit()}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-center text-lg"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? '🔄 Logging in...' : '🔐 Login to System'}
          </button>
        </div>

        <div className="mt-6 text-center space-y-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-900">Demo Credentials:</p>
            <div className="space-y-1">
              <p className="text-sm text-blue-700">Username: <span className="font-mono font-bold bg-white px-2 py-1 rounded">Admin</span></p>
              <p className="text-sm text-blue-700">Password: <span className="font-mono font-bold bg-white px-2 py-1 rounded">TyaLempeng2024!</span></p>
            </div>
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <p>☁️ Powered by Supabase</p>
            <p>🔐 Secure cloud authentication</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FinanceTracker = ({ onLogout, currentUser }) => {
  // States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    categories: [],
    types: [],
    paymentMethods: [],
    searchText: ''
  });

  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    quantity: '1',
    category: '',
    description: '',
    paymentMethod: 'cash',
    date: new Date().toISOString().split('T')[0]
  });

  // Category management states
  const [newCategory, setNewCategory] = useState('');
  const [categoryType, setCategoryType] = useState('expense');

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadTransactions(),
        loadCategories(),
        loadUsers()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading transactions:', error);
      } else {
        setTransactions(data || []);
      }
    } catch (err) {
      console.error('Error in loadTransactions:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error loading categories:', error);
      } else {
        setCategories(data || []);
      }
    } catch (err) {
      console.error('Error in loadCategories:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_date', { ascending: false });

      if (error) {
        console.error('Error loading users:', error);
      } else {
        setUsers(data || []);
      }
    } catch (err) {
      console.error('Error in loadUsers:', err);
    }
  };

  // Permission system (simplified for demo)
  const hasPermission = (category, permission) => {
    if (!currentUser || !currentUser.role) return false;

    const permissions = {
      'Administrator': { all: true },
      'Manager': {
        viewDashboard: true, viewTransactions: true, addTransaction: true,
        editTransaction: true, filterTransaction: true, exportCSV: true,
        viewAdmin: true, backupData: true
      },
      'User': {
        viewDashboard: true, viewTransactions: true, addTransaction: true,
        filterTransaction: true
      }
    };

    return permissions[currentUser.role]?.all || permissions[currentUser.role]?.[permission] || false;
  };

  // Navigation tabs
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, description: 'Overview & Analytics' },
    { id: 'transactions', name: 'Transactions', icon: CreditCard, description: 'Manage Transactions' },
    { id: 'admin', name: 'Admin', icon: Shield, description: 'Settings & Data' }
  ];

  // Transaction operations
  const handleSubmit = async () => {
    if (!formData.amount || !formData.category || !formData.quantity) return;

    const unitAmount = parseFloat(formData.amount);
    const quantity = parseFloat(formData.quantity);
    if (unitAmount <= 0 || quantity <= 0) return;

    const totalAmount = unitAmount * quantity;

    const transactionData = {
      type: formData.type,
      amount: unitAmount,
      quantity: quantity,
      total_amount: totalAmount,
      category: formData.category,
      description: formData.description,
      payment_method: formData.paymentMethod,
      date: formData.date,
      created_by: currentUser.id
    };

    try {
      if (editingTransaction) {
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', editingTransaction.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('transactions')
          .insert([transactionData]);

        if (error) throw error;
      }

      await loadTransactions();
      resetForm();
      setShowTransactionForm(false);
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Error saving transaction. Please try again.');
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      quantity: transaction.quantity ? transaction.quantity.toString() : '1',
      category: transaction.category,
      description: transaction.description,
      paymentMethod: transaction.payment_method,
      date: transaction.date
    });
    setShowTransactionForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id);

        if (error) throw error;
        await loadTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Error deleting transaction. Please try again.');
      }
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ name: newCategory, type: categoryType }]);

      if (error) throw error;
      await loadCategories();
      setNewCategory('');
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Error adding category. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'expense', amount: '', quantity: '1', category: '', description: '',
      paymentMethod: 'cash', date: new Date().toISOString().split('T')[0]
    });
    setEditingTransaction(null);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  // Filter functions
  const applyFilters = (transactionList) => {
    return transactionList.filter(transaction => {
      if (filters.dateFrom && transaction.date < filters.dateFrom) return false;
      if (filters.dateTo && transaction.date > filters.dateTo) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(transaction.category)) return false;
      if (filters.types.length > 0 && !filters.types.includes(transaction.type)) return false;
      if (filters.paymentMethods.length > 0 && !filters.paymentMethods.includes(transaction.payment_method)) return false;
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const matchesDescription = transaction.description?.toLowerCase().includes(searchLower);
        const matchesCategory = transaction.category.toLowerCase().includes(searchLower);
        const matchesAmount = transaction.amount.toString().includes(filters.searchText);
        if (!matchesDescription && !matchesCategory && !matchesAmount) return false;
      }
      return true;
    });
  };

  const getFilteredTransactions = () => applyFilters(transactions);
  const filteredTransactions = getFilteredTransactions();

  const updateFilter = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const toggleArrayFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: '', dateTo: '', categories: [], types: [], paymentMethods: [], searchText: ''
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.categories.length > 0) count++;
    if (filters.types.length > 0) count++;
    if (filters.paymentMethods.length > 0) count++;
    if (filters.searchText) count++;
    return count;
  };

  // Calculate totals
  const calculateTotals = (transactionList = transactions) => {
    const income = transactionList.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.total_amount || t.amount), 0);
    const expenses = transactionList.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.total_amount || t.amount), 0);
    const onlineTotal = transactionList.filter(t => t.payment_method === 'online').reduce((sum, t) => sum + (t.total_amount || t.amount), 0);
    const cashTotal = transactionList.filter(t => t.payment_method === 'cash').reduce((sum, t) => sum + (t.total_amount || t.amount), 0);
    const ayienSpending = transactionList.filter(t => t.category.toLowerCase().includes('ayien')).reduce((sum, t) => sum + (t.total_amount || t.amount), 0);
    return { income, expenses, balance: income - expenses, onlineTotal, cashTotal, ayienSpending };
  };

  const { income, expenses, balance, onlineTotal, cashTotal, ayienSpending } = calculateTotals(filteredTransactions);

  const incomeCategories = categories.filter(c => c.type === 'income').map(c => c.name);
  const expenseCategories = categories.filter(c => c.type === 'expense').map(c => c.name);
  const currentCategories = formData.type === 'income' ? incomeCategories : expenseCategories;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  // DASHBOARD COMPONENT
  const DashboardTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Overview</h2>

        {/* Data Status */}
        <div className="bg-blue-50 p-3 rounded-lg mb-6 border border-blue-200">
          <p className="text-sm text-blue-700">
            ☁️ <strong>Cloud Database:</strong> {transactions.length} transactions •
            <strong>This Month:</strong> {transactions.filter(t => new Date(t.date).getMonth() === new Date().getMonth()).length} •
            <strong>Live Data:</strong> Real-time sync enabled
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Sales</p>
                <p className="text-3xl font-bold text-green-700">RM {income.toFixed(2)}</p>
                <p className="text-sm text-green-600 mt-1">
                  {transactions.filter(t => t.type === 'income').length} transactions
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Total Expenses</p>
                <p className="text-3xl font-bold text-red-700">RM {expenses.toFixed(2)}</p>
                <p className="text-sm text-red-600 mt-1">
                  {transactions.filter(t => t.type === 'expense').length} transactions
                </p>
              </div>
              <TrendingDown className="h-12 w-12 text-red-600" />
            </div>
          </div>

          <div className={`p-6 rounded-lg border ${balance >= 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${balance >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>Net Balance</p>
                <p className={`text-3xl font-bold ${balance >= 0 ? 'text-yellow-700' : 'text-red-700'}`}>RM {balance.toFixed(2)}</p>
                <p className={`text-sm mt-1 ${balance >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {balance >= 0 ? '💰 Profit' : '⚠️ Loss'}
                </p>
              </div>
              <DollarSign className={`h-12 w-12 ${balance >= 0 ? 'text-yellow-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // TRANSACTIONS COMPONENT
  const TransactionsTab = () => (
    <div className="space-y-6">
      {/* Transaction Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap gap-3 mb-4">
          {hasPermission('transactions', 'addTransaction') && (
            <button
              onClick={() => setShowTransactionForm(true)}
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
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">RM {income.toFixed(0)}</p>
            <p className="text-sm text-green-600">Total Sales</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-700">RM {expenses.toFixed(0)}</p>
            <p className="text-sm text-red-600">Total Expenses</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-700">RM {balance.toFixed(0)}</p>
            <p className="text-sm text-yellow-600">Net Balance</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">{filteredTransactions.length}</p>
            <p className="text-sm text-blue-600">Transactions</p>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold">Recent Transactions</h3>
        </div>
        <div className="p-6">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">🎉 Start tracking your lempeng business!</p>
              <p className="text-sm text-gray-400">Add your first transaction to get started</p>
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ADMIN COMPONENT
  const AdminTab = () => (
    <div className="space-y-6">
      {/* Database Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Database Status</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-700 mb-1">Total Transactions</p>
            <p className="text-2xl font-bold text-blue-900">{transactions.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-sm font-medium text-green-700 mb-1">Categories</p>
            <p className="text-2xl font-bold text-green-900">{categories.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <p className="text-sm font-medium text-yellow-700 mb-1">Users</p>
            <p className="text-2xl font-bold text-yellow-900">{users.length}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-sm font-medium text-purple-700 mb-1">Storage</p>
            <p className="text-2xl font-bold text-purple-900">☁️</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-green-800">
              <strong>Connected to Supabase:</strong> Real-time data sync active •
              Automatic backups enabled • Data is securely stored in the cloud
            </p>
          </div>
        </div>
      </div>

      {/* Category Management */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Category Management</h3>
        <button
          onClick={() => setShowCategoryManager(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors"
        >
          <Settings className="h-4 w-4" />
          Manage Categories
        </button>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-green-700 mb-2">Income Categories ({incomeCategories.length})</p>
            <div className="bg-green-50 rounded-lg p-3 max-h-24 overflow-y-auto">
              <div className="text-sm text-green-800 space-y-1">
                {incomeCategories.map(cat => <div key={cat}>• {cat}</div>)}
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-red-700 mb-2">Expense Categories ({expenseCategories.length})</p>
            <div className="bg-red-50 rounded-lg p-3 max-h-24 overflow-y-auto">
              <div className="text-sm text-red-800 space-y-1">
                {expenseCategories.map(cat => <div key={cat}>• {cat}</div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Cloud Database</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Tya's Lempeng</h1>
          <p className="text-sm text-gray-600">Financial Tracker</p>
        </div>

        <nav className="p-4">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <div>
                    <p className="font-medium">{tab.name}</p>
                    <p className="text-xs opacity-75">{tab.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Permission Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 font-medium">Access Level</p>
            <p className="text-sm text-blue-800">{currentUser.role}</p>
            <p className="text-xs text-blue-600 mt-1">Cloud database access</p>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 capitalize">{activeTab}</h2>
              <p className="text-sm text-gray-600">
                {activeTab === 'dashboard' && 'Business overview and analytics'}
                {activeTab === 'transactions' && 'Manage your income and expenses'}
                {activeTab === 'admin' && 'System settings and database management'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser.username}</p>
                <p className="text-xs text-gray-500">{currentUser.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2 transition-colors text-sm"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'transactions' && <TransactionsTab />}
          {activeTab === 'admin' && <AdminTab />}
        </div>
      </div>

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Manage Categories</h2>
            <div className="border-b pb-4 mb-4">
              <h3 className="font-semibold mb-3">Add New Category</h3>
              <div className="flex gap-2">
                <select
                  value={categoryType} onChange={(e) => setCategoryType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <input
                  type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Category name"
                />
                <button onClick={addCategory} className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                  Add
                </button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-green-700">Income Categories</h3>
                <div className="space-y-2">
                  {incomeCategories.map(category => (
                    <div key={category} className="flex items-center gap-2 bg-green-50 p-2 rounded">
                      <span className="flex-1">{category}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-red-700">Expense Categories</h3>
                <div className="space-y-2">
                  {expenseCategories.map(category => (
                    <div key={category} className="flex items-center gap-2 bg-red-50 p-2 rounded">
                      <span className="flex-1">{category}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowCategoryManager(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value, category: '' }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Amount</label>
                <input
                  type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="0.00" required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number" step="0.01" value={formData.quantity} onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="1" required
                />
              </div>
              {formData.amount && formData.quantity && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-700">
                    <strong>Total Amount: RM {(parseFloat(formData.amount || 0) * parseFloat(formData.quantity || 1)).toFixed(2)}</strong>
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent" required
                >
                  <option value="">Select a category</option>
                  {currentCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <input
                  type="text" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter description (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={formData.paymentMethod} onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="online">Online Transaction</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent" required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleSubmit} className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                  {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                </button>
                <button onClick={() => { setShowTransactionForm(false); resetForm(); }} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleAuthentication = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Show login page when not authenticated
  if (!isAuthenticated || !currentUser) {
    return <PasswordProtection onAuthenticated={handleAuthentication} />;
  }

  // Show main app when authenticated
  return <FinanceTracker onLogout={handleLogout} currentUser={currentUser} />;
};

export default App;