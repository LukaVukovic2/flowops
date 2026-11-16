/**
 * Permission Helper Utilities
 * Implements requirements 1.6, 1.7
 * 
 * Provides utility functions for checking role-based permissions
 * and resource ownership in business logic and controllers
 */

/**
 * Role hierarchy and permissions
 * 
 * Roles in order of privilege (lowest to highest):
 * 1. Posjetitelj - Visitor with public access only
 * 2. Registrirani_Korisnik - Registered User with access to own tickets and profile
 * 3. Tehničar - Technician/Editor with access to assigned tickets and announcement management
 * 4. Administrator - Administrator with full system access
 */

const ROLES = {
  POSJETITELJ: 'Posjetitelj',
  REGISTRIRANI_KORISNIK: 'Registrirani_Korisnik',
  TEHNICAR: 'Tehničar',
  ADMINISTRATOR: 'Administrator'
};

// Role hierarchy (higher number = more privileges)
const ROLE_HIERARCHY = {
  [ROLES.POSJETITELJ]: 0,
  [ROLES.REGISTRIRANI_KORISNIK]: 1,
  [ROLES.TEHNICAR]: 2,
  [ROLES.ADMINISTRATOR]: 3
};

/**
 * Check if a role is valid
 * 
 * @param {string} role - Role to validate
 * @returns {boolean} True if role is valid
 */
export function isValidRole(role) {
  return Object.values(ROLES).includes(role);
}

/**
 * Check if user has one of the required roles
 * 
 * @param {string} userRole - User's current role
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {boolean} True if user has one of the allowed roles
 * 
 * @example
 * hasRole('Tehničar', ['Tehničar', 'Administrator']) // true
 * hasRole('Registrirani_Korisnik', ['Administrator']) // false
 */
export function hasRole(userRole, allowedRoles) {
  if (!userRole || !Array.isArray(allowedRoles)) {
    return false;
  }
  return allowedRoles.includes(userRole);
}

/**
 * Check if user has a role at or above a minimum level
 * 
 * @param {string} userRole - User's current role
 * @param {string} minimumRole - Minimum required role
 * @returns {boolean} True if user role is at or above minimum
 * 
 * @example
 * hasMinimumRole('Administrator', 'Tehničar') // true (Admin > Tehničar)
 * hasMinimumRole('Registrirani_Korisnik', 'Tehničar') // false
 */
export function hasMinimumRole(userRole, minimumRole) {
  const userLevel = ROLE_HIERARCHY[userRole];
  const minimumLevel = ROLE_HIERARCHY[minimumRole];

  if (userLevel === undefined || minimumLevel === undefined) {
    return false;
  }

  return userLevel >= minimumLevel;
}

/**
 * Check if user is Administrator
 * 
 * @param {string} userRole - User's current role
 * @returns {boolean} True if user is Administrator
 */
export function isAdministrator(userRole) {
  return userRole === ROLES.ADMINISTRATOR;
}

/**
 * Check if user is Tehničar or Administrator
 * 
 * @param {string} userRole - User's current role
 * @returns {boolean} True if user is Tehničar or Administrator
 */
export function isTehnicarOrAdmin(userRole) {
  return hasRole(userRole, [ROLES.TEHNICAR, ROLES.ADMINISTRATOR]);
}

/**
 * Check if user is authenticated (not Posjetitelj)
 * 
 * @param {string} userRole - User's current role
 * @returns {boolean} True if user is authenticated
 */
export function isAuthenticated(userRole) {
  return userRole && userRole !== ROLES.POSJETITELJ;
}

/**
 * Check if user owns a resource
 * 
 * @param {string} userId - ID of the authenticated user
 * @param {string} resourceOwnerId - ID of the resource owner
 * @returns {boolean} True if user owns the resource
 */
export function ownsResource(userId, resourceOwnerId) {
  if (!userId || !resourceOwnerId) {
    return false;
  }
  return userId === resourceOwnerId;
}

/**
 * Check if user can access a resource (owns it or has elevated role)
 * 
 * @param {string} userId - ID of the authenticated user
 * @param {string} userRole - User's current role
 * @param {string} resourceOwnerId - ID of the resource owner
 * @param {string[]} elevatedRoles - Roles that bypass ownership check
 * @returns {boolean} True if user can access the resource
 * 
 * @example
 * canAccessResource('user1', 'Registrirani_Korisnik', 'user1', ['Administrator']) // true (owns)
 * canAccessResource('user2', 'Administrator', 'user1', ['Administrator']) // true (elevated)
 * canAccessResource('user2', 'Registrirani_Korisnik', 'user1', ['Administrator']) // false
 */
export function canAccessResource(userId, userRole, resourceOwnerId, elevatedRoles = []) {
  // Check if user has elevated role
  if (hasRole(userRole, elevatedRoles)) {
    return true;
  }

  // Check if user owns the resource
  return ownsResource(userId, resourceOwnerId);
}

/**
 * Check if user can manage tickets based on role
 * 
 * Ticket access rules:
 * - Registrirani_Korisnik: Can only view/edit own tickets
 * - Tehničar: Can view/edit assigned tickets
 * - Administrator: Can view/edit all tickets
 * 
 * @param {string} userId - ID of the authenticated user
 * @param {string} userRole - User's current role
 * @param {Object} ticket - Ticket object with creatorId and assigneeId
 * @returns {boolean} True if user can manage the ticket
 */
export function canManageTicket(userId, userRole, ticket) {
  if (!userId || !userRole || !ticket) {
    return false;
  }

  // Administrator can manage all tickets
  if (isAdministrator(userRole)) {
    return true;
  }

  // Tehničar can manage assigned tickets
  if (userRole === ROLES.TEHNICAR && ticket.assigneeId === userId) {
    return true;
  }

  // Registrirani_Korisnik can manage own tickets
  if (userRole === ROLES.REGISTRIRANI_KORISNIK && ticket.creatorId === userId) {
    return true;
  }

  return false;
}

/**
 * Check if user can view a ticket
 * 
 * View access rules:
 * - Registrirani_Korisnik: Can view own tickets
 * - Tehničar: Can view assigned tickets
 * - Administrator: Can view all tickets
 * 
 * @param {string} userId - ID of the authenticated user
 * @param {string} userRole - User's current role
 * @param {Object} ticket - Ticket object with creatorId and assigneeId
 * @returns {boolean} True if user can view the ticket
 */
export function canViewTicket(userId, userRole, ticket) {
  // Same rules as canManageTicket for now
  return canManageTicket(userId, userRole, ticket);
}

/**
 * Check if user can change ticket status
 * 
 * Status change rules:
 * - Only Tehničar and Administrator can change status
 * 
 * @param {string} userRole - User's current role
 * @returns {boolean} True if user can change ticket status
 */
export function canChangeTicketStatus(userRole) {
  return isTehnicarOrAdmin(userRole);
}

/**
 * Check if user can assign tickets to Tehničar
 * 
 * @param {string} userRole - User's current role
 * @returns {boolean} True if user can assign tickets
 */
export function canAssignTickets(userRole) {
  return isTehnicarOrAdmin(userRole);
}

/**
 * Check if user can manage announcements
 * 
 * @param {string} userRole - User's current role
 * @returns {boolean} True if user can create/edit announcements
 */
export function canManageAnnouncements(userRole) {
  return isTehnicarOrAdmin(userRole);
}

/**
 * Check if user can edit a specific announcement
 * 
 * Edit rules:
 * - Tehničar can edit own unpublished announcements
 * - Administrator can edit any announcement
 * 
 * @param {string} userId - ID of the authenticated user
 * @param {string} userRole - User's current role
 * @param {Object} announcement - Announcement object
 * @returns {boolean} True if user can edit the announcement
 */
export function canEditAnnouncement(userId, userRole, announcement) {
  if (!userId || !userRole || !announcement) {
    return false;
  }

  // Administrator can edit any announcement
  if (isAdministrator(userRole)) {
    return true;
  }

  // Tehničar can edit own unpublished announcements
  if (userRole === ROLES.TEHNICAR) {
    return announcement.authorId === userId && !announcement.isPublished;
  }

  return false;
}

/**
 * Check if user can publish/unpublish announcements
 * 
 * @param {string} userRole - User's current role
 * @returns {boolean} True if user can publish announcements
 */
export function canPublishAnnouncements(userRole) {
  return isTehnicarOrAdmin(userRole);
}

/**
 * Check if user can delete announcements
 * 
 * @param {string} userRole - User's current role
 * @returns {boolean} True if user can delete announcements
 */
export function canDeleteAnnouncements(userRole) {
  return isAdministrator(userRole);
}

/**
 * Check if user can manage IT assets
 * 
 * @param {string} userRole - User's current role
 * @returns {boolean} True if user can create/edit assets
 */
export function canManageAssets(userRole) {
  return isTehnicarOrAdmin(userRole);
}

/**
 * Check if user can delete assets
 * 
 * @param {string} userRole - User's current role
 * @returns {boolean} True if user can delete assets
 */
export function canDeleteAssets(userRole) {
  return isAdministrator(userRole);
}

/**
 * Check if user can manage workflow rules
 * 
 * @param {string} userRole - User's current role
 * @returns {boolean} True if user can manage workflows
 */
export function canManageWorkflows(userRole) {
  return isAdministrator(userRole);
}

/**
 * Check if user can manage user accounts
 * 
 * @param {string} userRole - User's current role
 * @returns {boolean} True if user can manage users
 */
export function canManageUsers(userRole) {
  return isAdministrator(userRole);
}

/**
 * Check if user can change another user's role
 * 
 * @param {string} userRole - User's current role
 * @returns {boolean} True if user can change roles
 */
export function canChangeUserRoles(userRole) {
  return isAdministrator(userRole);
}

/**
 * Check if user can view audit logs
 * 
 * @param {string} userRole - User's current role
 * @returns {boolean} True if user can view audit logs
 */
export function canViewAuditLogs(userRole) {
  return isAdministrator(userRole);
}

/**
 * Check if user can view external service status
 * 
 * @param {string} userRole - User's current role
 * @returns {boolean} True if user can view external services
 */
export function canViewExternalServices(userRole) {
  return isTehnicarOrAdmin(userRole);
}

/**
 * Get user permission summary
 * Returns an object with all permission flags for a user
 * 
 * @param {string} userRole - User's current role
 * @returns {Object} Object with permission flags
 */
export function getUserPermissions(userRole) {
  return {
    isAuthenticated: isAuthenticated(userRole),
    isAdministrator: isAdministrator(userRole),
    isTehnicar: userRole === ROLES.TEHNICAR,
    canManageTickets: hasMinimumRole(userRole, ROLES.REGISTRIRANI_KORISNIK),
    canChangeTicketStatus: canChangeTicketStatus(userRole),
    canAssignTickets: canAssignTickets(userRole),
    canManageAnnouncements: canManageAnnouncements(userRole),
    canPublishAnnouncements: canPublishAnnouncements(userRole),
    canDeleteAnnouncements: canDeleteAnnouncements(userRole),
    canManageAssets: canManageAssets(userRole),
    canDeleteAssets: canDeleteAssets(userRole),
    canManageWorkflows: canManageWorkflows(userRole),
    canManageUsers: canManageUsers(userRole),
    canChangeUserRoles: canChangeUserRoles(userRole),
    canViewAuditLogs: canViewAuditLogs(userRole),
    canViewExternalServices: canViewExternalServices(userRole)
  };
}

// Export roles constant for use in other modules
export { ROLES };
