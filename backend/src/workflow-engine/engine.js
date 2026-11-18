/**
 * Workflow Execution Engine
 * 
 * This module provides the main workflow engine that orchestrates trigger evaluation
 * and action execution for the workflow automation system.
 * 
 * Requirements:
 * - 4.4: Execute workflow actions within 60 seconds when trigger condition met
 * - 4.5: Log all executions with timestamp, trigger, and result
 * - 4.7: Ensure workflow failures don't crash the system
 */

import supabase from '../config/database.js';
import { TriggerRegistry } from './triggers.js';
import { ActionRegistry } from './actions.js';
import logger from '../utils/logger.js';

/**
 * WorkflowEngine - Main workflow orchestration engine
 * 
 * Coordinates trigger evaluation and action execution for workflow automation.
 * Handles both event-driven and time-based workflows.
 */
class WorkflowEngine {
  constructor() {
    this.triggerRegistry = new TriggerRegistry();
    this.actionRegistry = new ActionRegistry();
    this.scheduledWorkflows = new Map(); // Track scheduled workflow tasks
    this.isInitialized = false;
  }

  /**
   * Initialize the workflow engine
   * Loads all active workflows and schedules time-based workflows
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) {
      logger.warn('WorkflowEngine already initialized');
      return;
    }

    try {
      logger.info('Initializing WorkflowEngine...');

      // Load all active time-based workflows and schedule them
      await this.scheduleWorkflows();

      this.isInitialized = true;
      logger.info('WorkflowEngine initialized successfully');
    } catch (error) {
      logger.error('Error initializing WorkflowEngine:', error);
      throw error;
    }
  }

  /**
   * Process an event and trigger matching workflows
   * 
   * Requirements 4.4, 4.5, 4.7:
   * - Execute actions within 60 seconds
   * - Log all executions
   * - Handle failures gracefully
   * 
   * @param {string} eventType - Type of event (ticket_created, ticket_status_changed, external_status_changed)
   * @param {Object} eventData - Event data to evaluate and pass to actions
   * @returns {Promise<Object[]>} Array of execution results
   */
  async processEvent(eventType, eventData) {
    const executionResults = [];

    try {
      logger.info(`Processing event: ${eventType}`, { eventData });

      // Fetch all enabled workflows matching this event type
      const { data: workflows, error } = await supabase
        .from('workflow_rules')
        .select('*')
        .eq('is_enabled', true)
        .eq('trigger_type', eventType);

      if (error) {
        logger.error('Error fetching workflows:', error);
        throw error;
      }

      if (!workflows || workflows.length === 0) {
        logger.info(`No enabled workflows found for event type: ${eventType}`);
        return executionResults;
      }

      logger.info(`Found ${workflows.length} enabled workflow(s) for event type: ${eventType}`);

      // Process each workflow
      for (const workflow of workflows) {
        try {
          const result = await this._executeWorkflow(workflow, eventData, eventType);
          executionResults.push(result);
        } catch (error) {
          // Requirement 4.7: Ensure workflow failures don't crash system
          logger.error(`Error executing workflow ${workflow.id}:`, error);
          
          // Log the failure
          await this._logExecution(workflow.id, eventData, 'failure', error.message);
          
          executionResults.push({
            workflowId: workflow.id,
            workflowName: workflow.name,
            success: false,
            error: error.message
          });
        }
      }

      return executionResults;
    } catch (error) {
      // Requirement 4.7: System continues even if event processing fails
      logger.error('Error processing event:', error);
      return executionResults;
    }
  }

  /**
   * Execute a single workflow rule
   * @param {Object} workflow - Workflow rule from database
   * @param {Object} eventData - Event data
   * @param {string} eventType - Type of event
   * @returns {Promise<Object>} Execution result
   * @private
   */
  async _executeWorkflow(workflow, eventData, eventType) {
    const startTime = Date.now();

    try {
      logger.info(`Evaluating workflow: ${workflow.name} (${workflow.id})`);

      // Get trigger evaluator
      const triggerEvaluator = this.triggerRegistry.get(workflow.trigger_type);
      
      if (!triggerEvaluator) {
        throw new Error(`No evaluator found for trigger type: ${workflow.trigger_type}`);
      }

      // Evaluate trigger conditions
      const triggerConfig = workflow.trigger_config || {};
      const shouldExecute = await triggerEvaluator.evaluate(triggerConfig, eventData);

      if (!shouldExecute) {
        logger.info(`Workflow ${workflow.name} trigger conditions not met, skipping`);
        return {
          workflowId: workflow.id,
          workflowName: workflow.name,
          success: true,
          skipped: true,
          message: 'Trigger conditions not met'
        };
      }

      logger.info(`Workflow ${workflow.name} trigger conditions met, executing actions...`);

      // Execute all actions
      const actions = workflow.actions || [];
      const actionResults = [];

      const context = {
        workflowId: workflow.id,
        workflowName: workflow.name,
        eventType,
        eventData,
        systemUserId: workflow.created_by // Use workflow creator as system user
      };

      for (const action of actions) {
        try {
          const actionType = action.type;
          const actionConfig = action.config || {};

          logger.info(`Executing action: ${actionType}`);

          const result = await this.actionRegistry.execute(actionType, actionConfig, context);
          actionResults.push({
            actionType,
            ...result
          });

          if (!result.success) {
            logger.warn(`Action ${actionType} failed:`, result.message);
          }
        } catch (error) {
          logger.error(`Error executing action ${action.type}:`, error);
          actionResults.push({
            actionType: action.type,
            success: false,
            error: error.message
          });
        }
      }

      // Determine overall status
      const allSucceeded = actionResults.every(r => r.success);
      const someSucceeded = actionResults.some(r => r.success);
      
      let status = 'success';
      if (!allSucceeded && someSucceeded) {
        status = 'partial';
      } else if (!allSucceeded) {
        status = 'failure';
      }

      const executionTime = Date.now() - startTime;
      logger.info(`Workflow ${workflow.name} completed in ${executionTime}ms with status: ${status}`);

      // Requirement 4.5: Log execution with timestamp, trigger, and result
      await this._logExecution(
        workflow.id,
        eventData,
        status,
        null, // no error message for successful/partial executions
        actionResults
      );

      return {
        workflowId: workflow.id,
        workflowName: workflow.name,
        success: status !== 'failure',
        status,
        actionResults,
        executionTime
      };
    } catch (error) {
      logger.error(`Error in workflow ${workflow.name}:`, error);
      throw error;
    }
  }

  /**
   * Log workflow execution to database
   * 
   * Requirement 4.5: Log all executions with timestamp, trigger, and result
   * 
   * @param {string} workflowRuleId - Workflow rule ID
   * @param {Object} triggerData - Trigger event data
   * @param {string} status - Execution status (success, failure, partial)
   * @param {string} errorMessage - Error message if failed
   * @param {Array} actionResults - Results from action executions
   * @returns {Promise<void>}
   * @private
   */
  async _logExecution(workflowRuleId, triggerData, status, errorMessage = null, actionResults = []) {
    try {
      const { error } = await supabase
        .from('workflow_executions')
        .insert({
          workflow_rule_id: workflowRuleId,
          trigger_data: triggerData,
          status,
          error_message: errorMessage,
          action_results: actionResults, // Store action results for debugging
          executed_at: new Date().toISOString()
        });

      if (error) {
        logger.error('Error logging workflow execution:', error);
        // Don't throw - logging failure shouldn't prevent workflow execution
      }
    } catch (error) {
      logger.error('Error logging workflow execution:', error);
      // Don't throw - logging failure shouldn't prevent workflow execution
    }
  }

  /**
   * Schedule all time-based workflows
   * 
   * Loads all active time_scheduled workflows from database and schedules them
   * with node-cron.
   * 
   * @returns {Promise<void>}
   */
  async scheduleWorkflows() {
    try {
      logger.info('Scheduling time-based workflows...');

      // Unschedule any existing workflows
      this._unscheduleAllWorkflows();

      // Fetch all enabled time-based workflows
      const { data: workflows, error } = await supabase
        .from('workflow_rules')
        .select('*')
        .eq('is_enabled', true)
        .eq('trigger_type', 'time_scheduled');

      if (error) {
        logger.error('Error fetching time-based workflows:', error);
        throw error;
      }

      if (!workflows || workflows.length === 0) {
        logger.info('No time-based workflows to schedule');
        return;
      }

      logger.info(`Scheduling ${workflows.length} time-based workflow(s)`);

      // Get time-scheduled evaluator
      const timeEvaluator = this.triggerRegistry.get('time_scheduled');
      
      if (!timeEvaluator) {
        throw new Error('TimeScheduledEvaluator not found in registry');
      }

      // Schedule each workflow
      for (const workflow of workflows) {
        try {
          const triggerConfig = workflow.trigger_config || {};

          // Create callback for this workflow
          const callback = async () => {
            logger.info(`Cron trigger fired for workflow: ${workflow.name}`);
            
            // Create scheduled event data
            const eventData = {
              type: 'scheduled',
              workflowId: workflow.id,
              workflowName: workflow.name,
              timestamp: new Date().toISOString()
            };

            // Execute the workflow
            try {
              await this._executeWorkflow(workflow, eventData, 'time_scheduled');
            } catch (error) {
              // Requirement 4.7: Failures don't crash system
              logger.error(`Error executing scheduled workflow ${workflow.name}:`, error);
              await this._logExecution(workflow.id, eventData, 'failure', error.message);
            }
          };

          // Schedule the workflow
          const task = timeEvaluator.scheduleWorkflow(workflow.id, triggerConfig, callback);
          this.scheduledWorkflows.set(workflow.id, task);

          logger.info(`Scheduled workflow ${workflow.name} with cron: ${triggerConfig.cronExpression}`);
        } catch (error) {
          logger.error(`Error scheduling workflow ${workflow.name}:`, error);
          // Continue scheduling other workflows
        }
      }

      logger.info(`Successfully scheduled ${this.scheduledWorkflows.size} workflow(s)`);
    } catch (error) {
      logger.error('Error scheduling workflows:', error);
      throw error;
    }
  }

  /**
   * Unschedule a specific workflow
   * @param {string} workflowId - Workflow rule ID
   */
  unscheduleWorkflow(workflowId) {
    const timeEvaluator = this.triggerRegistry.get('time_scheduled');
    
    if (timeEvaluator) {
      timeEvaluator.unscheduleWorkflow(workflowId);
      this.scheduledWorkflows.delete(workflowId);
      logger.info(`Unscheduled workflow ${workflowId}`);
    }
  }

  /**
   * Unschedule all workflows
   * @private
   */
  _unscheduleAllWorkflows() {
    for (const workflowId of this.scheduledWorkflows.keys()) {
      this.unscheduleWorkflow(workflowId);
    }
  }

  /**
   * Reload workflows (useful when workflows are added/updated/deleted)
   * @returns {Promise<void>}
   */
  async reloadWorkflows() {
    logger.info('Reloading workflows...');
    await this.scheduleWorkflows();
  }

  /**
   * Get all scheduled workflows
   * @returns {Map} Map of workflow IDs to scheduled tasks
   */
  getScheduledWorkflows() {
    return this.scheduledWorkflows;
  }

  /**
   * Check if engine is initialized
   * @returns {boolean}
   */
  isEngineInitialized() {
    return this.isInitialized;
  }

  /**
   * Shutdown the engine gracefully
   * Unschedules all workflows
   */
  shutdown() {
    logger.info('Shutting down WorkflowEngine...');
    this._unscheduleAllWorkflows();
    this.isInitialized = false;
    logger.info('WorkflowEngine shut down successfully');
  }
}

// Export singleton instance
const workflowEngine = new WorkflowEngine();

export default workflowEngine;
export { WorkflowEngine };
