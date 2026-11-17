/**
 * Users Controller
 * Handles HTTP requests for user management (Administrator only)
 * Requirements: 5.1, 5.2, 5.3, 5.7, 5.8, 5.9
 */

import * as userModel from '../models/user.model.js';
import * as auditService from '../services/audit.service.js';
import { hashPassword } from '../utils/auth.js';
import logger from '../utils/logger.js';

/**
 * GET /api/v1/users
 * Get all users with pagination and filtering
 * Requirement: 5.1, 5.5 - Display list of users
 */
export async function getUsers(req, res) {
  try {
    const { role, isActive, page, limit } = req.query;

    const filters = {
      role,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    };

    const result = await userModel.getUsers(filters);

    res.json(result);
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Greška pri dohvaćanju korisnika',
      },
    });
  }
}

/**
 * GET /api/v1/users/:id
 * Get a single user by ID
 * Requirement: 5.5 - View user details
 */
export async function getUserById(req, res) {
  try {
    const { id } = req.params;

    const user = await userModel.getUserById(id);

    if (!user) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Korisnik nije pronađen',
        },
      });
    }

    res.json(user);
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Greška pri dohvaćanju korisnika',
      },
    });
  }
}

/**
 * PATCH /api/v1/users/:id/role
 * Change user role
 * Requirements: 5.2, 5.7, 5.8 - Change role, log action, prevent last admin modification
 */
export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const admin = req.user;

    // Validate role
    const validRoles = ['Posjetitelj', 'Registrirani_Korisnik', 'Tehničar', 'Administrator'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nevažeća uloga',
          details: [
            {
              field: 'role',
              message: `Uloga mora biti jedna od: ${validRoles.join(', ')}`,
            },
          ],
        },
      });
    }

    // Get target user
    const targetUser = await userModel.getUserById(id);

    if (!targetUser) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Korisnik nije pronađen',
        },
      });
    }

    // Check if user is active
    if (!targetUser.is_active) {
      return res.status(400).json({
        error: {
          code: 'USER_INACTIVE',
          message: 'Ne možete promijeniti ulogu deaktiviranom korisniku',
        },
      });
    }

    // Requirement 5.8: Prevent last Administrator from being role-changed
    if (targetUser.role === 'Administrator' && role !== 'Administrator') {
      const adminCount = await userModel.countAdministrators();
      
      if (adminCount <= 1) {
        return res.status(400).json({
          error: {
            code: 'LAST_ADMIN',
            message: 'Ne možete promijeniti ulogu posljednjeg administratora',
          },
        });
      }
    }

    // Prevent self-role change (additional safety)
    if (id === admin.userId) {
      return res.status(400).json({
        error: {
          code: 'SELF_MODIFICATION',
          message: 'Ne možete promijeniti vlastitu ulogu',
        },
      });
    }

    const oldRole = targetUser.role;

    // Update role
    const updatedUser = await userModel.updateUserRole(id, role);

    // Requirement 5.7: Log user management action
    await auditService.logRoleChange(
      admin.userId,
      id,
      oldRole,
      role,
      req.ip,
      req.get('user-agent')
    );

    logger.info(`User role changed: ${id} from ${oldRole} to ${role} by admin ${admin.userId}`);

    res.json(updatedUser);
  } catch (error) {
    logger.error('Error updating user role:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Greška pri promjeni uloge korisnika',
      },
    });
  }
}

/**
 * PATCH /api/v1/users/:id/deactivate
 * Deactivate user account
 * Requirements: 5.3, 5.4, 5.7, 5.8 - Deactivate account, terminate sessions, log action
 */
export async function deactivateUser(req, res) {
  try {
    const { id } = req.params;
    const admin = req.user;

    // Get target user
    const targetUser = await userModel.getUserById(id);

    if (!targetUser) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Korisnik nije pronađen',
        },
      });
    }

    // Check if already inactive
    if (!targetUser.is_active) {
      return res.status(400).json({
        error: {
          code: 'ALREADY_INACTIVE',
          message: 'Korisnik je već deaktiviran',
        },
      });
    }

    // Requirement 5.8: Prevent last Administrator from being deactivated
    if (targetUser.role === 'Administrator') {
      const adminCount = await userModel.countAdministrators();
      
      if (adminCount <= 1) {
        return res.status(400).json({
          error: {
            code: 'LAST_ADMIN',
            message: 'Ne možete deaktivirati posljednjeg administratora',
          },
        });
      }
    }

    // Prevent self-deactivation (additional safety)
    if (id === admin.userId) {
      return res.status(400).json({
        error: {
          code: 'SELF_MODIFICATION',
          message: 'Ne možete deaktivirati vlastiti račun',
        },
      });
    }

    // Deactivate user
    const updatedUser = await userModel.deactivateUser(id);

    // Requirement 5.7: Log user management action
    await auditService.logUserDeactivation(
      admin.userId,
      id,
      req.ip,
      req.get('user-agent')
    );

    // Requirement 5.4: Terminate active sessions
    // Note: JWT tokens are stateless, so we can't revoke them directly.
    // In a production system, you would:
    // 1. Maintain a token blacklist
    // 2. Use short-lived tokens with refresh tokens
    // 3. Check user.is_active on each request in auth middleware
    // For now, the is_active check in auth middleware will prevent further access

    logger.info(`User deactivated: ${id} by admin ${admin.userId}`);

    res.json(updatedUser);
  } catch (error) {
    logger.error('Error deactivating user:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Greška pri deaktivaciji korisnika',
      },
    });
  }
}

/**
 * PATCH /api/v1/users/:id/activate
 * Activate user account
 */
export async function activateUser(req, res) {
  try {
    const { id } = req.params;
    const admin = req.user;

    // Get target user
    const targetUser = await userModel.getUserById(id);

    if (!targetUser) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Korisnik nije pronađen',
        },
      });
    }

    // Check if already active
    if (targetUser.is_active) {
      return res.status(400).json({
        error: {
          code: 'ALREADY_ACTIVE',
          message: 'Korisnik je već aktivan',
        },
      });
    }

    // Activate user
    const updatedUser = await userModel.activateUser(id);

    // Log action
    await auditService.logUserActivation(
      admin.userId,
      id,
      req.ip,
      req.get('user-agent')
    );

    logger.info(`User activated: ${id} by admin ${admin.userId}`);

    res.json(updatedUser);
  } catch (error) {
    logger.error('Error activating user:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Greška pri aktivaciji korisnika',
      },
    });
  }
}

/**
 * PATCH /api/v1/users/:id/reset-password
 * Reset user password (Administrator only)
 * Requirements: 5.6, 5.7 - Reset password, log action
 */
export async function resetUserPassword(req, res) {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const admin = req.user;

    // Validate password
    if (!password || password.length < 8) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nevažeća lozinka',
          details: [
            {
              field: 'password',
              message: 'Lozinka mora imati najmanje 8 znakova',
            },
          ],
        },
      });
    }

    // Get target user
    const targetUser = await userModel.getUserById(id);

    if (!targetUser) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Korisnik nije pronađen',
        },
      });
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update password
    const updatedUser = await userModel.updateUserPassword(id, passwordHash);

    // Requirement 5.7: Log user management action
    await auditService.logPasswordReset(
      admin.userId,
      id,
      req.ip,
      req.get('user-agent')
    );

    logger.info(`User password reset: ${id} by admin ${admin.userId}`);

    res.json({
      message: 'Lozinka je uspješno resetirana',
      user: updatedUser,
    });
  } catch (error) {
    logger.error('Error resetting user password:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Greška pri resetiranju lozinke',
      },
    });
  }
}
