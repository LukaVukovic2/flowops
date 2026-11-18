/**
 * Tests for WorkflowEngine
 * 
 * Tests the main workflow orchestration engine including:
 * - Initialization
 * - Basic structure
 * - Public API methods
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { WorkflowEngine } from './engine.js';

describe('WorkflowEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new WorkflowEngine();
  });

  afterEach(() => {
    if (engine.isEngineInitialized()) {
      engine.shutdown();
    }
  });

  describe('constructor', () => {
    it('should create engine with registries', () => {
      assert.ok(engine);
      assert.ok(engine.triggerRegistry);
      assert.ok(engine.actionRegistry);
      assert.strictEqual(engine.isEngineInitialized(), false);
    });

    it('should have empty scheduled workflows map', () => {
      const scheduled = engine.getScheduledWorkflows();
      assert.ok(scheduled instanceof Map);
      assert.strictEqual(scheduled.size, 0);
    });
  });

  describe('isEngineInitialized', () => {
    it('should return false for new engine', () => {
      assert.strictEqual(engine.isEngineInitialized(), false);
    });
  });

  describe('getScheduledWorkflows', () => {
    it('should return Map of scheduled workflows', () => {
      const scheduled = engine.getScheduledWorkflows();
      assert.ok(scheduled instanceof Map);
    });
  });

  describe('unscheduleWorkflow', () => {
    it('should handle unscheduling non-existent workflow', () => {
      // Should not throw
      assert.doesNotThrow(() => {
        engine.unscheduleWorkflow('non-existent-id');
      });
    });
  });

  describe('shutdown', () => {
    it('should shutdown engine successfully', () => {
      engine.shutdown();
      assert.strictEqual(engine.isEngineInitialized(), false);
    });

    it('should unschedule all workflows on shutdown', () => {
      engine.shutdown();
      const scheduled = engine.getScheduledWorkflows();
      assert.strictEqual(scheduled.size, 0);
    });
  });

  describe('processEvent', () => {
    it('should be a function', () => {
      assert.strictEqual(typeof engine.processEvent, 'function');
    });
  });

  describe('scheduleWorkflows', () => {
    it('should be a function', () => {
      assert.strictEqual(typeof engine.scheduleWorkflows, 'function');
    });
  });

  describe('reloadWorkflows', () => {
    it('should be a function', () => {
      assert.strictEqual(typeof engine.reloadWorkflows, 'function');
    });
  });

  describe('initialize', () => {
    it('should be a function', () => {
      assert.strictEqual(typeof engine.initialize, 'function');
    });
  });
});

describe('WorkflowEngine singleton export', () => {
  it('should export default singleton instance', async () => {
    const { default: workflowEngine } = await import('./engine.js');
    assert.ok(workflowEngine);
    assert.ok(workflowEngine instanceof WorkflowEngine);
  });
});
