/**
 * Unit tests for permission helper utilities
 * Tests role-based access control logic
 */

import {
  ROLES,
  isValidRole,
  hasRole,
  hasMinimumRole,
  isAdministrator,
  isTehnicarOrAdmin,
  isAuthenticated,
  ownsResource,
  canAccessResource,
  canManageTicket,
  canViewTicket,
  canChangeTicketStatus,
  canAssignTickets,
  canManageAnnouncements,
  canEditAnnouncement,
  canPublishAnnouncements,
  canDeleteAnnouncements,
  canManageAssets,
  canDeleteAssets,
  canManageWorkflows,
  canManageUsers,
  canChangeUserRoles,
  canViewAuditLogs,
  canViewExternalServices,
  getUserPermissions
} from './permissions.js';

describe('Permission Helper Utilities', () => {
  describe('isValidRole', () => {
    it('should return true for valid roles', () => {
      expect(isValidRole('Posjetitelj')).toBe(true);
      expect(isValidRole('Registrirani_Korisnik')).toBe(true);
      expect(isValidRole('Tehničar')).toBe(true);
      expect(isValidRole('Administrator')).toBe(true);
    });

    it('should return false for invalid roles', () => {
      expect(isValidRole('InvalidRole')).toBe(false);
      expect(isValidRole('admin')).toBe(false);
      expect(isValidRole('')).toBe(false);
      expect(isValidRole(null)).toBe(false);
      expect(isValidRole(undefined)).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has one of the allowed roles', () => {
      expect(hasRole('Administrator', ['Administrator'])).toBe(true);
      expect(hasRole('Tehničar', ['Tehničar', 'Administrator'])).toBe(true);
      expect(hasRole('Administrator', ['Tehničar', 'Administrator'])).toBe(true);
    });

    it('should return false when user does not have allowed role', () => {
      expect(hasRole('Registrirani_Korisnik', ['Administrator'])).toBe(false);
      expect(hasRole('Posjetitelj', ['Tehničar', 'Administrator'])).toBe(false);
    });

    it('should handle invalid inputs', () => {
      expect(hasRole(null, ['Administrator'])).toBe(false);
      expect(hasRole('Administrator', null)).toBe(false);
      expect(hasRole('Administrator', 'Administrator')).toBe(false); // Not an array
    });
  });

  describe('hasMinimumRole', () => {
    it('should return true when user role is at or above minimum', () => {
      expect(hasMinimumRole('Administrator', 'Posjetitelj')).toBe(true);
      expect(hasMinimumRole('Administrator', 'Registrirani_Korisnik')).toBe(true);
      expect(hasMinimumRole('Administrator', 'Tehničar')).toBe(true);
      expect(hasMinimumRole('Administrator', 'Administrator')).toBe(true);
      expect(hasMinimumRole('Tehničar', 'Registrirani_Korisnik')).toBe(true);
      expect(hasMinimumRole('Tehničar', 'Tehničar')).toBe(true);
    });

    it('should return false when user role is below minimum', () => {
      expect(hasMinimumRole('Posjetitelj', 'Registrirani_Korisnik')).toBe(false);
      expect(hasMinimumRole('Registrirani_Korisnik', 'Tehničar')).toBe(false);
      expect(hasMinimumRole('Tehničar', 'Administrator')).toBe(false);
    });

    it('should handle invalid roles', () => {
      expect(hasMinimumRole('InvalidRole', 'Administrator')).toBe(false);
      expect(hasMinimumRole('Administrator', 'InvalidRole')).toBe(false);
    });
  });

  describe('isAdministrator', () => {
    it('should return true for Administrator role', () => {
      expect(isAdministrator('Administrator')).toBe(true);
    });

    it('should return false for other roles', () => {
      expect(isAdministrator('Tehničar')).toBe(false);
      expect(isAdministrator('Registrirani_Korisnik')).toBe(false);
      expect(isAdministrator('Posjetitelj')).toBe(false);
      expect(isAdministrator(null)).toBe(false);
    });
  });

  describe('isTehnicarOrAdmin', () => {
    it('should return true for Tehničar and Administrator', () => {
      expect(isTehnicarOrAdmin('Tehničar')).toBe(true);
      expect(isTehnicarOrAdmin('Administrator')).toBe(true);
    });

    it('should return false for other roles', () => {
      expect(isTehnicarOrAdmin('Registrirani_Korisnik')).toBe(false);
      expect(isTehnicarOrAdmin('Posjetitelj')).toBe(false);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true for authenticated roles', () => {
      expect(isAuthenticated('Registrirani_Korisnik')).toBe(true);
      expect(isAuthenticated('Tehničar')).toBe(true);
      expect(isAuthenticated('Administrator')).toBe(true);
    });

    it('should return false for Posjetitelj', () => {
      expect(isAuthenticated('Posjetitelj')).toBe(false);
      expect(isAuthenticated(null)).toBe(false);
      expect(isAuthenticated(undefined)).toBe(false);
      expect(isAuthenticated('')).toBe(false);
    });
  });

  describe('ownsResource', () => {
    it('should return true when user owns resource', () => {
      expect(ownsResource('user123', 'user123')).toBe(true);
    });

    it('should return false when user does not own resource', () => {
      expect(ownsResource('user123', 'user456')).toBe(false);
    });

    it('should handle invalid inputs', () => {
      expect(ownsResource(null, 'user123')).toBe(false);
      expect(ownsResource('user123', null)).toBe(false);
      expect(ownsResource(null, null)).toBe(false);
    });
  });

  describe('canAccessResource', () => {
    it('should return true when user owns resource', () => {
      expect(canAccessResource('user1', 'Registrirani_Korisnik', 'user1', ['Administrator'])).toBe(true);
    });

    it('should return true when user has elevated role', () => {
      expect(canAccessResource('user2', 'Administrator', 'user1', ['Administrator'])).toBe(true);
      expect(canAccessResource('user2', 'Tehničar', 'user1', ['Tehničar', 'Administrator'])).toBe(true);
    });

    it('should return false when user neither owns resource nor has elevated role', () => {
      expect(canAccessResource('user2', 'Registrirani_Korisnik', 'user1', ['Administrator'])).toBe(false);
    });
  });

  describe('canManageTicket', () => {
    it('should allow Administrator to manage any ticket', () => {
      const ticket = { creatorId: 'user1', assigneeId: 'user2' };
      expect(canManageTicket('user3', 'Administrator', ticket)).toBe(true);
    });

    it('should allow Tehničar to manage assigned tickets', () => {
      const ticket = { creatorId: 'user1', assigneeId: 'user2' };
      expect(canManageTicket('user2', 'Tehničar', ticket)).toBe(true);
    });

    it('should not allow Tehničar to manage unassigned tickets', () => {
      const ticket = { creatorId: 'user1', assigneeId: 'user3' };
      expect(canManageTicket('user2', 'Tehničar', ticket)).toBe(false);
    });

    it('should allow Registrirani_Korisnik to manage own tickets', () => {
      const ticket = { creatorId: 'user1', assigneeId: null };
      expect(canManageTicket('user1', 'Registrirani_Korisnik', ticket)).toBe(true);
    });

    it('should not allow Registrirani_Korisnik to manage other users tickets', () => {
      const ticket = { creatorId: 'user1', assigneeId: null };
      expect(canManageTicket('user2', 'Registrirani_Korisnik', ticket)).toBe(false);
    });

    it('should handle invalid inputs', () => {
      expect(canManageTicket(null, 'Administrator', {})).toBe(false);
      expect(canManageTicket('user1', null, {})).toBe(false);
      expect(canManageTicket('user1', 'Administrator', null)).toBe(false);
    });
  });

  describe('canViewTicket', () => {
    it('should have same behavior as canManageTicket', () => {
      const ticket = { creatorId: 'user1', assigneeId: 'user2' };
      
      expect(canViewTicket('user3', 'Administrator', ticket)).toBe(true);
      expect(canViewTicket('user2', 'Tehničar', ticket)).toBe(true);
      expect(canViewTicket('user1', 'Registrirani_Korisnik', ticket)).toBe(true);
      expect(canViewTicket('user4', 'Registrirani_Korisnik', ticket)).toBe(false);
    });
  });

  describe('canChangeTicketStatus', () => {
    it('should allow Tehničar and Administrator to change status', () => {
      expect(canChangeTicketStatus('Tehničar')).toBe(true);
      expect(canChangeTicketStatus('Administrator')).toBe(true);
    });

    it('should not allow other roles to change status', () => {
      expect(canChangeTicketStatus('Registrirani_Korisnik')).toBe(false);
      expect(canChangeTicketStatus('Posjetitelj')).toBe(false);
    });
  });

  describe('canAssignTickets', () => {
    it('should allow Tehničar and Administrator to assign tickets', () => {
      expect(canAssignTickets('Tehničar')).toBe(true);
      expect(canAssignTickets('Administrator')).toBe(true);
    });

    it('should not allow other roles to assign tickets', () => {
      expect(canAssignTickets('Registrirani_Korisnik')).toBe(false);
      expect(canAssignTickets('Posjetitelj')).toBe(false);
    });
  });

  describe('canManageAnnouncements', () => {
    it('should allow Tehničar and Administrator to manage announcements', () => {
      expect(canManageAnnouncements('Tehničar')).toBe(true);
      expect(canManageAnnouncements('Administrator')).toBe(true);
    });

    it('should not allow other roles to manage announcements', () => {
      expect(canManageAnnouncements('Registrirani_Korisnik')).toBe(false);
      expect(canManageAnnouncements('Posjetitelj')).toBe(false);
    });
  });

  describe('canEditAnnouncement', () => {
    it('should allow Administrator to edit any announcement', () => {
      const publishedAnnouncement = { authorId: 'user1', isPublished: true };
      const unpublishedAnnouncement = { authorId: 'user1', isPublished: false };
      
      expect(canEditAnnouncement('user2', 'Administrator', publishedAnnouncement)).toBe(true);
      expect(canEditAnnouncement('user2', 'Administrator', unpublishedAnnouncement)).toBe(true);
    });

    it('should allow Tehničar to edit own unpublished announcements', () => {
      const unpublishedAnnouncement = { authorId: 'user1', isPublished: false };
      expect(canEditAnnouncement('user1', 'Tehničar', unpublishedAnnouncement)).toBe(true);
    });

    it('should not allow Tehničar to edit published announcements', () => {
      const publishedAnnouncement = { authorId: 'user1', isPublished: true };
      expect(canEditAnnouncement('user1', 'Tehničar', publishedAnnouncement)).toBe(false);
    });

    it('should not allow Tehničar to edit other users announcements', () => {
      const unpublishedAnnouncement = { authorId: 'user1', isPublished: false };
      expect(canEditAnnouncement('user2', 'Tehničar', unpublishedAnnouncement)).toBe(false);
    });

    it('should handle invalid inputs', () => {
      expect(canEditAnnouncement(null, 'Administrator', {})).toBe(false);
      expect(canEditAnnouncement('user1', null, {})).toBe(false);
      expect(canEditAnnouncement('user1', 'Administrator', null)).toBe(false);
    });
  });

  describe('canPublishAnnouncements', () => {
    it('should allow Tehničar and Administrator to publish', () => {
      expect(canPublishAnnouncements('Tehničar')).toBe(true);
      expect(canPublishAnnouncements('Administrator')).toBe(true);
    });

    it('should not allow other roles to publish', () => {
      expect(canPublishAnnouncements('Registrirani_Korisnik')).toBe(false);
      expect(canPublishAnnouncements('Posjetitelj')).toBe(false);
    });
  });

  describe('canDeleteAnnouncements', () => {
    it('should allow only Administrator to delete announcements', () => {
      expect(canDeleteAnnouncements('Administrator')).toBe(true);
    });

    it('should not allow other roles to delete announcements', () => {
      expect(canDeleteAnnouncements('Tehničar')).toBe(false);
      expect(canDeleteAnnouncements('Registrirani_Korisnik')).toBe(false);
      expect(canDeleteAnnouncements('Posjetitelj')).toBe(false);
    });
  });

  describe('canManageAssets', () => {
    it('should allow Tehničar and Administrator to manage assets', () => {
      expect(canManageAssets('Tehničar')).toBe(true);
      expect(canManageAssets('Administrator')).toBe(true);
    });

    it('should not allow other roles to manage assets', () => {
      expect(canManageAssets('Registrirani_Korisnik')).toBe(false);
      expect(canManageAssets('Posjetitelj')).toBe(false);
    });
  });

  describe('canDeleteAssets', () => {
    it('should allow only Administrator to delete assets', () => {
      expect(canDeleteAssets('Administrator')).toBe(true);
    });

    it('should not allow other roles to delete assets', () => {
      expect(canDeleteAssets('Tehničar')).toBe(false);
      expect(canDeleteAssets('Registrirani_Korisnik')).toBe(false);
      expect(canDeleteAssets('Posjetitelj')).toBe(false);
    });
  });

  describe('canManageWorkflows', () => {
    it('should allow only Administrator to manage workflows', () => {
      expect(canManageWorkflows('Administrator')).toBe(true);
    });

    it('should not allow other roles to manage workflows', () => {
      expect(canManageWorkflows('Tehničar')).toBe(false);
      expect(canManageWorkflows('Registrirani_Korisnik')).toBe(false);
      expect(canManageWorkflows('Posjetitelj')).toBe(false);
    });
  });

  describe('canManageUsers', () => {
    it('should allow only Administrator to manage users', () => {
      expect(canManageUsers('Administrator')).toBe(true);
    });

    it('should not allow other roles to manage users', () => {
      expect(canManageUsers('Tehničar')).toBe(false);
      expect(canManageUsers('Registrirani_Korisnik')).toBe(false);
      expect(canManageUsers('Posjetitelj')).toBe(false);
    });
  });

  describe('canChangeUserRoles', () => {
    it('should allow only Administrator to change roles', () => {
      expect(canChangeUserRoles('Administrator')).toBe(true);
    });

    it('should not allow other roles to change roles', () => {
      expect(canChangeUserRoles('Tehničar')).toBe(false);
      expect(canChangeUserRoles('Registrirani_Korisnik')).toBe(false);
      expect(canChangeUserRoles('Posjetitelj')).toBe(false);
    });
  });

  describe('canViewAuditLogs', () => {
    it('should allow only Administrator to view audit logs', () => {
      expect(canViewAuditLogs('Administrator')).toBe(true);
    });

    it('should not allow other roles to view audit logs', () => {
      expect(canViewAuditLogs('Tehničar')).toBe(false);
      expect(canViewAuditLogs('Registrirani_Korisnik')).toBe(false);
      expect(canViewAuditLogs('Posjetitelj')).toBe(false);
    });
  });

  describe('canViewExternalServices', () => {
    it('should allow Tehničar and Administrator to view external services', () => {
      expect(canViewExternalServices('Tehničar')).toBe(true);
      expect(canViewExternalServices('Administrator')).toBe(true);
    });

    it('should not allow other roles to view external services', () => {
      expect(canViewExternalServices('Registrirani_Korisnik')).toBe(false);
      expect(canViewExternalServices('Posjetitelj')).toBe(false);
    });
  });

  describe('getUserPermissions', () => {
    it('should return correct permissions for Administrator', () => {
      const permissions = getUserPermissions('Administrator');
      
      expect(permissions.isAuthenticated).toBe(true);
      expect(permissions.isAdministrator).toBe(true);
      expect(permissions.isTehnicar).toBe(false);
      expect(permissions.canManageTickets).toBe(true);
      expect(permissions.canChangeTicketStatus).toBe(true);
      expect(permissions.canAssignTickets).toBe(true);
      expect(permissions.canManageAnnouncements).toBe(true);
      expect(permissions.canPublishAnnouncements).toBe(true);
      expect(permissions.canDeleteAnnouncements).toBe(true);
      expect(permissions.canManageAssets).toBe(true);
      expect(permissions.canDeleteAssets).toBe(true);
      expect(permissions.canManageWorkflows).toBe(true);
      expect(permissions.canManageUsers).toBe(true);
      expect(permissions.canChangeUserRoles).toBe(true);
      expect(permissions.canViewAuditLogs).toBe(true);
      expect(permissions.canViewExternalServices).toBe(true);
    });

    it('should return correct permissions for Tehničar', () => {
      const permissions = getUserPermissions('Tehničar');
      
      expect(permissions.isAuthenticated).toBe(true);
      expect(permissions.isAdministrator).toBe(false);
      expect(permissions.isTehnicar).toBe(true);
      expect(permissions.canManageTickets).toBe(true);
      expect(permissions.canChangeTicketStatus).toBe(true);
      expect(permissions.canAssignTickets).toBe(true);
      expect(permissions.canManageAnnouncements).toBe(true);
      expect(permissions.canPublishAnnouncements).toBe(true);
      expect(permissions.canDeleteAnnouncements).toBe(false);
      expect(permissions.canManageAssets).toBe(true);
      expect(permissions.canDeleteAssets).toBe(false);
      expect(permissions.canManageWorkflows).toBe(false);
      expect(permissions.canManageUsers).toBe(false);
      expect(permissions.canChangeUserRoles).toBe(false);
      expect(permissions.canViewAuditLogs).toBe(false);
      expect(permissions.canViewExternalServices).toBe(true);
    });

    it('should return correct permissions for Registrirani_Korisnik', () => {
      const permissions = getUserPermissions('Registrirani_Korisnik');
      
      expect(permissions.isAuthenticated).toBe(true);
      expect(permissions.isAdministrator).toBe(false);
      expect(permissions.isTehnicar).toBe(false);
      expect(permissions.canManageTickets).toBe(true);
      expect(permissions.canChangeTicketStatus).toBe(false);
      expect(permissions.canAssignTickets).toBe(false);
      expect(permissions.canManageAnnouncements).toBe(false);
      expect(permissions.canPublishAnnouncements).toBe(false);
      expect(permissions.canDeleteAnnouncements).toBe(false);
      expect(permissions.canManageAssets).toBe(false);
      expect(permissions.canDeleteAssets).toBe(false);
      expect(permissions.canManageWorkflows).toBe(false);
      expect(permissions.canManageUsers).toBe(false);
      expect(permissions.canChangeUserRoles).toBe(false);
      expect(permissions.canViewAuditLogs).toBe(false);
      expect(permissions.canViewExternalServices).toBe(false);
    });

    it('should return correct permissions for Posjetitelj', () => {
      const permissions = getUserPermissions('Posjetitelj');
      
      expect(permissions.isAuthenticated).toBe(false);
      expect(permissions.isAdministrator).toBe(false);
      expect(permissions.isTehnicar).toBe(false);
      expect(permissions.canManageTickets).toBe(false);
      expect(permissions.canChangeTicketStatus).toBe(false);
      expect(permissions.canAssignTickets).toBe(false);
      expect(permissions.canManageAnnouncements).toBe(false);
      expect(permissions.canPublishAnnouncements).toBe(false);
      expect(permissions.canDeleteAnnouncements).toBe(false);
      expect(permissions.canManageAssets).toBe(false);
      expect(permissions.canDeleteAssets).toBe(false);
      expect(permissions.canManageWorkflows).toBe(false);
      expect(permissions.canManageUsers).toBe(false);
      expect(permissions.canChangeUserRoles).toBe(false);
      expect(permissions.canViewAuditLogs).toBe(false);
      expect(permissions.canViewExternalServices).toBe(false);
    });
  });

  describe('ROLES constant', () => {
    it('should export all role constants', () => {
      expect(ROLES.POSJETITELJ).toBe('Posjetitelj');
      expect(ROLES.REGISTRIRANI_KORISNIK).toBe('Registrirani_Korisnik');
      expect(ROLES.TEHNICAR).toBe('Tehničar');
      expect(ROLES.ADMINISTRATOR).toBe('Administrator');
    });
  });
});
