// hooks/useModals.js
import { useState } from 'react';

export const useModals = () => {
  // Modal visibility states
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showUserManager, setShowUserManager] = useState(false);
  const [showAccessManager, setShowAccessManager] = useState(false);

  // Editing states
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  // Modal actions
  const openTransactionModal = (transaction = null) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const closeTransactionModal = () => {
    setShowTransactionForm(false);
    setEditingTransaction(null);
  };

  const openOrderModal = (order = null) => {
    setEditingOrder(order);
    setShowOrderForm(true);
  };

  const closeOrderModal = () => {
    setShowOrderForm(false);
    setEditingOrder(null);
  };

  const openCategoryModal = () => {
    setShowCategoryManager(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryManager(false);
  };

  const openUserModal = (user = null) => {
    setEditingUser(user);
    setShowUserManager(true);
  };

  const closeUserModal = () => {
    setShowUserManager(false);
    setEditingUser(null);
  };

  const openAccessModal = () => {
    setShowAccessManager(true);
  };

  const closeAccessModal = () => {
    setShowAccessManager(false);
  };

  return {
    // States
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
  };
};