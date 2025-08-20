// src/hooks/useCategories.js
import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '../services/categoryService';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const addCategory = useCallback(async (name, type) => {
    try {
      const newCategory = await categoryService.addCategory(name, type, categories);
      setCategories(prev => [...prev, newCategory]);
      return { success: true };
    } catch (err) {
      console.error('Error adding category:', err);
      return { success: false, error: err.message };
    }
  }, [categories]);

  const updateCategory = useCallback(async (oldName, oldType, newName) => {
    try {
      await categoryService.updateCategory(oldName, oldType, newName);
      setCategories(prev => prev.map(cat =>
        cat.name === oldName && cat.type === oldType
          ? { ...cat, name: newName }
          : cat
      ));
      return { success: true };
    } catch (err) {
      console.error('Error updating category:', err);
      return { success: false, error: err.message };
    }
  }, []);

  const deleteCategory = useCallback(async (name, type) => {
    try {
      await categoryService.deleteCategory(name, type);
      setCategories(prev => prev.filter(cat =>
        !(cat.name === name && cat.type === type)
      ));
      return { success: true };
    } catch (err) {
      console.error('Error deleting category:', err);
      return { success: false, error: err.message };
    }
  }, []);

  const moveCategoryUp = useCallback(async (name, type) => {
    try {
      await categoryService.moveCategoryUp(name, type, categories);
      await loadCategories();
      return { success: true };
    } catch (err) {
      console.error('Error moving category up:', err);
      return { success: false, error: err.message };
    }
  }, [categories, loadCategories]);

  const moveCategoryDown = useCallback(async (name, type) => {
    try {
      await categoryService.moveCategoryDown(name, type, categories);
      await loadCategories();
      return { success: true };
    } catch (err) {
      console.error('Error moving category down:', err);
      return { success: false, error: err.message };
    }
  }, [categories, loadCategories]);

  const resetToDefaults = useCallback(async () => {
    try {
      await categoryService.resetToDefaults();
      await loadCategories();
      return { success: true };
    } catch (err) {
      console.error('Error resetting categories:', err);
      return { success: false, error: err.message };
    }
  }, [loadCategories]);

  const getIncomeCategories = useCallback(() => {
    return categories.filter(c => c.type === 'income');
  }, [categories]);

  const getExpenseCategories = useCallback(() => {
    return categories.filter(c => c.type === 'expense');
  }, [categories]);

  const getCategoryNames = useCallback((type = null) => {
    if (type) {
      return categories.filter(c => c.type === type).map(c => c.name);
    }
    return categories.map(c => c.name);
  }, [categories]);

  return {
    categories,
    loading,
    error,
    loadCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    moveCategoryUp,
    moveCategoryDown,
    resetToDefaults,
    getIncomeCategories,
    getExpenseCategories,
    getCategoryNames
  };
};