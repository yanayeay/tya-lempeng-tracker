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
  Shield,
  Eye,
  EyeOff,
  Truck,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { supabase } from './lib/supabase';

const PasswordProtection = ({ onAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

      // Compare with stored password (in production, you'd use bcrypt.compare)
      if (password === users.password_hash) {
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
          <h1 className="text-2xl font-bold text-gray-900">Tya's Lempeng Financial Biz</h1>
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleSubmit()}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-center text-lg"
                placeholder="Enter your password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
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
          <div className="text-xs text-gray-500 space-y-1">
            <p>☁️ Powered by Supabase</p>
            <p>🔒 Secure cloud authentication</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FinanceTracker = ({ onLogout, currentUser }) => {
  // Access Control Management - Define this first
  const [rolePermissions, setRolePermissions] = useState({
    'Administrator': {
      dashboard: { viewDashboard: true },
      transactions: {
        viewTransactions: true, addTransaction: true, editTransaction: true,
        deleteTransaction: true, filterTransaction: true, exportCSV: true
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
      admin: {
        viewAdmin: false, manageUser: false, manageAccess: false,
        backupData: false, importBackup: false, clearAllData: false
      }
    }
  });
  const [permissionsLoading, setPermissionsLoading] = useState(true);

  // Access Control Functions
  const hasPermission = (category, permission) => {
    if (!currentUser || !currentUser.role) return false;
    const userRole = currentUser.role;
    return rolePermissions[userRole]?.[category]?.[permission] || false;
  };

  // States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showUserManager, setShowUserManager] = useState(false);
  const [showAccessManager, setShowAccessManager] = useState(false);
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
    type: 'income',
    amount: '',
    quantity: ' ',
    category: '',
    description: '',
    paymentMethod: 'online',
    date: new Date().toISOString().split('T')[0]
  });

  // Category management states
  const [newCategory, setNewCategory] = useState('');
  const [categoryType, setCategoryType] = useState('expense');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');

  // User management states
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    role: 'User',
    active: true
  });
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('Administrator');
  const [showUserPassword, setShowUserPassword] = useState(false);

  // Navigation tabs configuration
  const tabs = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: BarChart3,
      description: 'Overview & Analytics'
    },
    {
      id: 'transactions',
      name: 'Transactions',
      icon: CreditCard,
      description: 'Manage Transactions'
    },
    {
      id: 'admin',
      name: 'Admin',
      icon: Shield,
      description: 'Settings & Data'
    }
  ];

  // Check if current tab is accessible, redirect if not
  useEffect(() => {
    const canViewCurrentTab =
      (activeTab === 'dashboard' && hasPermission('dashboard', 'viewDashboard')) ||
      (activeTab === 'transactions' && hasPermission('transactions', 'viewTransactions')) ||
      (activeTab === 'admin' && hasPermission('admin', 'viewAdmin'));

    if (!canViewCurrentTab) {
      if (hasPermission('dashboard', 'viewDashboard')) setActiveTab('dashboard');
      else if (hasPermission('transactions', 'viewTransactions')) setActiveTab('transactions');
      else if (hasPermission('admin', 'viewAdmin')) setActiveTab('admin');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentUser.role, rolePermissions]);

  // Load data on component mount
  useEffect(() => {
    loadAllData();
    loadRolePermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Role Permissions Database Functions
  const loadRolePermissions = async () => {
    setPermissionsLoading(true);
    try {
      console.log('Loading role permissions from database...');

      const { data, error } = await supabase
        .from('role_permissions')
        .select('*');

      console.log('Load permissions result:', { data, error });

      if (error) {
        console.error('Error loading role permissions:', error);
        if (error.code === '42P01') {
          console.log('Table role_permissions does not exist. Using default permissions.');
          alert('Role permissions table not found. Please create the database table first. Using default permissions for now.');
        }
        // Keep default permissions if database load fails
        setPermissionsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        console.log(`Loaded ${data.length} permission records from database`);

        // Convert flat database records to nested permission object
        const permissionsFromDB = {};

        data.forEach(record => {
          if (!permissionsFromDB[record.role]) {
            permissionsFromDB[record.role] = {};
          }
          if (!permissionsFromDB[record.role][record.category]) {
            permissionsFromDB[record.role][record.category] = {};
          }
          permissionsFromDB[record.role][record.category][record.permission] = record.value;
        });

        console.log('Permissions from DB:', permissionsFromDB);

        // Merge with defaults to ensure all permissions exist
        const mergedPermissions = { ...rolePermissions };
        Object.keys(permissionsFromDB).forEach(role => {
          if (mergedPermissions[role]) {
            Object.keys(permissionsFromDB[role]).forEach(category => {
              if (mergedPermissions[role][category]) {
                Object.keys(permissionsFromDB[role][category]).forEach(permission => {
                  mergedPermissions[role][category][permission] = permissionsFromDB[role][category][permission];
                });
              }
            });
          }
        });

        console.log('Final merged permissions:', mergedPermissions);
        setRolePermissions(mergedPermissions);
      } else {
        console.log('No permission records found in database. Using defaults.');
      }
    } catch (err) {
      console.error('Error loading role permissions:', err);
      alert(`Error loading permissions: ${err.message}. Using default permissions.`);
    }
    setPermissionsLoading(false);
  };

  const saveRolePermissionToDB = async (role, category, permission, value) => {
    try {
      console.log(`Attempting to save: ${role}.${category}.${permission} = ${value}`);

      // First try to update existing record
      const { data: existingData, error: fetchError } = await supabase
        .from('role_permissions')
        .select('id')
        .eq('role', role)
        .eq('category', category)
        .eq('permission', permission)
        .single();

      console.log('Fetch result:', { existingData, fetchError });

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }

      if (existingData) {
        // Update existing record
        console.log('Updating existing record:', existingData.id);
        const { error: updateError } = await supabase
          .from('role_permissions')
          .update({ value: value })
          .eq('id', existingData.id);

        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }
        console.log('Update successful');
      } else {
        // Insert new record
        console.log('Inserting new record');
        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert([{
            role: role,
            category: category,
            permission: permission,
            value: value
          }]);

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }
        console.log('Insert successful');
      }

      console.log(`✅ Saved permission: ${role}.${category}.${permission} = ${value}`);
    } catch (error) {
      console.error('❌ Error saving role permission:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      alert(`Error saving permission changes: ${error.message || 'Unknown error'}. Check console for details.`);
    }
  };

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

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
        .order('sort_order', { ascending: true });

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
        .order('username', { ascending: true });

      if (error) {
        console.error('Error loading users:', error);
      } else {
        setUsers(data || []);
      }
    } catch (err) {
      console.error('Error in loadUsers:', err);
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

  const resetFilters = () => {
    setFilters({
      dateFrom: '', dateTo: '', categories: [], types: [], paymentMethods: [], searchText: ''
    });
  };

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

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.categories.length > 0) count++;
    if (filters.types.length > 0) count++;
    if (filters.paymentMethods.length > 0) count++;
    if (filters.searchText) count++;
    return count;
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout? Your data will remain safe in the cloud.')) {
      onLogout();
    }
  };

  const clearAllData = async () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      try {
        // Clear transactions
        await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // Clear categories and re-add defaults
        await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // Clear role permissions and reset to defaults
        await supabase.from('role_permissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // Re-add default categories with sort order
        const defaultCategories = [
          { name: 'Balance From Last Month', type: 'income', sort_order: 1 },
          { name: 'Direct Orkid', type: 'income', sort_order: 2 },
          { name: 'Direct Melur', type: 'income', sort_order: 3 },
          { name: 'Direct Cempaka', type: 'income', sort_order: 4 },
          { name: 'Asrap', type: 'income', sort_order: 5 },
          { name: 'Warung Zul', type: 'income', sort_order: 6 },
          { name: 'Gerai Kak Zura', type: 'income', sort_order: 7 },
          { name: 'Gerai Fafau', type: 'income', sort_order: 8 },
          { name: 'Delivery', type: 'income', sort_order: 9 },
          { name: 'Bawang Besar', type: 'expense', sort_order: 1 },
          { name: 'Bawang Kecil', type: 'expense', sort_order: 2 },
          { name: 'Bawang Rose', type: 'expense', sort_order: 3 },
          { name: 'Minyak', type: 'expense', sort_order: 4 },
          { name: 'Tepung', type: 'expense', sort_order: 5 },
          { name: 'Packaging Orkid', type: 'expense', sort_order: 6 },
          { name: 'Container Sambal Orkid', type: 'expense', sort_order: 7 },
          { name: 'Ayien Withdraw', type: 'expense', sort_order: 8 },
          { name: 'Ayien Own Expenses', type: 'expense', sort_order: 9 }
        ];

        await supabase.from('categories').insert(defaultCategories);

        // Reload data
        await loadAllData();
        await loadRolePermissions(); // Reload permissions to defaults
        alert('All data cleared and reset to defaults!');
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Error clearing data. Please try again.');
      }
    }
  };

  const exportBackup = async () => {
    try {
      const backup = {
        transactions,
        categories,
        users: users.map(u => ({ ...u, password_hash: '***' })), // Don't export passwords
        exportDate: new Date().toISOString(),
        version: '2.0'
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tya-lempeng-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Error creating backup. Please try again.');
    }
  };

  const importBackup = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const backup = JSON.parse(e.target.result);
        if (backup.transactions && backup.categories) {
          // Clear existing data
          await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');

          // Import new data
          if (backup.categories.length > 0) {
            await supabase.from('categories').insert(backup.categories.map(c => ({ name: c.name, type: c.type })));
          }
          if (backup.transactions.length > 0) {
            await supabase.from('transactions').insert(backup.transactions.map(t => ({
              type: t.type,
              amount: t.amount,
              quantity: t.quantity || 1,
              total_amount: t.total_amount || t.amount,
              category: t.category,
              description: t.description,
              payment_method: t.payment_method,
              date: t.date
              // Removed created_by since column doesn't exist
            })));
          }

          await loadAllData();
          alert('Backup imported successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (error) {
        console.error('Error importing backup:', error);
        alert('Error reading backup file.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const resetForm = () => {
    setFormData({
      type: 'income', amount: '', quantity: ' ', category: '', description: '', paymentMethod: 'online',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingTransaction(null);
  };

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
      date: formData.date
      // Removed created_by field since column doesn't exist
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
      // Get the highest sort_order for this category type
      const categoriesOfType = categories.filter(c => c.type === categoryType);
      const maxSortOrder = categoriesOfType.length > 0
        ? Math.max(...categoriesOfType.map(c => c.sort_order || 0))
        : 0;

      const { error } = await supabase
        .from('categories')
        .insert([{
          name: newCategory,
          type: categoryType,
          sort_order: maxSortOrder + 1
        }]);

      if (error) throw error;
      await loadCategories();
      setNewCategory('');
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Error adding category. Please try again.');
    }
  };

  const removeCategory = async (categoryName, categoryType) => {
    if (window.confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('name', categoryName)
          .eq('type', categoryType);

        if (error) throw error;
        await loadCategories();
      } catch (error) {
        console.error('Error removing category:', error);
        alert('Error removing category. Please try again.');
      }
    }
  };

  const startEditCategory = (category, type) => {
    setEditingCategory({ category, type });
    setEditCategoryValue(category);
  };

  const saveEditCategory = async () => {
    if (!editCategoryValue.trim() || !editingCategory) return;
    const oldCategory = editingCategory.category;
    const newCategoryName = editCategoryValue.trim();

    try {
      // Update category name
      const { error: categoryError } = await supabase
        .from('categories')
        .update({ name: newCategoryName })
        .eq('name', oldCategory)
        .eq('type', editingCategory.type);

      if (categoryError) throw categoryError;

      // Update transactions with old category name
      const { error: transactionError } = await supabase
        .from('transactions')
        .update({ category: newCategoryName })
        .eq('category', oldCategory);

      if (transactionError) throw transactionError;

      await Promise.all([loadCategories(), loadTransactions()]);
      setEditingCategory(null);
      setEditCategoryValue('');
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error updating category. Please try again.');
    }
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryValue('');
  };

  // Category sorting functions
  const moveCategoryUp = async (categoryName, categoryType) => {
    const categoriesOfType = categories.filter(c => c.type === categoryType);
    const currentIndex = categoriesOfType.findIndex(c => c.name === categoryName);

    if (currentIndex <= 0) return; // Already at the top

    const currentCategory = categoriesOfType[currentIndex];
    const previousCategory = categoriesOfType[currentIndex - 1];

    try {
      // Swap sort_order values
      await supabase
        .from('categories')
        .update({ sort_order: previousCategory.sort_order })
        .eq('name', currentCategory.name)
        .eq('type', currentCategory.type);

      await supabase
        .from('categories')
        .update({ sort_order: currentCategory.sort_order })
        .eq('name', previousCategory.name)
        .eq('type', previousCategory.type);

      await loadCategories();
    } catch (error) {
      console.error('Error moving category up:', error);
      alert('Error reordering category. Please try again.');
    }
  };

  const moveCategoryDown = async (categoryName, categoryType) => {
    const categoriesOfType = categories.filter(c => c.type === categoryType);
    const currentIndex = categoriesOfType.findIndex(c => c.name === categoryName);

    if (currentIndex >= categoriesOfType.length - 1) return; // Already at the bottom

    const currentCategory = categoriesOfType[currentIndex];
    const nextCategory = categoriesOfType[currentIndex + 1];

    try {
      // Swap sort_order values
      await supabase
        .from('categories')
        .update({ sort_order: nextCategory.sort_order })
        .eq('name', currentCategory.name)
        .eq('type', currentCategory.type);

      await supabase
        .from('categories')
        .update({ sort_order: currentCategory.sort_order })
        .eq('name', nextCategory.name)
        .eq('type', nextCategory.type);

      await loadCategories();
    } catch (error) {
      console.error('Error moving category down:', error);
      alert('Error reordering category. Please try again.');
    }
  };

  // User Management Functions
  const resetUserForm = () => {
    setUserForm({
      username: '',
      password: '',
      role: 'User',
      active: true
    });
    setEditingUser(null);
    setShowUserPassword(false);
  };

  const handleUserSubmit = async () => {
    if (!userForm.username.trim() || !userForm.password.trim()) return;

    try {
      // Check for duplicate username (except when editing)
      const { data: existingUsers } = await supabase
        .from('users')
        .select('id')
        .eq('username', userForm.username.toLowerCase());

      if (existingUsers && existingUsers.length > 0 && (!editingUser || existingUsers[0].id !== editingUser.id)) {
        alert('Username already exists. Please choose a different username.');
        return;
      }

      const userData = {
        username: userForm.username,
        password_hash: userForm.password, // In production, hash this
        role: userForm.role,
        active: userForm.active
      };

      if (editingUser) {
        const { error } = await supabase
          .from('users')
          .update(userData)
          .eq('id', editingUser.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('users')
          .insert([userData]);

        if (error) throw error;
      }

      await loadUsers();
      resetUserForm();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user. Please try again.');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      username: user.username,
      password: user.password_hash,
      role: user.role,
      active: user.active
    });
    setShowUserPassword(false);
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) {
      alert('You cannot delete your own account while logged in.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', userId);

        if (error) throw error;
        await loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user. Please try again.');
      }
    }
  };

  const toggleUserStatus = async (userId) => {
    if (userId === currentUser.id) {
      alert('You cannot deactivate your own account while logged in.');
      return;
    }

    try {
      const user = users.find(u => u.id === userId);
      const { error } = await supabase
        .from('users')
        .update({ active: !user.active })
        .eq('id', userId);

      if (error) throw error;
      await loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Error updating user status. Please try again.');
    }
  };

  const updateRolePermission = (category, permission, value) => {
    setRolePermissions(prev => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [category]: {
          ...prev[selectedRole][category],
          [permission]: value
        }
      }
    }));

    // Save to database
    saveRolePermissionToDB(selectedRole, category, permission, value);
  };

  const resetAccessManager = () => {
    setSelectedRole('Administrator');
    setShowAccessManager(false);
  };

  const calculateTotals = (transactionList = transactions) => {
    const income = transactionList
      .filter(t => t.type === 'income' && t.category !== 'Balance From Last Month' && t.category !== 'Delivery')
      .reduce((sum, t) => sum + (t.total_amount || t.amount), 0);

    // Business expenses (excluding Ayien's personal expenses)
    const businessExpenses = transactionList
      .filter(t => t.type === 'expense' &&
        !t.category.toLowerCase().includes('ayien withdraw') &&
        !t.category.toLowerCase().includes('ayien own expenses'))
      .reduce((sum, t) => sum + (t.total_amount || t.amount), 0);

    // Cash Balance = Balance from Last Month (Cash method) + Cash Income - Cash Expenses
    const balanceFromLastMonthCash = transactionList
      .filter(t => t.type === 'income' && t.category === 'Balance From Last Month' && t.payment_method === 'cash')
      .reduce((sum, t) => sum + (t.total_amount || t.amount), 0);

    const cashIncomeOnly = transactionList
      .filter(t => t.type === 'income' && t.payment_method === 'cash' && t.category !== 'Balance From Last Month')
      .reduce((sum, t) => sum + (t.total_amount || t.amount), 0);

    const cashExpenses = transactionList
      .filter(t => t.type === 'expense' && t.payment_method === 'cash')
      .reduce((sum, t) => sum + (t.total_amount || t.amount), 0);

    const cashBalance = balanceFromLastMonthCash + cashIncomeOnly - cashExpenses;

    // Online Balance = Balance from Last Month (Online Transaction method) + Online Income - Online Expenses
    const balanceFromLastMonth = transactionList
      .filter(t => t.type === 'income' && t.category === 'Balance From Last Month' && t.payment_method === 'online')
      .reduce((sum, t) => sum + (t.total_amount || t.amount), 0);

    const onlineIncomeOnly = transactionList
      .filter(t => t.type === 'income' && t.payment_method === 'online' && t.category !== 'Balance From Last Month')
      .reduce((sum, t) => sum + (t.total_amount || t.amount), 0);

    const onlineExpenses = transactionList
      .filter(t => t.type === 'expense' && t.payment_method === 'online')
      .reduce((sum, t) => sum + (t.total_amount || t.amount), 0);

    const onlineBalance = balanceFromLastMonth + onlineIncomeOnly - onlineExpenses;

    // Online payments from income only (excluding Balance From Last Month)
    const onlinePayments = transactionList
      .filter(t => t.type === 'income' && t.payment_method === 'online' && t.category !== 'Balance From Last Month')
      .reduce((sum, t) => sum + (t.total_amount || t.amount), 0);

    // Total cash transactions (both income and expenses, excluding Balance From Last Month)
    const cashTotal = transactionList
      .filter(t => t.payment_method === 'cash' && t.category !== 'Balance From Last Month')
      .reduce((sum, t) => sum + (t.total_amount || t.amount), 0);
    const ayienSpending = transactionList.filter(t => t.category.toLowerCase().includes('ayien')).reduce((sum, t) => sum + (t.total_amount || t.amount), 0);

    // Delivery fees tracking
    const deliveryFees = transactionList
      .filter(t => t.type === 'income' && t.category === 'Delivery')
      .reduce((sum, t) => sum + (t.total_amount || t.amount), 0);

    return {
      income,
      expenses: businessExpenses,
      balance: income - businessExpenses,
      cashBalance,
      onlineBalance,
      onlinePayments,
      cashTotal,
      ayienSpending,
      balanceFromLastMonth,
      onlineIncomeOnly,
      onlineExpenses,
      balanceFromLastMonthCash,
      cashIncomeOnly,
      cashExpenses,
      deliveryFees
    };
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Unit Amount', 'Quantity', 'Total Amount', 'Payment Method'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        t.date, t.type, `"${t.category}"`, `"${t.description || ''}"`,
        t.amount, t.quantity || 1, t.total_amount || t.amount, t.payment_method
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tya-lempeng-filtered-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredTransactions = getFilteredTransactions();
  const { income, expenses, balance, cashBalance, onlineBalance, onlinePayments, cashTotal, ayienSpending, balanceFromLastMonth, onlineIncomeOnly, onlineExpenses, balanceFromLastMonthCash, cashIncomeOnly, cashExpenses, deliveryFees } = calculateTotals(filteredTransactions);
  const allCategories = categories.map(c => c.name);
  const incomeCategories = categories.filter(c => c.type === 'income').map(c => c.name);
  const expenseCategories = categories.filter(c => c.type === 'expense').map(c => c.name);
  const currentCategories = formData.type === 'income' ? incomeCategories : expenseCategories;

  if (loading || permissionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {loading ? 'Loading your financial data...' : 'Loading access permissions...'}
          </p>
        </div>
      </div>
    );
  }

  // Calculate orders data for dashboard
  const calculateOrdersData = () => {
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const excludedCategories = ['Balance From Last Month', 'Delivery', 'Other'];

    // Group transactions by category and sum quantities
    const ordersByCategory = {};

    incomeTransactions.forEach(transaction => {
      const category = transaction.category;

      // Skip excluded categories
      if (excludedCategories.includes(category)) return;

      const quantity = parseFloat(transaction.quantity) || 1;

      if (ordersByCategory[category]) {
        ordersByCategory[category] += quantity;
      } else {
        ordersByCategory[category] = quantity;
      }
    });

    // Convert to array and sort by quantity (highest first)
    return Object.entries(ordersByCategory)
      .map(([category, qty]) => ({ category, quantity: qty }))
      .sort((a, b) => b.quantity - a.quantity);
  };

  // DASHBOARD COMPONENT
  const DashboardTab = () => {
    const ordersData = calculateOrdersData();
    const totalItemsSold = ordersData.reduce((sum, order) => sum + order.quantity, 0);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Overview</h2>

          {/* Data Status */}
          <div className="bg-blue-50 p-3 rounded-lg mb-6 border border-blue-200">
            <p className="text-sm text-blue-700">
              📊 <strong>Total Transactions:</strong> {transactions.length} •
              <strong>This Month:</strong> {transactions.filter(t => new Date(t.date).getMonth() === new Date().getMonth()).length} •
              <strong>Last Updated:</strong> {transactions.length > 0 ? new Date(Math.max(...transactions.map(t => new Date(t.date)))).toLocaleString() : 'Never'}
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Total Sales</p>
                  <p className="text-3xl font-bold text-green-700">RM {income.toFixed(2)}</p>
                  <p className="text-sm text-green-600 mt-1">
                    {transactions.filter(t => t.type === 'income' && t.category !== 'Balance From Last Month' && t.category !== 'Delivery').length} transactions
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Business Expenses</p>
                  <p className="text-3xl font-bold text-red-700">RM {expenses.toFixed(2)}</p>
                  <p className="text-sm text-red-600 mt-1">
                    {transactions.filter(t => t.type === 'expense' &&
                      !t.category.toLowerCase().includes('ayien withdraw') &&
                      !t.category.toLowerCase().includes('ayien own expenses')).length} transactions
                  </p>
                </div>
                <TrendingDown className="h-12 w-12 text-red-600" />
              </div>
            </div>

            <div className={`p-6 rounded-lg border ${cashBalance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${cashBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>Cash Balance</p>
                  <p className={`text-3xl font-bold ${cashBalance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>RM {cashBalance.toFixed(2)}</p>
                  <div className={`text-xs mt-1 ${cashBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    <p>Last Month: +{balanceFromLastMonthCash.toFixed(2)}</p>
                    <p>Cash Income: +{cashIncomeOnly.toFixed(2)}</p>
                    <p>Cash Expenses: -{cashExpenses.toFixed(2)}</p>
                  </div>
                </div>
                <DollarSign className={`h-12 w-12 ${cashBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
              </div>
            </div>

            <div className={`p-6 rounded-lg border ${onlineBalance >= 0 ? 'bg-purple-50 border-purple-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${onlineBalance >= 0 ? 'text-purple-600' : 'text-red-600'}`}>Online Balance</p>
                  <p className={`text-3xl font-bold ${onlineBalance >= 0 ? 'text-purple-700' : 'text-red-700'}`}>RM {onlineBalance.toFixed(2)}</p>
                  <div className={`text-xs mt-1 ${onlineBalance >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                    <p>Last Month: +{balanceFromLastMonth.toFixed(2)}</p>
                    <p>Online Income: +{onlineIncomeOnly.toFixed(2)}</p>
                    <p>Online Expenses: -{onlineExpenses.toFixed(2)}</p>
                  </div>
                </div>
                <CreditCard className={`h-12 w-12 ${onlineBalance >= 0 ? 'text-purple-600' : 'text-red-600'}`} />
              </div>
            </div>

            <div className="bg-cyan-50 p-6 rounded-lg border border-cyan-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-600 text-sm font-medium">Online Payments</p>
                  <p className="text-3xl font-bold text-cyan-700">RM {onlinePayments.toFixed(2)}</p>
                  <p className="text-sm text-cyan-600 mt-1">
                    {transactions.filter(t => t.type === 'income' && t.payment_method === 'online' && t.category !== 'Balance From Last Month').length} transactions
                  </p>
                </div>
                <CreditCard className="h-12 w-12 text-cyan-600" />
              </div>
            </div>

            <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-sm font-medium">Cash Payments</p>
                  <p className="text-3xl font-bold text-emerald-700">RM {cashTotal.toFixed(2)}</p>
                  <p className="text-sm text-emerald-600 mt-1">
                    {transactions.filter(t => t.payment_method === 'cash' && t.category !== 'Balance From Last Month').length} transactions
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-emerald-600" />
              </div>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Delivery Fees</p>
                  <p className="text-3xl font-bold text-orange-700">RM {deliveryFees.toFixed(2)}</p>
                  <p className="text-sm text-orange-600 mt-1">
                    {transactions.filter(t => t.type === 'income' && t.category === 'Delivery').length} deliveries
                  </p>
                </div>
                <Truck className="h-12 w-12 text-orange-600" />
              </div>
            </div>

            <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-600 text-sm font-medium">Ayien's Expenses</p>
                  <p className="text-3xl font-bold text-amber-700">RM {ayienSpending.toFixed(2)}</p>
                  <p className="text-sm text-amber-600 mt-1">
                    {transactions.filter(t => t.category.toLowerCase().includes('ayien')).length} transactions
                  </p>
                </div>
                <Settings className="h-12 w-12 text-amber-600" />
              </div>
            </div>

            <div className={`p-6 rounded-lg border ${balance >= 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${balance >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>Total Net Balance</p>
                  <p className={`text-3xl font-bold ${balance >= 0 ? 'text-yellow-700' : 'text-red-700'}`}>RM {balance.toFixed(2)}</p>
                  <p className={`text-sm mt-1 ${balance >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                    💰 {balance >= 0 ? 'Business Profit' : 'Business Loss'}
                  </p>
                </div>
                <TrendingUp className={`h-12 w-12 ${balance >= 0 ? 'text-yellow-600' : 'text-red-600'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Overview Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Delivery Overview</h3>
            <div className="bg-orange-100 px-3 py-1 rounded-full">
              <span className="text-orange-800 text-sm font-medium">
                Total Service Fees: RM {deliveryFees.toFixed(2)}
              </span>
            </div>
          </div>

          {deliveryFees === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">🚚 No delivery fees recorded yet!</p>
              <p className="text-sm text-gray-400">Add delivery transactions to track your service fees</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-700">RM {deliveryFees.toFixed(2)}</p>
                <p className="text-sm text-orange-600">Total Fees</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">
                  {transactions.filter(t => t.type === 'income' && t.category === 'Delivery').length}
                </p>
                <p className="text-sm text-blue-600">Deliveries</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">
                  RM {transactions.filter(t => t.type === 'income' && t.category === 'Delivery').length > 0
                    ? (deliveryFees / transactions.filter(t => t.type === 'income' && t.category === 'Delivery').length).toFixed(2)
                    : '0.00'}
                </p>
                <p className="text-sm text-green-600">Avg Fee</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-700">
                  {income > 0 ? ((deliveryFees / (income + deliveryFees)) * 100).toFixed(1) : '0.0'}%
                </p>
                <p className="text-sm text-purple-600">Of Total Revenue</p>
              </div>
            </div>
          )}
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Orders Summary</h3>
            <div className="bg-orange-100 px-3 py-1 rounded-full">
              <span className="text-orange-800 text-sm font-medium">
                Total Items Sold: {totalItemsSold}
              </span>
            </div>
          </div>

          {ordersData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">🥞 No lempeng orders yet!</p>
              <p className="text-sm text-gray-400">Add some income transactions to see your orders summary</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Lempeng</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Qty</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersData.map((order, index) => {
                    const percentage = totalItemsSold > 0 ? (order.quantity / totalItemsSold * 100) : 0;
                    return (
                      <tr key={order.category} className={`border-b border-gray-100 hover:bg-gray-50 ${index === 0 ? 'bg-green-50' : ''}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {index === 0 && <span className="text-green-600 mr-2">🏆</span>}
                            <span className={`font-medium ${index === 0 ? 'text-green-800' : 'text-gray-800'}`}>
                              {order.category}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-bold ${index === 0 ? 'text-green-700' : 'text-gray-700'}`}>
                            {order.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-gray-600">
                            {percentage.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Orders Stats */}
          {ordersData.length > 0 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">#{ordersData.length}</p>
                <p className="text-sm text-green-600">Product Types</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-700">{totalItemsSold}</p>
                <p className="text-sm text-orange-600">Total Items</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">
                  {ordersData.length > 0 ? (totalItemsSold / ordersData.length).toFixed(1) : '0'}
                </p>
                <p className="text-sm text-blue-600">Avg per Product</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-700">
                  {ordersData[0]?.category.slice(0, 10) || 'N/A'}
                </p>
                <p className="text-sm text-purple-600">Top Seller</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

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
            <p className="text-2xl font-bold text-green-700">RM {income.toFixed(0)}</p>
            <p className="text-sm text-green-600">Total Sales</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-700">RM {expenses.toFixed(0)}</p>
            <p className="text-sm text-red-600">Business Expenses</p>
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

  // ADMIN COMPONENT
  const AdminTab = () => (
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
                onClick={() => setShowUserManager(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Manage Users
              </button>
            )}
            {hasPermission('admin', 'manageAccess') && (
              <button
                onClick={() => setShowAccessManager(true)}
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
          onClick={() => setShowCategoryManager(true)}
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Online</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Tya's Lempeng</h1>
          <p className="text-sm text-gray-600">Financial Tracker</p>
        </div>

        <nav className="p-4">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              // Check if user has permission to view this tab
              const canViewTab =
                (tab.id === 'dashboard' && hasPermission('dashboard', 'viewDashboard')) ||
                (tab.id === 'transactions' && hasPermission('transactions', 'viewTransactions')) ||
                (tab.id === 'admin' && hasPermission('admin', 'viewAdmin'));

              if (!canViewTab) return null;

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
            <p className="text-xs text-blue-600 mt-1">
              {Object.values(rolePermissions[currentUser.role] || {}).reduce((total, category) =>
                total + Object.values(category).filter(Boolean).length, 0
              )} permissions active
            </p>
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
                {activeTab === 'admin' && 'System settings and user management'}
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

      {/* Access Manager Modal */}
      {showAccessManager && (
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
                onClick={resetAccessManager}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Manager Modal */}
      {showUserManager && (
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

            <div className="flex justify-end mt-6">
              <button
                onClick={() => { setShowUserManager(false); resetUserForm(); }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
                <h3 className="font-semibold mb-3 text-green-700">Income Categories ({incomeCategories.length})</h3>
                <div className="space-y-2">
                  {incomeCategories.map((category, index) => (
                    <div key={category} className="flex items-center gap-2 bg-green-50 p-2 rounded">
                      {editingCategory && editingCategory.category === category && editingCategory.type === 'income' ? (
                        <>
                          <input
                            type="text" value={editCategoryValue} onChange={(e) => setEditCategoryValue(e.target.value)}
                            className="flex-1 border border-green-300 rounded px-2 py-1 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            onKeyPress={(e) => e.key === 'Enter' && saveEditCategory()}
                          />
                          <button onClick={saveEditCategory} className="text-green-600 hover:text-green-800 px-2" title="Save">✓</button>
                          <button onClick={cancelEditCategory} className="text-red-600 hover:text-red-800 px-2" title="Cancel">✕</button>
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
                          <button onClick={() => startEditCategory(category, 'income')} className="text-yellow-600 hover:text-yellow-800" title="Edit">
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button onClick={() => removeCategory(category, 'income')} className="text-red-600 hover:text-red-800" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-red-700">Expense Categories ({expenseCategories.length})</h3>
                <div className="space-y-2">
                  {expenseCategories.map((category, index) => (
                    <div key={category} className="flex items-center gap-2 bg-red-50 p-2 rounded">
                      {editingCategory && editingCategory.category === category && editingCategory.type === 'expense' ? (
                        <>
                          <input
                            type="text" value={editCategoryValue} onChange={(e) => setEditCategoryValue(e.target.value)}
                            className="flex-1 border border-red-300 rounded px-2 py-1 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            onKeyPress={(e) => e.key === 'Enter' && saveEditCategory()}
                          />
                          <button onClick={saveEditCategory} className="text-green-600 hover:text-green-800 px-2" title="Save">✓</button>
                          <button onClick={cancelEditCategory} className="text-red-600 hover:text-red-800 px-2" title="Cancel">✕</button>
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
                          <button onClick={() => startEditCategory(category, 'expense')} className="text-yellow-600 hover:text-yellow-800" title="Edit">
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button onClick={() => removeCategory(category, 'expense')} className="text-red-600 hover:text-red-800" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => { setShowCategoryManager(false); setEditingCategory(null); setEditCategoryValue(''); }}
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