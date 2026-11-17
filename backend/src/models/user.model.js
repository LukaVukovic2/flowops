/**
 * User Model
 * Handles database operations for user management
 * Requirements: 5.1, 5.2, 5.3, 5.5, 5.7, 5.8
 */

import supabase from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * Get all users with optional filtering and pagination
 * 
 * @param {Object} filters - Filter parameters
 * @param {string} filters.role - Filter by role
 * @param {boolean} filters.isActive - Filter by active status
 * @param {number} filters.page - Page number (default: 1)
 * @param {number} filters.limit - Items per page (default: 20)
 * @returns {Promise<Object>} Users list with pagination data
 */
export async function getUsers(filters = {}) {
  try {
    const {
      role,
      isActive,
      page = 1,
      limit = 20,
    } = filters;

    // Build query
    let query = supabase
      .from('users')
      .select('id, email, role, first_name, last_name, is_active, created_at, updated_at', { count: 'exact' });

    // Apply filters
    if (role) {
      query = query.eq('role', role);
    }

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      logger.error('Error fetching users:', error);
      throw new Error('Greška pri dohvaćanju korisnika');
    }

    return {
      users: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (error) {
    logger.error('Error in getUsers:', error);
    throw error;
  }
}

/**
 * Get a single user by ID
 * 
 * @param {string} userId - User UUID
 * @returns {Promise<Object|null>} User object or null if not found
 */
export async function getUserById(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, first_name, last_name, is_active, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      logger.error('Error fetching user by ID:', error);
      throw new Error('Greška pri dohvaćanju korisnika');
    }

    return data;
  } catch (error) {
    logger.error('Error in getUserById:', error);
    throw error;
  }
}

/**
 * Get user by email
 * 
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object or null if not found
 */
export async function getUserByEmail(email) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('Error fetching user by email:', error);
      throw new Error('Greška pri dohvaćanju korisnika');
    }

    return data;
  } catch (error) {
    logger.error('Error in getUserByEmail:', error);
    throw error;
  }
}

/**
 * Update user role
 * Requirement: 5.2 - Allow Administrator to change user's role
 * 
 * @param {string} userId - User UUID
 * @param {string} newRole - New role value
 * @returns {Promise<Object>} Updated user object
 */
export async function updateUserRole(userId, newRole) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('id, email, role, first_name, last_name, is_active, created_at, updated_at')
      .single();

    if (error) {
      logger.error('Error updating user role:', error);
      throw new Error('Greška pri promjeni uloge korisnika');
    }

    return data;
  } catch (error) {
    logger.error('Error in updateUserRole:', error);
    throw error;
  }
}

/**
 * Deactivate user account
 * Requirement: 5.3 - Allow Administrator to deactivate user account
 * 
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Updated user object
 */
export async function deactivateUser(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('id, email, role, first_name, last_name, is_active, created_at, updated_at')
      .single();

    if (error) {
      logger.error('Error deactivating user:', error);
      throw new Error('Greška pri deaktivaciji korisnika');
    }

    return data;
  } catch (error) {
    logger.error('Error in deactivateUser:', error);
    throw error;
  }
}

/**
 * Activate user account
 * 
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Updated user object
 */
export async function activateUser(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('id, email, role, first_name, last_name, is_active, created_at, updated_at')
      .single();

    if (error) {
      logger.error('Error activating user:', error);
      throw new Error('Greška pri aktivaciji korisnika');
    }

    return data;
  } catch (error) {
    logger.error('Error in activateUser:', error);
    throw error;
  }
}

/**
 * Update user password
 * Requirement: 5.6 - Allow Administrator to reset user's password
 * 
 * @param {string} userId - User UUID
 * @param {string} passwordHash - New password hash
 * @returns {Promise<Object>} Updated user object
 */
export async function updateUserPassword(userId, passwordHash) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('id, email, role, first_name, last_name, is_active, created_at, updated_at')
      .single();

    if (error) {
      logger.error('Error updating user password:', error);
      throw new Error('Greška pri promjeni lozinke korisnika');
    }

    return data;
  } catch (error) {
    logger.error('Error in updateUserPassword:', error);
    throw error;
  }
}

/**
 * Count administrators in the system
 * Requirement: 5.8 - Prevent deletion of last Administrator
 * 
 * @returns {Promise<number>} Number of active administrators
 */
export async function countAdministrators() {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'Administrator')
      .eq('is_active', true);

    if (error) {
      logger.error('Error counting administrators:', error);
      throw new Error('Greška pri brojanju administratora');
    }

    return count || 0;
  } catch (error) {
    logger.error('Error in countAdministrators:', error);
    throw error;
  }
}

/**
 * Create a new user (used during registration)
 * 
 * @param {Object} userData - User data
 * @param {string} userData.email - User email
 * @param {string} userData.passwordHash - Password hash
 * @param {string} userData.firstName - First name
 * @param {string} userData.lastName - Last name
 * @param {string} userData.role - User role (default: 'Registrirani_Korisnik')
 * @returns {Promise<Object>} Created user object
 */
export async function createUser(userData) {
  try {
    const {
      email,
      passwordHash,
      firstName,
      lastName,
      role = 'Registrirani_Korisnik',
    } = userData;

    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        role,
        is_active: true,
      })
      .select('id, email, role, first_name, last_name, is_active, created_at, updated_at')
      .single();

    if (error) {
      logger.error('Error creating user:', error);
      throw new Error('Greška pri stvaranju korisnika');
    }

    return data;
  } catch (error) {
    logger.error('Error in createUser:', error);
    throw error;
  }
}
