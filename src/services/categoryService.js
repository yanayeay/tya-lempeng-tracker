// src/services/categoryService.js
import { supabase } from '../lib/supabase';

export const categoryService = {
  // Get all categories ordered by sort_order
  async getAllCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to load categories: ${error.message}`);
    }

    return data || [];
  },

  // Add a new category
  async addCategory(name, type, existingCategories = []) {
    if (!name.trim()) {
      throw new Error('Category name is required');
    }

    // Check for duplicate names within the same type
    const categoriesOfType = existingCategories.filter(c => c.type === type);
    const duplicateExists = categoriesOfType.some(c =>
      c.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (duplicateExists) {
      throw new Error(`Category "${name}" already exists in ${type} categories`);
    }

    // Get the highest sort_order for this category type
    const maxSortOrder = categoriesOfType.length > 0
      ? Math.max(...categoriesOfType.map(c => c.sort_order || 0))
      : 0;

    const newCategory = {
      name: name.trim(),
      type,
      sort_order: maxSortOrder + 1
    };

    const { data, error } = await supabase
      .from('categories')
      .insert([newCategory])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add category: ${error.message}`);
    }

    return data;
  },

  // Update category name
  async updateCategory(oldName, oldType, newName) {
    if (!newName.trim()) {
      throw new Error('Category name is required');
    }

    // Check if new name already exists
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('name', newName.trim())
      .eq('type', oldType)
      .neq('name', oldName);

    if (existingCategory && existingCategory.length > 0) {
      throw new Error(`Category "${newName}" already exists`);
    }

    // Update category name
    const { error: categoryError } = await supabase
      .from('categories')
      .update({ name: newName.trim() })
      .eq('name', oldName)
      .eq('type', oldType);

    if (categoryError) {
      throw new Error(`Failed to update category: ${categoryError.message}`);
    }

    // Update transactions with old category name
    const { error: transactionError } = await supabase
      .from('transactions')
      .update({ category: newName.trim() })
      .eq('category', oldName);

    if (transactionError) {
      console.warn('Failed to update transactions:', transactionError.message);
      // Don't throw here as category was updated successfully
    }

    return true;
  },

  // Delete a category
  async deleteCategory(name, type) {
    // Check if category is being used in transactions
    const { data: transactionsUsingCategory } = await supabase
      .from('transactions')
      .select('id')
      .eq('category', name)
      .limit(1);

    if (transactionsUsingCategory && transactionsUsingCategory.length > 0) {
      throw new Error(
        `Cannot delete category "${name}" because it is being used in transactions. ` +
        'Please reassign those transactions to another category first.'
      );
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('name', name)
      .eq('type', type);

    if (error) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }

    return true;
  },

  // Move category up in sort order
  async moveCategoryUp(categoryName, categoryType, categories) {
    const categoriesOfType = categories.filter(c => c.type === categoryType);
    const currentIndex = categoriesOfType.findIndex(c => c.name === categoryName);

    if (currentIndex <= 0) {
      throw new Error('Category is already at the top');
    }

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

      return true;
    } catch (error) {
      throw new Error(`Failed to reorder category: ${error.message}`);
    }
  },

  // Move category down in sort order
  async moveCategoryDown(categoryName, categoryType, categories) {
    const categoriesOfType = categories.filter(c => c.type === categoryType);
    const currentIndex = categoriesOfType.findIndex(c => c.name === categoryName);

    if (currentIndex >= categoriesOfType.length - 1) {
      throw new Error('Category is already at the bottom');
    }

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

      return true;
    } catch (error) {
      throw new Error(`Failed to reorder category: ${error.message}`);
    }
  },

  // Reset categories to default values
  async resetToDefaults() {
    // Clear existing categories
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      throw new Error(`Failed to clear categories: ${deleteError.message}`);
    }

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

    const { error: insertError } = await supabase
      .from('categories')
      .insert(defaultCategories);

    if (insertError) {
      throw new Error(`Failed to restore default categories: ${insertError.message}`);
    }

    return true;
  },

  // Get categories for a specific type
  async getCategoriesByType(type) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', type)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to load ${type} categories: ${error.message}`);
    }

    return data || [];
  }
};