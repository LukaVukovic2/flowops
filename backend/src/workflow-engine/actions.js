/**
 * Workflow Action Executors
 * 
 * This module provides action execution logic for the workflow automation engine.
 * Each action type has its own executor class that performs the automated operation.
 * 
 * Requirement 4.3: Support action types: send_notification, update_ticket_status, 
 * assign_technician, create_announcement
 */

import supabase from '../config/database.js';
import { updateTicketStatus } from '../models/ticket.model.js';
import { createAnnouncement } from '../models/announcement.model.js';
import { getUserById, getUsers } from '../models/user.model.js';
import logger from '../utils/logger.js';

/**
 * Base class for all action executors
 */
class BaseActionExecutor {
  constructor() {
    this.actionType = null;
  }

  /**
   * Execute the action
   * @param {Object} actionConfig - Action configuration from workflow rule
   * @param {Object} context - Execution context (event data, workflow info, etc.)
   * @returns {Promise<Object>} Execution result with success status and details
   */
  async execute(actionConfig, context) {
    throw new Error('execute() must be implemented by subclass');
  }
}

/**
 * Executor for send_notification action
 * 
 * Sends notifications to users based on role or specific user.
 * Note: This is a basic implementation that logs notifications.
 * In production, this would integrate with email/SMS/push notification services.
 * 
 * Example actionConfig:
 * {
 *   recipientRole: "Tehničar",           // Optional: send to all users with this role
 *   recipientUserId: "uuid",             // Optional: send to specific user
 *   messageTemplate: "New ticket {{title}} created with priority {{priority}}"
 * }
 */
class SendNotificationExecutor extends BaseActionExecutor {
  constructor() {
    super();
    this.actionType = 'send_notification';
  }

  /**
   * Replace template variables in message
   * @param {string} template - Message template with {{variable}} placeholders
   * @param {Object} context - Context data for variable replacement
   * @returns {string} Message with variables replaced
   */
  _replaceTemplateVariables(template, context) {
    let message = template;
    
    // Replace all {{variable}} patterns with context values
    const regex = /\{\{(\w+)\}\}/g;
    message = message.replace(regex, (match, variable) => {
      return context[variable] !== undefined ? context[variable] : match;
    });
    
    return message;
  }

  async execute(actionConfig, context) {
    try {
      const { recipientRole, recipientUserId, messageTemplate } = actionConfig;
      
      if (!messageTemplate) {
        throw new Error('messageTemplate is required for send_notification action');
      }

      // Determine recipients
      let recipients = [];
      
      if (recipientUserId) {
        // Send to specific user
        const user = await getUserById(recipientUserId);
        if (user) {
          recipients.push(user);
        }
      } else if (recipientRole) {
        // Send to all users with specific role
        const result = await getUsers({ role: recipientRole, isActive: true, limit: 100 });
        recipients = result.users;
      } else {
        throw new Error('Either recipientRole or recipientUserId must be specified');
      }

      if (recipients.length === 0) {
        return {
          success: true,
          message: 'No recipients found',
          recipientCount: 0
        };
      }

      // Replace template variables with context data
      const message = this._replaceTemplateVariables(messageTemplate, context.eventData || {});

      // Log notifications (in production, this would send actual notifications)
      for (const recipient of recipients) {
        logger.info(`[NOTIFICATION] To: ${recipient.email} (${recipient.role})`, {
          message,
          workflowId: context.workflowId,
          eventType: context.eventType
        });
        
        // In production, integrate with notification service here
        // await notificationService.send(recipient.email, message);
      }

      return {
        success: true,
        message: `Notification sent to ${recipients.length} recipient(s)`,
        recipientCount: recipients.length,
        recipients: recipients.map(r => ({ id: r.id, email: r.email, role: r.role }))
      };
    } catch (error) {
      logger.error('Error executing send_notification action:', error);
      return {
        success: false,
        message: `Failed to send notification: ${error.message}`,
        error: error.message
      };
    }
  }
}

/**
 * Executor for update_ticket_status action
 * 
 * Updates the status of a ticket.
 * 
 * Example actionConfig:
 * {
 *   ticketId: "uuid",              // Optional: specific ticket (or use context.ticketId)
 *   newStatus: "U radu"            // Required: new status value
 * }
 * 
 * Valid status values: Nova, U radu, Na čekanju, Riješena, Zatvorena
 */
class UpdateTicketStatusExecutor extends BaseActionExecutor {
  constructor() {
    super();
    this.actionType = 'update_ticket_status';
    this.validStatuses = ['Nova', 'U radu', 'Na čekanju', 'Riješena', 'Zatvorena'];
  }

  async execute(actionConfig, context) {
    try {
      const { newStatus, ticketId: configTicketId } = actionConfig;
      
      if (!newStatus) {
        throw new Error('newStatus is required for update_ticket_status action');
      }

      // Validate status
      if (!this.validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}. Valid values: ${this.validStatuses.join(', ')}`);
      }

      // Determine ticket ID from config or context
      const ticketId = configTicketId || context.eventData?.ticketId || context.eventData?.id;
      
      if (!ticketId) {
        throw new Error('ticketId not found in config or context');
      }

      // Use a system user ID for workflow-automated changes
      // In a real implementation, you'd have a dedicated "system" user
      const systemUserId = context.systemUserId || 'system';

      // Update ticket status
      await updateTicketStatus(ticketId, newStatus, systemUserId);

      logger.info(`[WORKFLOW ACTION] Updated ticket ${ticketId} status to ${newStatus}`, {
        workflowId: context.workflowId,
        eventType: context.eventType
      });

      return {
        success: true,
        message: `Ticket status updated to ${newStatus}`,
        ticketId,
        newStatus
      };
    } catch (error) {
      logger.error('Error executing update_ticket_status action:', error);
      return {
        success: false,
        message: `Failed to update ticket status: ${error.message}`,
        error: error.message
      };
    }
  }
}

/**
 * Executor for assign_technician action
 * 
 * Assigns a technician to a ticket using various strategies.
 * 
 * Example actionConfig:
 * {
 *   ticketId: "uuid",                      // Optional: specific ticket (or use context)
 *   technicianId: "uuid",                  // Optional: specific technician (used with 'specific' strategy)
 *   assignmentStrategy: "least_loaded"     // Required: "least_loaded", "round_robin", or "specific"
 * }
 * 
 * Strategies:
 * - specific: Assign to a specific technician (requires technicianId)
 * - least_loaded: Assign to technician with fewest assigned tickets
 * - round_robin: Rotate through available technicians
 */
class AssignTechnicianExecutor extends BaseActionExecutor {
  constructor() {
    super();
    this.actionType = 'assign_technician';
    this.validStrategies = ['specific', 'least_loaded', 'round_robin'];
    this.roundRobinIndex = 0; // Track round-robin position
  }

  /**
   * Get technician with least assigned tickets
   * @returns {Promise<Object|null>} Technician user object or null
   */
  async _getLeastLoadedTechnician() {
    try {
      // Get all active technicians
      const result = await getUsers({ 
        role: 'Tehničar', 
        isActive: true, 
        limit: 100 
      });
      
      if (result.users.length === 0) {
        return null;
      }

      // Count assigned tickets for each technician
      const technicianLoads = await Promise.all(
        result.users.map(async (tech) => {
          const { count, error } = await supabase
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .eq('assignee_id', tech.id)
            .in('status', ['Nova', 'U radu', 'Na čekanju']); // Only count active tickets

          if (error) {
            logger.error(`Error counting tickets for technician ${tech.id}:`, error);
            return { technician: tech, load: Infinity };
          }

          return { technician: tech, load: count || 0 };
        })
      );

      // Find technician with minimum load
      const leastLoaded = technicianLoads.reduce((min, current) => 
        current.load < min.load ? current : min
      );

      logger.info(`Least loaded technician: ${leastLoaded.technician.email} with ${leastLoaded.load} tickets`);

      return leastLoaded.technician;
    } catch (error) {
      logger.error('Error finding least loaded technician:', error);
      return null;
    }
  }

  /**
   * Get next technician using round-robin strategy
   * @returns {Promise<Object|null>} Technician user object or null
   */
  async _getRoundRobinTechnician() {
    try {
      // Get all active technicians
      const result = await getUsers({ 
        role: 'Tehničar', 
        isActive: true, 
        limit: 100 
      });
      
      if (result.users.length === 0) {
        return null;
      }

      // Get next technician in rotation
      const technician = result.users[this.roundRobinIndex % result.users.length];
      
      // Increment index for next call
      this.roundRobinIndex = (this.roundRobinIndex + 1) % result.users.length;

      logger.info(`Round-robin selected technician: ${technician.email}`);

      return technician;
    } catch (error) {
      logger.error('Error finding round-robin technician:', error);
      return null;
    }
  }

  async execute(actionConfig, context) {
    try {
      const { assignmentStrategy, technicianId, ticketId: configTicketId } = actionConfig;
      
      if (!assignmentStrategy) {
        throw new Error('assignmentStrategy is required for assign_technician action');
      }

      // Validate strategy
      if (!this.validStrategies.includes(assignmentStrategy)) {
        throw new Error(`Invalid strategy: ${assignmentStrategy}. Valid values: ${this.validStrategies.join(', ')}`);
      }

      // Determine ticket ID from config or context
      const ticketId = configTicketId || context.eventData?.ticketId || context.eventData?.id;
      
      if (!ticketId) {
        throw new Error('ticketId not found in config or context');
      }

      let assignedTechnician = null;

      // Execute assignment strategy
      switch (assignmentStrategy) {
        case 'specific':
          if (!technicianId) {
            throw new Error('technicianId is required for specific assignment strategy');
          }
          assignedTechnician = await getUserById(technicianId);
          if (!assignedTechnician) {
            throw new Error(`Technician with ID ${technicianId} not found`);
          }
          if (assignedTechnician.role !== 'Tehničar') {
            throw new Error(`User ${technicianId} is not a Tehničar`);
          }
          break;

        case 'least_loaded':
          assignedTechnician = await this._getLeastLoadedTechnician();
          if (!assignedTechnician) {
            throw new Error('No available technicians found');
          }
          break;

        case 'round_robin':
          assignedTechnician = await this._getRoundRobinTechnician();
          if (!assignedTechnician) {
            throw new Error('No available technicians found');
          }
          break;
      }

      // Update ticket with assigned technician
      const { data, error } = await supabase
        .from('tickets')
        .update({ 
          assignee_id: assignedTechnician.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to assign technician: ${error.message}`);
      }

      logger.info(`[WORKFLOW ACTION] Assigned ticket ${ticketId} to technician ${assignedTechnician.email}`, {
        strategy: assignmentStrategy,
        workflowId: context.workflowId,
        eventType: context.eventType
      });

      return {
        success: true,
        message: `Ticket assigned to ${assignedTechnician.first_name} ${assignedTechnician.last_name}`,
        ticketId,
        technicianId: assignedTechnician.id,
        technicianEmail: assignedTechnician.email,
        strategy: assignmentStrategy
      };
    } catch (error) {
      logger.error('Error executing assign_technician action:', error);
      return {
        success: false,
        message: `Failed to assign technician: ${error.message}`,
        error: error.message
      };
    }
  }
}

/**
 * Executor for create_announcement action
 * 
 * Creates an announcement automatically (useful for system notifications).
 * 
 * Example actionConfig:
 * {
 *   title: "System Notification",           // Required: announcement title
 *   content: "Ticket {{ticketId}} resolved", // Required: announcement content
 *   categoryId: "uuid",                     // Optional: announcement category
 *   authorId: "uuid",                       // Optional: author (or use system user)
 *   autoPublish: true                       // Optional: automatically publish (default: false)
 * }
 */
class CreateAnnouncementExecutor extends BaseActionExecutor {
  constructor() {
    super();
    this.actionType = 'create_announcement';
  }

  /**
   * Replace template variables in text
   * @param {string} template - Text template with {{variable}} placeholders
   * @param {Object} context - Context data for variable replacement
   * @returns {string} Text with variables replaced
   */
  _replaceTemplateVariables(template, context) {
    let text = template;
    
    // Replace all {{variable}} patterns with context values
    const regex = /\{\{(\w+)\}\}/g;
    text = text.replace(regex, (match, variable) => {
      return context[variable] !== undefined ? context[variable] : match;
    });
    
    return text;
  }

  async execute(actionConfig, context) {
    try {
      const { title, content, categoryId, authorId, autoPublish = false } = actionConfig;
      
      if (!title) {
        throw new Error('title is required for create_announcement action');
      }

      if (!content) {
        throw new Error('content is required for create_announcement action');
      }

      // Replace template variables in title and content
      const processedTitle = this._replaceTemplateVariables(title, context.eventData || {});
      const processedContent = this._replaceTemplateVariables(content, context.eventData || {});

      // Determine author (use system user if not specified)
      const announcementAuthorId = authorId || context.systemUserId || 'system';

      // Create announcement
      const announcementData = {
        title: processedTitle,
        content: processedContent,
        authorId: announcementAuthorId,
        categoryId: categoryId || null
      };

      const announcement = await createAnnouncement(announcementData);

      // Auto-publish if requested
      if (autoPublish) {
        const { error } = await supabase
          .from('announcements')
          .update({ 
            is_published: true,
            published_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', announcement.id);

        if (error) {
          logger.error('Error auto-publishing announcement:', error);
          // Don't fail the action, just log the error
        }
      }

      logger.info(`[WORKFLOW ACTION] Created announcement: ${processedTitle}`, {
        announcementId: announcement.id,
        autoPublish,
        workflowId: context.workflowId,
        eventType: context.eventType
      });

      return {
        success: true,
        message: `Announcement created: ${processedTitle}`,
        announcementId: announcement.id,
        title: processedTitle,
        isPublished: autoPublish
      };
    } catch (error) {
      logger.error('Error executing create_announcement action:', error);
      return {
        success: false,
        message: `Failed to create announcement: ${error.message}`,
        error: error.message
      };
    }
  }
}

/**
 * ActionRegistry - Central registry for all action executors
 * 
 * Manages action executors and provides lookup by action type.
 */
class ActionRegistry {
  constructor() {
    this.executors = new Map();
    this._registerDefaultExecutors();
  }

  /**
   * Register default action executors
   * @private
   */
  _registerDefaultExecutors() {
    this.register(new SendNotificationExecutor());
    this.register(new UpdateTicketStatusExecutor());
    this.register(new AssignTechnicianExecutor());
    this.register(new CreateAnnouncementExecutor());
  }

  /**
   * Register an action executor
   * @param {BaseActionExecutor} executor - Executor instance to register
   */
  register(executor) {
    if (!(executor instanceof BaseActionExecutor)) {
      throw new Error('Executor must extend BaseActionExecutor');
    }

    if (!executor.actionType) {
      throw new Error('Executor must have an actionType');
    }

    this.executors.set(executor.actionType, executor);
  }

  /**
   * Get executor by action type
   * @param {string} actionType - Type of action
   * @returns {BaseActionExecutor|null} Executor instance or null
   */
  get(actionType) {
    return this.executors.get(actionType) || null;
  }

  /**
   * Check if action type is registered
   * @param {string} actionType - Type of action
   * @returns {boolean} True if registered
   */
  has(actionType) {
    return this.executors.has(actionType);
  }

  /**
   * Get all registered action types
   * @returns {string[]} Array of action type names
   */
  getRegisteredTypes() {
    return Array.from(this.executors.keys());
  }

  /**
   * Execute an action
   * @param {string} actionType - Type of action to execute
   * @param {Object} actionConfig - Action configuration
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Execution result
   */
  async execute(actionType, actionConfig, context) {
    const executor = this.get(actionType);
    
    if (!executor) {
      throw new Error(`Unknown action type: ${actionType}`);
    }

    return await executor.execute(actionConfig, context);
  }
}

// Export action executor classes and registry
export {
  BaseActionExecutor,
  SendNotificationExecutor,
  UpdateTicketStatusExecutor,
  AssignTechnicianExecutor,
  CreateAnnouncementExecutor,
  ActionRegistry
};
