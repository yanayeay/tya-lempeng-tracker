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
  LogOut,
  Globe,
  BarChart3,
  CreditCard,
  Shield,
  ShoppingCart,
  Eye,
  EyeOff,
  Truck,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import AuthWrapper from './components/auth/AuthWrapper';
import { useTransactions } from './hooks/useTransactions';
import { calculateTransactionTotals, calculateOrdersData } from './utils/calculations';
import { usePermissions } from './hooks/usePermissions';
import { TAB_CONFIGURATION } from './config/tabs';
import { checkTabAccess, getDefaultTab } from './utils/permissions';
import { useModals } from './hooks/useModals';
import { TransactionModal, OrderModal } from './components/modals';
import { DashboardTab, TransactionsTab, OrdersTab, AdminTab } from './components/tabs';

const FinanceTracker = ({ onLogout, currentUser }) => {
  // Use permission hook instead of managing state manually
  const {
    rolePermissions,
    loading: permissionsLoading,
    hasPermission: checkUserPermission,
    updateRolePermission,
    getDefaultTab: getDefaultTabForUser,
    error: permissionError
  } = usePermissions();

  // Create permission checker function for current user
  const hasPermission = (category, permission) => {
    return checkUserPermission(currentUser?.role, category, permission);
  };

  const {
   // States - ALL of these should be included
     showTransactionForm,
     showOrderForm,
     showCategoryManager,
     showUserManager,
     showAccessManager,
     editingTransaction,
     editingOrder,
     editingUser,

     // Actions
     openTransactionModal,
     closeTransactionModal,
     openOrderModal,
     closeOrderModal,
     openCategoryModal,
     closeCategoryModal,
     openUserModal,
     closeUserModal,
     openAccessModal,
     closeAccessModal
  } = useModals();

  // States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const [selectedRole, setSelectedRole] = useState('Administrator');
  const [showUserPassword, setShowUserPassword] = useState(false);

  //Order management states
  const [orders, setOrders] = useState([]);
  const [showOrderFilters, setShowOrderFilters] = useState(false);

  const [orderFilters, setOrderFilters] = useState({
    dateFrom: '',
    dateTo: '',
    sets: [],
    paymentStatus: [],
    searchText: ''
  });

  // 🎉 NEW: Use configuration instead of inline definition
  const tabs = TAB_CONFIGURATION;

  // 🎉 Simplified tab access checking
  useEffect(() => {
    if (!permissionsLoading && currentUser) {
      const canViewCurrentTab = checkTabAccess(activeTab, hasPermission);

      if (!canViewCurrentTab) {
        const defaultTab = getDefaultTab(hasPermission);
        if (defaultTab) {
          setActiveTab(defaultTab);
        }
      }
    }
  }, [activeTab, currentUser, permissionsLoading]);

  // Load data on component mount
  useEffect(() => {
    loadOtherData();
  }, []);

  const loadOtherData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCategories(),
        loadUsers(),
        loadOrders()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  // 🎉 Use transaction hook instead of managing state manually
  const {
    transactions,
    loading: transactionsLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearAllTransactions,
    error: transactionError
  } = useTransactions();

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

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('order_date', { ascending: false });
      if (error) {
        console.error('Error loading orders:', error);
      } else {
        setOrders(data || []);
      }
    } catch (err) {
      console.error('Error in loadOrders:', err);
    }
  };

  const handleOrderSubmit = async (orderFormData) => {
    if (!orderFormData.name || !orderFormData.set || !orderFormData.quantity || !orderFormData.time) {
      alert('Please fill in all required fields');
      return;
    }

    const orderData = {
      name: orderFormData.name,
      order_date: orderFormData.orderDate,
      delivery_date: orderFormData.deliveryDate || null,
      set: orderFormData.set,
      quantity: parseInt(orderFormData.quantity),
      time: orderFormData.time,
      delivery: orderFormData.delivery,
      delivery_address: orderFormData.deliveryAddress || null,
      payment_status: orderFormData.paymentStatus,
      remarks: orderFormData.remarks
    };

    try {
      if (editingOrder) {
        const { error } = await supabase.from('orders').update(orderData).eq('id', editingOrder.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('orders').insert([orderData]);
        if (error) throw error;
      }

      await loadOrders();
      closeOrderModal();

    } catch (error) {
      console.error('❌ Error saving order:', error);
      alert('Error saving order. Please try again.');
    }
  };

  const handleEditOrder = (order) => {
    openOrderModal(order);
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        const { error } = await supabase.from('orders').delete().eq('id', id);
        if (error) throw error;
        await loadOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Error deleting order. Please try again.');
      }
    }
  };

  // Transaction Filter functions
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

  // Order filter functions
  // Order filter functions
  const applyOrderFilters = (orderList) => {
    return orderList.filter(order => {
      if (orderFilters.dateFrom && order.order_date < orderFilters.dateFrom) return false;
      if (orderFilters.dateTo && order.order_date > orderFilters.dateTo) return false;
      if (orderFilters.sets.length > 0 && !orderFilters.sets.includes(order.set)) return false;
      if (orderFilters.paymentStatus.length > 0 && !orderFilters.paymentStatus.includes(order.payment_status)) return false;
      if (orderFilters.searchText) {
        const searchLower = orderFilters.searchText.toLowerCase();
        const matchesName = order.name?.toLowerCase().includes(searchLower);
        const matchesSet = order.set.toLowerCase().includes(searchLower);
        const matchesAddress = order.delivery_address?.toLowerCase().includes(searchLower);
        const matchesRemarks = order.remarks?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesSet && !matchesAddress && !matchesRemarks) return false;
      }
      return true;
    });
  };

  const getFilteredOrders = () => applyOrderFilters(orders);

  const resetOrderFilters = () => {
    setOrderFilters({
      dateFrom: '', dateTo: '', sets: [], paymentStatus: [], searchText: ''
    });
  };

  const updateOrderFilter = (filterType, value) => {
    setOrderFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const toggleOrderArrayFilter = (filterType, value) => {
    setOrderFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const getActiveOrderFiltersCount = () => {
    let count = 0;
    if (orderFilters.dateFrom || orderFilters.dateTo) count++;
    if (orderFilters.sets.length > 0) count++;
    if (orderFilters.paymentStatus.length > 0) count++;
    if (orderFilters.searchText) count++;
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
        // Clear transactions using service
        await clearAllTransactions();

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
        await loadOtherData();
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

          await loadOtherData();
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
    openTransactionModal(null);
  };

  // 🎉 Simplified transaction handlers using the hook
  const handleSubmit = async (formData) => {
    if (!formData.amount || !formData.category || !formData.quantity) return;

    const success = editingTransaction
      ? await updateTransaction(editingTransaction.id, formData)
      : await addTransaction(formData);

    if (success) {
      resetForm();
      closeTransactionModal();
    }
  };

  const handleEdit = (transaction) => {
    openTransactionModal(transaction);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id);
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

      await Promise.all([loadCategories()]);
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
    openUserModal(null);
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
    openUserModal(user);
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

  const resetAccessManager = () => {
    setSelectedRole('Administrator');
    closeAccessModal();
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

  const exportOrdersToCSV = () => {
    const headers = ['Order Date', 'Customer Name', 'Set', 'Quantity', 'Time', 'Delivery Date', 'Delivery', 'Delivery Address', 'Payment Status', 'Remarks'];
    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(o => [
        o.order_date,
        `"${o.name}"`,
        o.set,
        o.quantity,
        o.time,
        o.delivery_date || '',
        o.delivery ? 'Yes' : 'No',
        `"${o.delivery_address || ''}"`,
        o.payment_status,
        `"${o.remarks || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tya-lempeng-orders-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredTransactions = getFilteredTransactions();
  const filteredOrders = getFilteredOrders();
  // 🎉 NEW: Simplified calculations using utility functions
  const totals = calculateTransactionTotals(filteredTransactions);
  const { income, expenses, balance, cashBalance, onlineBalance, onlinePayments, cashTotal, ayienSpending, balanceFromLastMonth, onlineIncomeOnly, onlineExpenses, balanceFromLastMonthCash, cashIncomeOnly, cashExpenses, deliveryFees } = totals;
  const allCategories = categories.map(c => c.name);
  const incomeCategories = categories.filter(c => c.type === 'income').map(c => c.name);
  const expenseCategories = categories.filter(c => c.type === 'expense').map(c => c.name);
  const currentCategories = formData.type === 'income' ? incomeCategories : expenseCategories;

  if (loading || permissionsLoading || transactionsLoading) {
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

  // DASHBOARD COMPONENT
  const DashboardTabWrapper = () => (
    <DashboardTab transactions={transactions} />
  );

  // TRANSACTIONS COMPONENT
  const TransactionsTabWrapper = () => (
    <TransactionsTab
      transactions={transactions}
      filteredTransactions={filteredTransactions}
      hasPermission={hasPermission}
      openTransactionModal={openTransactionModal}
      exportToCSV={exportToCSV}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      showFilters={showFilters}
      setShowFilters={setShowFilters}
      filters={filters}
      updateFilter={updateFilter}
      toggleArrayFilter={toggleArrayFilter}
      resetFilters={resetFilters}
      getActiveFiltersCount={getActiveFiltersCount}
      allCategories={allCategories}
    />
  );

  //ORDER COMPONENT
  const OrdersTabWrapper = () => (
    <OrdersTab
      orders={orders}
      filteredOrders={filteredOrders}
      hasPermission={hasPermission}
      openOrderModal={openOrderModal}
      exportOrdersToCSV={exportOrdersToCSV}
      handleEditOrder={handleEditOrder}
      handleDeleteOrder={handleDeleteOrder}
      showOrderFilters={showOrderFilters}
      setShowOrderFilters={setShowOrderFilters}
      orderFilters={orderFilters}
      updateOrderFilter={updateOrderFilter}
      toggleOrderArrayFilter={toggleOrderArrayFilter}
      resetOrderFilters={resetOrderFilters}
      getActiveOrderFiltersCount={getActiveOrderFiltersCount}
    />
  );

  // ADMIN COMPONENT
  const AdminTabWrapper = () => (
    <AdminTab
      currentUser={currentUser}
      users={users}
      transactions={transactions}
      incomeCategories={incomeCategories}
      expenseCategories={expenseCategories}
      hasPermission={hasPermission}
      openUserModal={openUserModal}
      openAccessModal={openAccessModal}
      openCategoryModal={openCategoryModal}
      exportBackup={exportBackup}
      importBackup={importBackup}
      clearAllData={clearAllData}
    />
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
          <h1 className="text-xl font-bold text-gray-900">Tya's Lempeng Biz Tracker</h1>
        </div>

        <nav className="p-4">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              // Check if user has permission to view this tab
              const canViewTab =
                (tab.id === 'dashboard' && hasPermission('dashboard', 'viewDashboard')) ||
                (tab.id === 'transactions' && hasPermission('transactions', 'viewTransactions')) ||
                (tab.id === 'orders' && hasPermission('orders', 'viewOrders')) ||
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
          {activeTab === 'dashboard' && <DashboardTabWrapper />}
          {activeTab === 'orders' && <OrdersTabWrapper />}
          {activeTab === 'transactions' && <TransactionsTabWrapper />}
          {activeTab === 'admin' && <AdminTabWrapper />}
        </div>
      </div>

      {/* Order Form Modal */}
      <OrderModal
        isOpen={showOrderForm}
        onClose={closeOrderModal}
        editingOrder={editingOrder}
        onSubmit={handleOrderSubmit}
      />

      {/* Access Manager Modal */}


      {/* User Manager Modal */}


      {/* Category Manager Modal */}


      {/* Transaction Form Modal */}
      <TransactionModal
        isOpen={showTransactionForm}
        onClose={closeTransactionModal}
        editingTransaction={editingTransaction}
        onSubmit={handleSubmit}
        categories={categories}
      />
    </div>
  );
};

const App = () => {
  const { isAuthenticated, currentUser, logout, setAuthenticatedUser } = useAuth();

  const handleAuthentication = (user) => {
    setAuthenticatedUser(user);
  };

  if (!isAuthenticated || !currentUser) {
    return <AuthWrapper onAuthenticated={handleAuthentication} />;
  }

  return <FinanceTracker onLogout={logout} currentUser={currentUser} />;
};

export default App;