// services/permissionService.js
import { supabase } from '../lib/supabase';
import { DEFAULT_ROLE_PERMISSIONS } from '../config/rolePermissions';

export const permissionService = {
  /**
   * Load role permissions from database
   * @returns {Promise<Object>} Role permissions object
   */
  async loadRolePermissions() {
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
          return DEFAULT_ROLE_PERMISSIONS;
        }
        throw error;
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
        const mergedPermissions = { ...DEFAULT_ROLE_PERMISSIONS };
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
        return mergedPermissions;
      } else {
        console.log('No permission records found in database. Using defaults.');
        return DEFAULT_ROLE_PERMISSIONS;
      }
    } catch (err) {
      console.error('Error loading role permissions:', err);
      return DEFAULT_ROLE_PERMISSIONS;
    }
  },

  /**
   * Save a single role permission to database
   * @param {string} role - Role name
   * @param {string} category - Permission category
   * @param {string} permission - Permission name
   * @param {boolean} value - Permission value
   */
  async saveRolePermission(role, category, permission, value) {
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
      throw error;
    }
  },

  /**
   * Clear all role permissions (admin function)
   * @returns {Promise<void>}
   */
  async clearAllPermissions() {
    try {
      const { error } = await supabase
        .from('role_permissions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;
    } catch (err) {
      console.error('Error clearing permissions:', err);
      throw new Error('Failed to clear all permissions');
    }
  }
};