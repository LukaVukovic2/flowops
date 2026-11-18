/**
 * Circular Dependency Detection Tests
 * 
 * Tests for workflow dependency graph building and circular dependency detection.
 * 
 * Requirements tested:
 * - 4.8: Prevent creation of workflow rules with circular dependencies
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDependencyGraph,
  detectCircularDependencies,
  validateWorkflowDependencies,
  getAffectedWorkflows,
  getWorkflowDependencyInfo
} from './dependencyGraph.js';

describe('Workflow Dependency Graph', () => {
  describe('buildDependencyGraph', () => {
    it('should build empty graph for workflows without dependencies', () => {
      const workflows = [
        {
          id: 'wf1',
          trigger_type: 'ticket_created',
          actions: [
            { type: 'send_notification', config: { recipientRole: 'Administrator' } }
          ]
        },
        {
          id: 'wf2',
          trigger_type: 'time_scheduled',
          actions: [
            { type: 'send_notification', config: { recipientRole: 'Tehničar' } }
          ]
        }
      ];

      const graph = buildDependencyGraph(workflows);

      assert.deepStrictEqual(graph, {
        wf1: [],
        wf2: []
      });
    });

    it('should detect direct dependency when one workflow triggers another', () => {
      const workflows = [
        {
          id: 'wf1',
          trigger_type: 'ticket_created',
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'U radu' } }
          ]
        },
        {
          id: 'wf2',
          trigger_type: 'ticket_status_changed',
          trigger_config: { toStatus: 'U radu' },
          actions: [
            { type: 'send_notification', config: { recipientRole: 'Tehničar' } }
          ]
        }
      ];

      const graph = buildDependencyGraph(workflows);

      assert.ok(graph.wf1.includes('wf2'));
      assert.deepStrictEqual(graph.wf2, []);
    });

    it('should detect multiple dependencies from one workflow', () => {
      const workflows = [
        {
          id: 'wf1',
          trigger_type: 'ticket_created',
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'U radu' } }
          ]
        },
        {
          id: 'wf2',
          trigger_type: 'ticket_status_changed',
          trigger_config: { toStatus: 'U radu' },
          actions: []
        },
        {
          id: 'wf3',
          trigger_type: 'ticket_status_changed',
          trigger_config: { toStatus: 'U radu' },
          actions: []
        }
      ];

      const graph = buildDependencyGraph(workflows);

      assert.ok(graph.wf1.includes('wf2'));
      assert.ok(graph.wf1.includes('wf3'));
      assert.strictEqual(graph.wf1.length, 2);
    });

    it('should not create self-dependencies', () => {
      const workflows = [
        {
          id: 'wf1',
          trigger_type: 'ticket_status_changed',
          trigger_config: { toStatus: 'U radu' },
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'U radu' } }
          ]
        }
      ];

      const graph = buildDependencyGraph(workflows);

      assert.deepStrictEqual(graph.wf1, []);
    });

    it('should handle workflows with fromStatus filter correctly', () => {
      const workflows = [
        {
          id: 'wf1',
          trigger_type: 'ticket_created',
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'U radu' } }
          ]
        },
        {
          id: 'wf2',
          trigger_type: 'ticket_status_changed',
          trigger_config: { fromStatus: 'Nova', toStatus: 'U radu' },
          actions: []
        }
      ];

      const graph = buildDependencyGraph(workflows);

      // wf2 should be triggered because it expects transition TO 'U radu'
      assert.ok(graph.wf1.includes('wf2'));
    });

    it('should handle workflows without actions gracefully', () => {
      const workflows = [
        {
          id: 'wf1',
          trigger_type: 'ticket_created',
          actions: []
        }
      ];

      const graph = buildDependencyGraph(workflows);

      assert.deepStrictEqual(graph.wf1, []);
    });

    it('should handle workflows with missing action config', () => {
      const workflows = [
        {
          id: 'wf1',
          trigger_type: 'ticket_created',
          actions: [
            { type: 'update_ticket_status' } // Missing config
          ]
        }
      ];

      const graph = buildDependencyGraph(workflows);

      assert.deepStrictEqual(graph.wf1, []);
    });
  });

  describe('detectCircularDependencies', () => {
    it('should return false for workflows without circular dependencies', () => {
      const workflows = [
        {
          id: 'wf1',
          trigger_type: 'ticket_created',
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'U radu' } }
          ]
        },
        {
          id: 'wf2',
          trigger_type: 'ticket_status_changed',
          trigger_config: { toStatus: 'U radu' },
          actions: [
            { type: 'send_notification', config: { recipientRole: 'Tehničar' } }
          ]
        }
      ];

      const result = detectCircularDependencies(workflows);

      assert.strictEqual(result.hasCycle, false);
      assert.strictEqual(result.cycle, null);
    });

    it('should detect direct circular dependency (A -> B -> A)', () => {
      const workflows = [
        {
          id: 'wf1',
          trigger_type: 'ticket_status_changed',
          trigger_config: { toStatus: 'U radu' },
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'Riješena' } }
          ]
        },
        {
          id: 'wf2',
          trigger_type: 'ticket_status_changed',
          trigger_config: { toStatus: 'Riješena' },
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'U radu' } }
          ]
        }
      ];

      const result = detectCircularDependencies(workflows);

      assert.strictEqual(result.hasCycle, true);
      assert.ok(result.cycle);
      assert.ok(result.cycle.length > 2); // Should include the cycle path
    });

    it('should detect indirect circular dependency (A -> B -> C -> A)', () => {
      const workflows = [
        {
          id: 'wf1',
          trigger_type: 'ticket_status_changed',
          trigger_config: { toStatus: 'Nova' },
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'U radu' } }
          ]
        },
        {
          id: 'wf2',
          trigger_type: 'ticket_status_changed',
          trigger_config: { toStatus: 'U radu' },
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'Riješena' } }
          ]
        },
        {
          id: 'wf3',
          trigger_type: 'ticket_status_changed',
          trigger_config: { toStatus: 'Riješena' },
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'Nova' } }
          ]
        }
      ];

      const result = detectCircularDependencies(workflows);

      assert.strictEqual(result.hasCycle, true);
      assert.ok(result.cycle);
      assert.ok(result.cycle.length > 3);
    });

    it('should detect self-loop through intermediate workflow', () => {
      const workflows = [
        {
          id: 'wf1',
          trigger_type: 'ticket_created',
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'U radu' } }
          ]
        },
        {
          id: 'wf2',
          trigger_type: 'ticket_status_changed',
          trigger_config: { toStatus: 'U radu' },
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'Riješena' } }
          ]
        },
        {
          id: 'wf3',
          trigger_type: 'ticket_status_changed',
          trigger_config: { toStatus: 'Riješena' },
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'U radu' } }
          ]
        }
      ];

      const result = detectCircularDependencies(workflows);

      // wf2 and wf3 form a cycle
      assert.strictEqual(result.hasCycle, true);
      assert.ok(result.cycle.includes('wf2'));
      assert.ok(result.cycle.includes('wf3'));
    });

    it('should handle disconnected workflow groups', () => {
      const workflows = [
        // Group 1: wf1 -> wf2
        {
          id: 'wf1',
          trigger_type: 'ticket_created',
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'U radu' } }
          ]
        },
        {
          id: 'wf2',
          trigger_type: 'ticket_status_changed',
          trigger_config: { toStatus: 'U radu' },
          actions: []
        },
        // Group 2: wf3 -> wf4
        {
          id: 'wf3',
          trigger_type: 'time_scheduled',
          trigger_config: { cronExpression: '0 9 * * *' },
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'Zatvorena' } }
          ]
        },
        {
          id: 'wf4',
          trigger_type: 'ticket_status_changed',
          trigger_config: { toStatus: 'Zatvorena' },
          actions: []
        }
      ];

      const result = detectCircularDependencies(workflows);

      assert.strictEqual(result.hasCycle, false);
    });

    it('should return empty cycle array when no cycles exist', () => {
      const workflows = [
        {
          id: 'wf1',
          trigger_type: 'ticket_created',
          actions: []
        }
      ];

      const result = detectCircularDependencies(workflows);

      assert.strictEqual(result.hasCycle, false);
      assert.strictEqual(result.cycle, null);
      assert.ok(result.message.includes('No circular dependencies'));
    });
  });

  describe('validateWorkflowDependencies', () => {
    it('should validate a new workflow that does not create circular dependencies', () => {
      const existingWorkflows = [
        {
          id: 'wf1',
          trigger_type: 'ticket_created',
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'U radu' } }
          ]
        }
      ];

      const newWorkflow = {
        id: 'wf2',
        trigger_type: 'ticket_status_changed',
        trigger_config: { toStatus: 'U radu' },
        actions: [
          { type: 'send_notification', config: { recipientRole: 'Tehničar' } }
        ]
      };

      const result = validateWorkflowDependencies(newWorkflow, existingWorkflows);

      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.hasCycle, false);
    });

    it('should reject a new workflow that creates circular dependencies', () => {
      const existingWorkflows = [
        {
          id: 'wf1',
          trigger_type: 'ticket_status_changed',
          trigger_config: { toStatus: 'U radu' },
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'Riješena' } }
          ]
        }
      ];

      const newWorkflow = {
        id: 'wf2',
        trigger_type: 'ticket_status_changed',
        trigger_config: { toStatus: 'Riješena' },
        actions: [
          { type: 'update_ticket_status', config: { newStatus: 'U radu' } }
        ]
      };

      const result = validateWorkflowDependencies(newWorkflow, existingWorkflows);

      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.hasCycle, true);
      assert.ok(result.cycle);
    });

    it('should handle updating an existing workflow without creating cycles', () => {
      const existingWorkflows = [
        {
          id: 'wf1',
          trigger_type: 'ticket_created',
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'U radu' } }
          ]
        },
        {
          id: 'wf2',
          trigger_type: 'ticket_status_changed',
          trigger_config: { toStatus: 'U radu' },
          actions: [
            { type: 'send_notification', config: { recipientRole: 'Tehničar' } }
          ]
        }
      ];

      // Update wf2 to add an action (but no cycle)
      const updatedWorkflow = {
        id: 'wf2',
        trigger_type: 'ticket_status_changed',
        trigger_config: { toStatus: 'U radu' },
        actions: [
          { type: 'send_notification', config: { recipientRole: 'Tehničar' } },
          { type: 'update_ticket_status', config: { newStatus: 'Na čekanju' } }
        ]
      };

      const result = validateWorkflowDependencies(updatedWorkflow, existingWorkflows);

      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.hasCycle, false);
    });

    it('should reject updating an existing workflow if it creates a cycle', () => {
      const existingWorkflows = [
        {
          id: 'wf1',
          trigger_type: 'ticket_status_changed',
          trigger_config: { toStatus: 'U radu' },
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'Riješena' } }
          ]
        },
        {
          id: 'wf2',
          trigger_type: 'ticket_status_changed',
          trigger_config: { toStatus: 'Riješena' },
          actions: [
            { type: 'send_notification', config: { recipientRole: 'Administrator' } }
          ]
        }
      ];

      // Update wf2 to create a cycle back to wf1
      const updatedWorkflow = {
        id: 'wf2',
        trigger_type: 'ticket_status_changed',
        trigger_config: { toStatus: 'Riješena' },
        actions: [
          { type: 'update_ticket_status', config: { newStatus: 'U radu' } } // Creates cycle!
        ]
      };

      const result = validateWorkflowDependencies(updatedWorkflow, existingWorkflows);

      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.hasCycle, true);
    });
  });

  describe('getAffectedWorkflows', () => {
    it('should return empty array for workflow with no dependencies', () => {
      const workflows = [
        {
          id: 'wf1',
          trigger_type: 'ticket_created',
          actions: [
            { type: 'send_notification', config: { recipientRole: 'Administrator' } }
          ]
        }
      ];

      const affected = getAffectedWorkflows('wf1', workflows);

      assert.deepStrictEqual(affected, []);
    });

    it('should return direct dependencies', () => {
      const workflows = [
        {
          id: 'wf1',
          trigger_type: 'ticket_created',
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'U radu' } }
          ]
        },
        {
          id: 'wf2',
          trigger_type: 'ticket_status_changed',
          trigger_config: { toStatus: 'U radu' },
          actions: []
        }
      ];

      const affected = getAffectedWorkflows('wf1', workflows);

      assert.ok(affected.includes('wf2'));
      assert.strictEqual(affected.length, 1);
    });

    it('should return transitive dependencies (A -> B -> C)', () => {
      const workflows = [
        {
          id: 'wf1',
          trigger_type: 'ticket_created',
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'U radu' } }
          ]
        },
        {
          id: 'wf2',
          trigger_type: 'ticket_status_changed',
          trigger_config: { toStatus: 'U radu' },
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'Riješena' } }
          ]
        },
        {
          id: 'wf3',
          trigger_type: 'ticket_status_changed',
          trigger_config: { toStatus: 'Riješena' },
          actions: []
        }
      ];

      const affected = getAffectedWorkflows('wf1', workflows);

      assert.ok(affected.includes('wf2'));
      assert.ok(affected.includes('wf3'));
      assert.strictEqual(affected.length, 2);
    });
  });

  describe('getWorkflowDependencyInfo', () => {
    it('should return dependency information for a workflow', () => {
      const workflows = [
        {
          id: 'wf1',
          trigger_type: 'ticket_created',
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'U radu' } }
          ]
        },
        {
          id: 'wf2',
          trigger_type: 'ticket_status_changed',
          trigger_config: { toStatus: 'U radu' },
          actions: [
            { type: 'update_ticket_status', config: { newStatus: 'Riješena' } }
          ]
        },
        {
          id: 'wf3',
          trigger_type: 'ticket_status_changed',
          trigger_config: { toStatus: 'Riješena' },
          actions: []
        }
      ];

      const info = getWorkflowDependencyInfo('wf2', workflows);

      assert.strictEqual(info.workflowId, 'wf2');
      assert.ok(info.canTrigger.includes('wf3'));
      assert.ok(info.triggeredBy.includes('wf1'));
    });

    it('should handle workflow with no dependencies', () => {
      const workflows = [
        {
          id: 'wf1',
          trigger_type: 'time_scheduled',
          trigger_config: { cronExpression: '0 9 * * *' },
          actions: []
        }
      ];

      const info = getWorkflowDependencyInfo('wf1', workflows);

      assert.strictEqual(info.workflowId, 'wf1');
      assert.deepStrictEqual(info.canTrigger, []);
      assert.deepStrictEqual(info.triggeredBy, []);
    });
  });
});
