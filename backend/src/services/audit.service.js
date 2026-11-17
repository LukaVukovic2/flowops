/**
 * Audit Service
 * Logs user actions for security and compliance
 * Requirements: 5.7, 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7
 */

import supabase from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * Log a user action to the audit_logs table
 * 
 * @param {Object} logData - Audit log data
 * @param {string} logData.userId - User who performed the action (optional for system actions)
 * @param {string} logData.actionType - Type of action performed
 * @param {string} logData.resourceType - Type of resource affected (optional)
 * @param {string} logData.resourceId - ID of resource affected (optional)
 * @param {Object} logData.details - Additional details as JSON (optional)
 * @param {string} logData.ipAddress - IP address of the request (optional)
 * @param {string} logData.userAgent - User agent string (optional)
 * @returns {Promise<Object>} Created audit log entry
 */
export async function logAction(logData) {
  try {
    const {
      userId = null,
      actionType,
      resourceType = null,
      resourceId = null,
      details = null,
      ipAddress = null,
      userAgent = null,
    } = logData;

    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action_type: actionType,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating audit log:', error);
      // Don't throw error - audit logging should not break the main operation
      return null;
    }

    return data;
  } catch (error) {
    logger.error('Error in logAction:', error);
    // Don't throw error - audit logging should not break the main operation
    return null;
  }
}

/**
 * Log authentication attempt
 * Requirement: 16.3 - Log authentication attempts
 * 
 * @param {string} email - Email used in authentication attempt
 * @param {boolean} success - Whether authentication was successful
 * @param {string} ipAddress - IP address of the request
 * @param {string} userAgent - User agent string
 * @param {string} userId - User ID if authentication was successful
 */
export async function logAuthAttempt(email, success, ipAddress, userAgent, userId = null) {
  await logAction({
    userId,
    actionType: success ? 'auth.login_success' : 'auth.login_failed',
    resourceType: 'user',
    resourceId: userId,
    details: { email },
    ipAddress,
    userAgent,
  });
}

/**
 * Log user role change
 * Requirement: 16.4 - Log role changes
 * 
 * @param {string} adminId - ID of administrator making the change
 * @param {string} targetUserId - ID of user whose role is being changed
 * @param {string} oldRole - Previous role
 * @param {string} newRole - New role
 * @param {string} ipAddress - IP address of the request
 * @param {string} userAgent - User agent string
 */
export async function logRoleChange(adminId, targetUserId, oldRole, newRole, ipAddress, userAgent) {
  await logAction({
    userId: adminId,
    actionType: 'user.role_changed',
    resourceType: 'user',
    resourceId: targetUserId,
    details: {
      oldRole,
      newRole,
      targetUserId,
    },
    ipAddress,
    userAgent,
  });
}

/**
 * Log user deactivation
 * Requirement: 5.7 - Log user management actions
 * 
 * @param {string} adminId - ID of administrator making the change
 * @param {string} targetUserId - ID of user being deactivated
 * @param {string} ipAddress - IP address of the request
 * @param {string} userAgent - User agent string
 */
export async function logUserDeactivation(adminId, targetUserId, ipAddress, userAgent) {
  await logAction({
    userId: adminId,
    actionType: 'user.deactivated',
    resourceType: 'user',
    resourceId: targetUserId,
    details: { targetUserId },
    ipAddress,
    userAgent,
  });
}

/**
 * Log user activation
 * 
 * @param {string} adminId - ID of administrator making the change
 * @param {string} targetUserId - ID of user being activated
 * @param {string} ipAddress - IP address of the request
 * @param {string} userAgent - User agent string
 */
export async function logUserActivation(adminId, targetUserId, ipAddress, userAgent) {
  await logAction({
    userId: adminId,
    actionType: 'user.activated',
    resourceType: 'user',
    resourceId: targetUserId,
    details: { targetUserId },
    ipAddress,
    userAgent,
  });
}

/**
 * Log password reset
 * 
 * @param {string} adminId - ID of administrator resetting the password
 * @param {string} targetUserId - ID of user whose password is being reset
 * @param {string} ipAddress - IP address of the request
 * @param {string} userAgent - User agent string
 */
export async function logPasswordReset(adminId, targetUserId, ipAddress, userAgent) {
  await logAction({
    userId: adminId,
    actionType: 'user.password_reset',
    resourceType: 'user',
    resourceId: targetUserId,
    details: { targetUserId },
    ipAddress,
    userAgent,
  });
}

/**
 * Log ticket status change
 * Requirement: 16.5 - Log ticket status changes
 * 
 * @param {string} userId - ID of user changing the status
 * @param {string} ticketId - ID of ticket being updated
 * @param {string} oldStatus - Previous status
 * @param {string} newStatus - New status
 */
export async function logTicketStatusChange(userId, ticketId, oldStatus, newStatus) {
  await logAction({
    userId,
    actionType: 'ticket.status_changed',
    resourceType: 'ticket',
    resourceId: ticketId,
    details: {
      oldStatus,
      newStatus,
    },
  });
}

/**
 * Log workflow rule execution
 * Requirement: 16.6 - Log workflow rule executions
 * 
 * @param {string} workflowId - ID of workflow rule that executed
 * @param {boolean} success - Whether execution was successful
 * @param {Object} details - Execution details
 */
export async function logWorkflowExecution(workflowId, success, details = {}) {
  await logAction({
    userId: null, // System action
    actionType: success ? 'workflow.execution_success' : 'workflow.execution_failed',
    resourceType: 'workflow_rule',
    resourceId: workflowId,
    details,
  });
}

/**
 * Get audit logs with filtering
 * Requirements: 16.7, 16.8, 16.9 - View and filter audit logs
 * 
 * @param {Object} filters - Filter parameters
 * @param {string} filters.userId - Filter by user ID
 * @param {string} filters.actionType - Filter by action type
 * @param {string} filters.resourceType - Filter by resource type
 * @param {string} filters.fromDate - Filter from date (ISO string)
 * @param {string} filters.toDate - Filter to date (ISO string)
 * @param {number} filters.page - Page number (default: 1)
 * @param {number} filters.limit - Items per page (default: 50)
 * @returns {Promise<Object>} Audit logs with pagination
 */
export async function getAuditLogs(filters = {}) {
  try {
    const {
      userId,
      actionType,
      resourceType,
      fromDate,
      toDate,
      page = 1,
      limit = 50,
    } = filters;

    // Build query
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' });

    // Apply filters
    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (actionType) {
      query = query.eq('action_type', actionType);
    }

    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }

    if (fromDate) {
      query = query.gte('created_at', fromDate);
    }

    if (toDate) {
      query = query.lte('created_at', toDate);
    }

    // Apply pagination and ordering
    const offset = (page - 1) * limit;
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      logger.error('Error fetching audit logs:', error);
      throw new Error('Greška pri dohvaćanju audit logova');
    }

    return {
      logs: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (error) {
    logger.error('Error in getAuditLogs:', error);
    throw error;
  }
}
