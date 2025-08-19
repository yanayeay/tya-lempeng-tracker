// hooks/useTransactions.js
import { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load all transactions from database
   */
  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add a new transaction
   * @param {Object} formData - Form data from transaction form
   * @returns {Promise<boolean>} Success status
   */
  const addTransaction = async (formData) => {
    try {
      if (!formData.amount || !formData.category || !formData.quantity) {
        throw new Error('Please fill in all required fields');
      }

      const unitAmount = parseFloat(formData.amount);
      const quantity = parseFloat(formData.quantity);
      
      if (unitAmount <= 0 || quantity <= 0) {
        throw new Error('Amount and quantity must be greater than 0');
      }

      const totalAmount = unitAmount * quantity;

      const transactionData = {
        type: formData.type,
        amount: unitAmount,
        quantity: quantity,
        total_amount: totalAmount,
        category: formData.category,
        description: formData.description || '',
        payment_method: formData.paymentMethod,
        date: formData.date
      };

      await transactionService.create(transactionData);
      await loadTransactions(); // Refresh the list
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error adding transaction:', err);
      return false;
    }
  };

  /**
   * Update an existing transaction
   * @param {string} id - Transaction ID
   * @param {Object} formData - Updated form data
   * @returns {Promise<boolean>} Success status
   */
  const updateTransaction = async (id, formData) => {
    try {
      if (!formData.amount || !formData.category || !formData.quantity) {
        throw new Error('Please fill in all required fields');
      }

      const unitAmount = parseFloat(formData.amount);
      const quantity = parseFloat(formData.quantity);
      
      if (unitAmount <= 0 || quantity <= 0) {
        throw new Error('Amount and quantity must be greater than 0');
      }

      const totalAmount = unitAmount * quantity;

      const transactionData = {
        type: formData.type,
        amount: unitAmount,
        quantity: quantity,
        total_amount: totalAmount,
        category: formData.category,
        description: formData.description || '',
        payment_method: formData.paymentMethod,
        date: formData.date
      };

      await transactionService.update(id, transactionData);
      await loadTransactions(); // Refresh the list
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error updating transaction:', err);
      return false;
    }
  };

  /**
   * Delete a transaction
   * @param {string} id - Transaction ID
   * @returns {Promise<boolean>} Success status
   */
  const deleteTransaction = async (id) => {
    try {
      await transactionService.delete(id);
      await loadTransactions(); // Refresh the list
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error deleting transaction:', err);
      return false;
    }
  };

  /**
   * Clear all transactions (admin function)
   * @returns {Promise<boolean>} Success status
   */
  const clearAllTransactions = async () => {
    try {
      await transactionService.clearAll();
      await loadTransactions(); // Refresh the list
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error clearing transactions:', err);
      return false;
    }
  };

  /**
   * Clear any error messages
   */
  const clearError = () => {
    setError(null);
  };

  // Load transactions on hook initialization
  useEffect(() => {
    loadTransactions();
  }, []);

  return {
    // State
    transactions,
    loading,
    error,
    
    // Actions
    loadTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearAllTransactions,
    clearError
  };
};