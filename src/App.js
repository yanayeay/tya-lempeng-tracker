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
  const DashboardTab = () => {
    const ordersData = calculateOrdersData(transactions);
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

  //ORDER COMPONENT
  const OrdersTab = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-wrap gap-3 mb-4">
            {hasPermission('orders', 'addOrder') && (
              <button onClick={() => openOrderModal()} className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2 transition-colors">
                <Plus className="h-4 w-4" /> Add Order
              </button>
            )}
            {hasPermission('orders', 'filterOrder') && (
              <button
                onClick={() => setShowOrderFilters(!showOrderFilters)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  showOrderFilters ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Filter className="h-4 w-4" />
                Filters {getActiveOrderFiltersCount() > 0 && `(${getActiveOrderFiltersCount()})`}
              </button>
            )}
            {hasPermission('orders', 'exportOrderCSV') && orders.length > 0 && (
              <button
                onClick={exportOrdersToCSV}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-colors"
              >
                📊 Export CSV
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-700">{filteredOrders.length}</p>
              <p className="text-sm text-blue-600">Total Orders</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">{filteredOrders.filter(o => o.payment_status === 'Paid').length}</p>
              <p className="text-sm text-green-600">Paid Orders</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-700">{filteredOrders.filter(o => o.payment_status === 'Unpaid').length}</p>
              <p className="text-sm text-yellow-600">Pending Payment</p>
            </div>
          </div>
        </div>

        {/* Order Filters Panel */}
        {showOrderFilters && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Filter Orders</h3>
              <button onClick={() => setShowOrderFilters(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text" placeholder="Search name, set, address, remarks..."
                  value={orderFilters.searchText} onChange={(e) => updateOrderFilter('searchText', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  type="date" value={orderFilters.dateFrom} onChange={(e) => updateOrderFilter('dateFrom', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date" value={orderFilters.dateTo} onChange={(e) => updateOrderFilter('dateTo', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lempeng Sets</label>
                <div className="space-y-2">
                  {['Orkid', 'Melur', 'Cempaka','Sambal'].map(set => (
                    <label key={set} className="flex items-center">
                      <input
                        type="checkbox" checked={orderFilters.sets.includes(set)} onChange={() => toggleOrderArrayFilter('sets', set)}
                        className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="text-sm">{set}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <div className="space-y-2">
                  {['Paid', 'Unpaid'].map(status => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox" checked={orderFilters.paymentStatus.includes(status)} onChange={() => toggleOrderArrayFilter('paymentStatus', status)}
                        className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="text-sm">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={resetOrderFilters} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                Reset Filters
              </button>
              <div className="text-sm text-gray-600 flex items-center">
                Showing {filteredOrders.length} of {orders.length} orders
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Orders</h3>
              {getActiveOrderFiltersCount() > 0 && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-purple-600 font-medium">
                    {getActiveOrderFiltersCount()} filter{getActiveOrderFiltersCount() > 1 ? 's' : ''} active
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="p-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                {orders.length === 0 ? (
                  <div>
                    <p className="text-gray-500 mb-4">🎉 Start managing your orders!</p>
                    <p className="text-sm text-gray-400">Add your first order to get started</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 mb-2">No orders match your current filters.</p>
                    <button onClick={resetOrderFilters} className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                      Reset filters to see all orders
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date)).map(order => (
                  <div key={order.id} className="border rounded-lg hover:bg-gray-50 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-3 h-3 rounded-full ${order.payment_status === 'Paid' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <h4 className="font-semibold text-lg text-gray-900">{order.name}</h4>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div>
                              <span className="font-medium text-gray-700">Lempeng Set:</span>
                              <span className="ml-2 text-gray-900">{order.set}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Quantity:</span>
                              <span className="ml-2 text-gray-900">{order.quantity}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Time:</span>
                              <span className="ml-2 text-gray-900">{order.time}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Order Date:</span>
                              <span className="ml-2 text-gray-900">{order.order_date}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {order.delivery_date && (
                              <div>
                                <span className="font-medium text-gray-700">Delivery Date:</span>
                                <span className="ml-2 text-gray-900">{order.delivery_date}</span>
                              </div>
                            )}
                            {order.delivery && order.delivery_address && (
                              <div>
                                <span className="font-medium text-gray-700">Delivery Address:</span>
                                <span className="ml-2 text-gray-900">{order.delivery_address}</span>
                              </div>
                            )}
                            {order.delivery && !order.delivery_address && (
                              <div>
                                <span className="font-medium text-blue-700">🚚 Delivery Required</span>
                                <span className="ml-2 text-gray-500">(No address specified)</span>
                              </div>
                            )}
                            {order.remarks && (
                              <div>
                                <span className="font-medium text-gray-700">Remarks:</span>
                                <span className="ml-2 text-gray-900">{order.remarks}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.payment_status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {order.payment_status}
                        </span>
                        {hasPermission('orders', 'editOrder') && (
                          <button onClick={() => handleEditOrder(order)} className="text-yellow-600 hover:text-yellow-800" title="Edit Order">
                            <Edit3 className="h-4 w-4" />
                          </button>
                        )}
                        {hasPermission('orders', 'deleteOrder') && (
                          <button onClick={() => handleDeleteOrder(order.id)} className="text-red-600 hover:text-red-800" title="Delete Order">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
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
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'transactions' && <TransactionsTab />}
          {activeTab === 'admin' && <AdminTab />}
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