/**
 * Workflow Trigger Evaluators
 * 
 * This module provides trigger evaluation logic for the workflow automation engine.
 * Each trigger type (ticket_created, ticket_status_changed, time_scheduled, external_status_changed)
 * has its own evaluator class that determines whether workflow conditions are met.
 */

import cron from 'node-cron';

/**
 * Base class for all trigger evaluators
 */
class BaseTriggerEvaluator {
  constructor() {
    this.triggerType = null;
  }

  /**
   * Evaluate if trigger conditions are met
   * @param {Object} triggerConfig - Trigger configuration from workflow rule
   * @param {Object} eventData - Event data to evaluate against
   * @returns {boolean} True if conditions are met
   */
  async evaluate(triggerConfig, eventData) {
    throw new Error('evaluate() must be implemented by subclass');
  }
}

/**
 * Evaluator for ticket_created trigger
 * 
 * Evaluates when a new ticket is created.
 * Can filter by priority and status.
 * 
 * Example triggerConfig:
 * {
 *   priority: "Visoka",  // Optional: only trigger for high priority
 *   status: "Nova"       // Optional: only trigger for specific status
 * }
 */
class TicketCreatedEvaluator extends BaseTriggerEvaluator {
  constructor() {
    super();
    this.triggerType = 'ticket_created';
  }

  async evaluate(triggerConfig, eventData) {
    // If no config specified, trigger for all ticket creations
    if (!triggerConfig || Object.keys(triggerConfig).length === 0) {
      return true;
    }

    // Check priority filter if specified
    if (triggerConfig.priority) {
      if (eventData.priority !== triggerConfig.priority) {
        return false;
      }
    }

    // Check status filter if specified
    if (triggerConfig.status) {
      if (eventData.status !== triggerConfig.status) {
        return false;
      }
    }

    // All conditions met
    return true;
  }
}

/**
 * Evaluator for ticket_status_changed trigger
 * 
 * Evaluates when a ticket status changes from one value to another.
 * Can filter by from/to status combinations.
 * 
 * Example triggerConfig:
 * {
 *   fromStatus: "Nova",      // Optional: only trigger when changing from this status
 *   toStatus: "U radu"       // Optional: only trigger when changing to this status
 * }
 */
class TicketStatusChangedEvaluator extends BaseTriggerEvaluator {
  constructor() {
    super();
    this.triggerType = 'ticket_status_changed';
  }

  async evaluate(triggerConfig, eventData) {
    // If no config specified, trigger for any status change
    if (!triggerConfig || Object.keys(triggerConfig).length === 0) {
      return true;
    }

    // Check fromStatus filter if specified
    if (triggerConfig.fromStatus) {
      if (eventData.oldStatus !== triggerConfig.fromStatus) {
        return false;
      }
    }

    // Check toStatus filter if specified
    if (triggerConfig.toStatus) {
      if (eventData.newStatus !== triggerConfig.toStatus) {
        return false;
      }
    }

    // All conditions met
    return true;
  }
}

/**
 * Evaluator for time_scheduled trigger
 * 
 * Evaluates based on cron expressions for scheduled workflow execution.
 * Uses node-cron for scheduling.
 * 
 * Example triggerConfig:
 * {
 *   cronExpression: "0 9 * * 1"  // Every Monday at 9 AM
 * }
 * 
 * Cron format: second minute hour day month weekday
 * Examples:
 * - "0 9 * * 1" = Every Monday at 9:00 AM
 * - "0 0 * * *" = Every day at midnight
 * - "* /15 * * * *" = Every 15 minutes (without space)
 */
class TimeScheduledEvaluator extends BaseTriggerEvaluator {
  constructor() {
    super();
    this.triggerType = 'time_scheduled';
    this.scheduledTasks = new Map(); // Track scheduled cron jobs
  }

  /**
   * For time-based triggers, evaluation checks if cron expression is valid
   * Actual scheduling happens via scheduleWorkflow()
   */
  async evaluate(triggerConfig, eventData) {
    // Validate cron expression exists
    if (!triggerConfig || !triggerConfig.cronExpression) {
      throw new Error('cronExpression required for time_scheduled trigger');
    }

    // Validate cron expression format
    const isValid = cron.validate(triggerConfig.cronExpression);
    if (!isValid) {
      throw new Error(`Invalid cron expression: ${triggerConfig.cronExpression}`);
    }

    // For scheduled events, always return true once triggered
    if (eventData && eventData.type === 'scheduled') {
      return true;
    }

    return false;
  }

  /**
   * Schedule a workflow rule with cron
   * @param {string} workflowId - Workflow rule ID
   * @param {Object} triggerConfig - Trigger configuration with cronExpression
   * @param {Function} callback - Function to call when cron triggers
   * @returns {Object} The scheduled cron task
   */
  scheduleWorkflow(workflowId, triggerConfig, callback) {
    if (!triggerConfig.cronExpression) {
      throw new Error('cronExpression required for scheduling');
    }

    // Validate cron expression
    if (!cron.validate(triggerConfig.cronExpression)) {
      throw new Error(`Invalid cron expression: ${triggerConfig.cronExpression}`);
    }

    // Stop existing schedule if any
    this.unscheduleWorkflow(workflowId);

    // Create new scheduled task
    const task = cron.schedule(triggerConfig.cronExpression, callback, {
      scheduled: true,
      timezone: 'Europe/Zagreb' // Croatian timezone
    });

    // Store the task for later management
    this.scheduledTasks.set(workflowId, task);

    return task;
  }

  /**
   * Remove scheduled workflow
   * @param {string} workflowId - Workflow rule ID to unschedule
   */
  unscheduleWorkflow(workflowId) {
    const task = this.scheduledTasks.get(workflowId);
    if (task) {
      task.stop();
      this.scheduledTasks.delete(workflowId);
    }
  }

  /**
   * Get all scheduled workflows
   * @returns {Map} Map of workflowId to cron task
   */
  getScheduledWorkflows() {
    return this.scheduledTasks;
  }
}

/**
 * Evaluator for external_status_changed trigger
 * 
 * Evaluates when an external service status changes.
 * Can filter by service name and status condition.
 * 
 * Example triggerConfig:
 * {
 *   serviceName: "GitHub",           // Optional: filter by service name
 *   statusCondition: "degraded"      // Optional: trigger only for specific status
 * }
 * 
 * Status values typically: "operational", "degraded", "down", "maintenance"
 */
class ExternalStatusChangedEvaluator extends BaseTriggerEvaluator {
  constructor() {
    super();
    this.triggerType = 'external_status_changed';
  }

  async evaluate(triggerConfig, eventData) {
    // If no config specified, trigger for any external status change
    if (!triggerConfig || Object.keys(triggerConfig).length === 0) {
      return true;
    }

    // Check serviceName filter if specified
    if (triggerConfig.serviceName) {
      if (eventData.serviceName !== triggerConfig.serviceName) {
        return false;
      }
    }

    // Check statusCondition filter if specified
    if (triggerConfig.statusCondition) {
      if (eventData.newStatus !== triggerConfig.statusCondition) {
        return false;
      }
    }

    // All conditions met
    return true;
  }
}

/**
 * TriggerRegistry - Central registry for all trigger evaluators
 * 
 * Manages trigger evaluators and provides lookup by trigger type.
 */
class TriggerRegistry {
  constructor() {
    this.evaluators = new Map();
    this._registerDefaultEvaluators();
  }

  /**
   * Register default trigger evaluators
   * @private
   */
  _registerDefaultEvaluators() {
    this.register(new TicketCreatedEvaluator());
    this.register(new TicketStatusChangedEvaluator());
    this.register(new TimeScheduledEvaluator());
    this.register(new ExternalStatusChangedEvaluator());
  }

  /**
   * Register a trigger evaluator
   * @param {BaseTriggerEvaluator} evaluator - Evaluator instance to register
   */
  register(evaluator) {
    if (!(evaluator instanceof BaseTriggerEvaluator)) {
      throw new Error('Evaluator must extend BaseTriggerEvaluator');
    }

    if (!evaluator.triggerType) {
      throw new Error('Evaluator must have a triggerType');
    }

    this.evaluators.set(evaluator.triggerType, evaluator);
  }

  /**
   * Get evaluator by trigger type
   * @param {string} triggerType - Type of trigger
   * @returns {BaseTriggerEvaluator|null} Evaluator instance or null
   */
  get(triggerType) {
    return this.evaluators.get(triggerType) || null;
  }

  /**
   * Check if trigger type is registered
   * @param {string} triggerType - Type of trigger
   * @returns {boolean} True if registered
   */
  has(triggerType) {
    return this.evaluators.has(triggerType);
  }

  /**
   * Get all registered trigger types
   * @returns {string[]} Array of trigger type names
   */
  getRegisteredTypes() {
    return Array.from(this.evaluators.keys());
  }
}

// Export evaluator classes and registry
export {
  BaseTriggerEvaluator,
  TicketCreatedEvaluator,
  TicketStatusChangedEvaluator,
  TimeScheduledEvaluator,
  ExternalStatusChangedEvaluator,
  TriggerRegistry
};
