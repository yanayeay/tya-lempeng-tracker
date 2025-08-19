// services/transactionService.js
import { supabase } from '../lib/supabase';

export const transactionService = {
  /**
   * Get all transactions ordered by date
   * @returns {Promise<Array>} Array of transactions
   */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error loading transactions:', err);
      throw new Error('Failed to load transactions');
    }
  },

  /**
   * Create a new transaction
   * @param {Object} transactionData - Transaction data
   * @returns {Promise<Object>} Created transaction
   */
  async create(transactionData) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select();

      if (error) throw error;
      return data[0];
    } catch (err) {
      console.error('Error creating transaction:', err);
      throw new Error('Failed to create transaction');
    }
  },

  /**
   * Update an existing transaction
   * @param {string} id - Transaction ID
   * @param {Object} transactionData - Updated transaction data
   * @returns {Promise<Object>} Updated transaction
   */
  async update(id, transactionData) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(transactionData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (err) {
      console.error('Error updating transaction:', err);
      throw new Error('Failed to update transaction');
    }
  },

  /**
   * Delete a transaction
   * @param {string} id - Transaction ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting transaction:', err);
      throw new Error('Failed to delete transaction');
    }
  },

  /**
   * Clear all transactions (admin function)
   * @returns {Promise<void>}
   */
  async clearAll() {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except dummy row

      if (error) throw error;
    } catch (err) {
      console.error('Error clearing all transactions:', err);
      throw new Error('Failed to clear all transactions');
    }
  }
};