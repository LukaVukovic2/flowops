/**
 * Workflow Dependency Graph and Circular Dependency Detection
 * 
 * This module provides functionality to detect circular dependencies in workflow rules.
 * Circular dependencies occur when workflow A can trigger workflow B, and workflow B
 * can trigger workflow A (either directly or through a chain of workflows).
 * 
 * Requirements:
 * - 4.8: Prevent creation of workflow rules with circular dependencies
 */

import logger from '../utils/logger.js';

/**
 * Build a dependency graph from workflow rules
 * 
 * The graph maps each workflow ID to an array of workflow IDs it can trigger.
 * A workflow A can trigger workflow B if:
 * - A has an action that updates ticket status to X
 * - B has a trigger for ticket_status_changed with fromStatus or toStatus matching X
 * 
 * @param {Array} workflows - Array of workflow rule objects
 * @returns {Object} Dependency graph where keys are workflow IDs and values are arrays of dependent workflow IDs
 */
export function buildDependencyGraph(workflows) {
  const graph = {};
  
  // Initialize graph with all workflow IDs
  workflows.forEach(workflow => {
    graph[workflow.id] = [];
  });
  
  // Build dependencies
  workflows.forEach(sourceWorkflow => {
    const actions = sourceWorkflow.actions || [];
    
    actions.forEach(action => {
      // Check if action can trigger other workflows
      if (action.type === 'update_ticket_status') {
        const newStatus = action.config?.newStatus;
        
        if (newStatus) {
          // Find workflows that would be triggered by this status change
          const dependentWorkflows = workflows.filter(targetWorkflow => {
            // Skip self
            if (targetWorkflow.id === sourceWorkflow.id) {
              return false;
            }
            
            // Check if target workflow is triggered by ticket status changes
            if (targetWorkflow.trigger_type !== 'ticket_status_changed') {
              return false;
            }
            
            const triggerConfig = targetWorkflow.trigger_config || {};
            
            // Check if the status change matches the trigger conditions
            // For static analysis, a workflow CAN be triggered if:
            // - toStatus matches the new status (fromStatus is a runtime filter, not a static constraint)
            // This is conservative: we assume the workflow COULD trigger even if fromStatus
            // would filter it at runtime, because we don't know the source status statically
            const matchesToStatus = triggerConfig.toStatus === newStatus;
            
            return matchesToStatus;
          });
          
          // Add dependencies to graph
          dependentWorkflows.forEach(depWorkflow => {
            if (!graph[sourceWorkflow.id].includes(depWorkflow.id)) {
              graph[sourceWorkflow.id].push(depWorkflow.id);
            }
          });
        }
      }
      
      // Check for create_announcement action triggering other workflows
      // (Future extension point if announcement-triggered workflows are added)
      
      // Check for assign_technician action
      // (Currently doesn't trigger other workflows, but could in future)
    });
  });
  
  return graph;
}

/**
 * Detect circular dependencies in a set of workflow rules
 * 
 * Uses depth-first search (DFS) with recursion stack to detect cycles.
 * A cycle exists if during DFS traversal, we encounter a node that's
 * already in the current recursion stack.
 * 
 * @param {Array} workflows - Array of workflow rule objects
 * @returns {Object} Object with hasCycle (boolean) and cycle (array of workflow IDs if found)
 */
export function detectCircularDependencies(workflows) {
  const graph = buildDependencyGraph(workflows);
  const visited = new Set();
  const recursionStack = new Set();
  const path = []; // Track path for reporting
  
  /**
   * DFS helper function to detect cycles
   * @param {string} workflowId - Current workflow ID
   * @returns {Array|null} Array of workflow IDs forming cycle, or null if no cycle
   */
  function hasCycle(workflowId) {
    visited.add(workflowId);
    recursionStack.add(workflowId);
    path.push(workflowId);
    
    const dependencies = graph[workflowId] || [];
    
    for (const depId of dependencies) {
      if (!visited.has(depId)) {
        // Visit unvisited neighbor
        const cycle = hasCycle(depId);
        if (cycle) {
          return cycle;
        }
      } else if (recursionStack.has(depId)) {
        // Cycle detected! Build the cycle path
        const cycleStartIndex = path.indexOf(depId);
        const cyclePath = path.slice(cycleStartIndex);
        cyclePath.push(depId); // Close the cycle
        return cyclePath;
      }
    }
    
    // Backtrack
    recursionStack.delete(workflowId);
    path.pop();
    return null;
  }
  
  // Check all workflows (handles disconnected components)
  for (const workflowId in graph) {
    if (!visited.has(workflowId)) {
      const cycle = hasCycle(workflowId);
      if (cycle) {
        logger.warn('Circular dependency detected:', cycle);
        return {
          hasCycle: true,
          cycle: cycle,
          message: `Circular dependency detected: ${cycle.join(' -> ')}`
        };
      }
    }
  }
  
  return {
    hasCycle: false,
    cycle: null,
    message: 'No circular dependencies detected'
  };
}

/**
 * Validate that adding/updating a workflow won't create circular dependencies
 * 
 * This function simulates adding the new workflow to the existing workflows
 * and checks if it would create a circular dependency.
 * 
 * @param {Object} newWorkflow - The workflow to validate (with id, trigger_type, trigger_config, actions)
 * @param {Array} existingWorkflows - Array of existing workflow rules
 * @returns {Object} Validation result with isValid (boolean) and message (string)
 */
export function validateWorkflowDependencies(newWorkflow, existingWorkflows) {
  // Create a copy of existing workflows without the workflow being updated (if it exists)
  const workflowsToCheck = existingWorkflows.filter(w => w.id !== newWorkflow.id);
  
  // Add the new/updated workflow
  workflowsToCheck.push(newWorkflow);
  
  // Detect circular dependencies
  const result = detectCircularDependencies(workflowsToCheck);
  
  if (result.hasCycle) {
    return {
      isValid: false,
      hasCycle: true,
      cycle: result.cycle,
      message: result.message
    };
  }
  
  return {
    isValid: true,
    hasCycle: false,
    cycle: null,
    message: 'No circular dependencies detected'
  };
}

/**
 * Get all workflows that would be affected by a given workflow
 * (i.e., all workflows that this workflow can trigger, directly or indirectly)
 * 
 * @param {string} workflowId - The workflow ID to analyze
 * @param {Array} workflows - Array of workflow rules
 * @returns {Array} Array of workflow IDs that would be affected
 */
export function getAffectedWorkflows(workflowId, workflows) {
  const graph = buildDependencyGraph(workflows);
  const affected = new Set();
  const visited = new Set();
  
  function dfs(currentId) {
    if (visited.has(currentId)) {
      return;
    }
    
    visited.add(currentId);
    const dependencies = graph[currentId] || [];
    
    dependencies.forEach(depId => {
      affected.add(depId);
      dfs(depId);
    });
  }
  
  dfs(workflowId);
  return Array.from(affected);
}

/**
 * Get dependency information for a workflow
 * Returns what this workflow can trigger and what can trigger this workflow
 * 
 * @param {string} workflowId - The workflow ID to analyze
 * @param {Array} workflows - Array of workflow rules
 * @returns {Object} Object with canTrigger and triggeredBy arrays
 */
export function getWorkflowDependencyInfo(workflowId, workflows) {
  const graph = buildDependencyGraph(workflows);
  
  // What this workflow can trigger
  const canTrigger = graph[workflowId] || [];
  
  // What can trigger this workflow
  const triggeredBy = [];
  for (const [sourceId, targets] of Object.entries(graph)) {
    if (targets.includes(workflowId)) {
      triggeredBy.push(sourceId);
    }
  }
  
  return {
    workflowId,
    canTrigger,
    triggeredBy
  };
}

export default {
  buildDependencyGraph,
  detectCircularDependencies,
  validateWorkflowDependencies,
  getAffectedWorkflows,
  getWorkflowDependencyInfo
};
