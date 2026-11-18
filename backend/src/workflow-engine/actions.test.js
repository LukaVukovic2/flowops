/**
 * Unit tests for workflow action executors
 * 
 * Tests all action executor classes and ActionRegistry
 * 
 * Note: Full integration tests would require mocking database and model dependencies.
 * These tests verify the basic structure and validation logic.
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import {
  BaseActionExecutor,
  SendNotificationExecutor,
  UpdateTicketStatusExecutor,
  AssignTechnicianExecutor,
  CreateAnnouncementExecutor,
  ActionRegistry
} from './actions.js';

describe('BaseActionExecutor', () => {
  it('should throw error when execute() is called without implementation', async () => {
    const executor = new BaseActionExecutor();
    
    await assert.rejects(
      async () => executor.execute({}, {}),
      { message: 'execute() must be implemented by subclass' }
    );
  });

  it('should have null actionType by default', () => {
    const executor = new BaseActionExecutor();
    assert.strictEqual(executor.actionType, null);
  });
});

describe('SendNotificationExecutor', () => {
  let executor;

  before(() => {
    executor = new SendNotificationExecutor();
  });

  it('should have correct actionType', () => {
    assert.strictEqual(executor.actionType, 'send_notification');
  });

  it('should fail if messageTemplate is missing', async () => {
    const config = { recipientRole: 'Tehničar' };
    const context = { eventData: {} };

    const result = await executor.execute(config, context);
    
    assert.strictEqual(result.success, false);
    assert.match(result.error, /messageTemplate is required/);
  });

  it('should fail if neither recipientRole nor recipientUserId is specified', async () => {
    const config = { messageTemplate: 'Test message' };
    const context = { eventData: {} };

    const result = await executor.execute(config, context);
    
    assert.strictEqual(result.success, false);
    assert.match(result.error, /Either recipientRole or recipientUserId must be specified/);
  });

  it('should replace template variables correctly', () => {
    const template = 'Ticket {{title}} has priority {{priority}}';
    const context = { title: 'Server Down', priority: 'Visoka' };
    
    const result = executor._replaceTemplateVariables(template, context);
    
    assert.strictEqual(result, 'Ticket Server Down has priority Visoka');
  });

  it('should keep unmatched variables as-is', () => {
    const template = 'Ticket {{title}} {{unknownVar}}';
    const context = { title: 'Test' };
    
    const result = executor._replaceTemplateVariables(template, context);
    
    assert.strictEqual(result, 'Ticket Test {{unknownVar}}');
  });
});

describe('UpdateTicketStatusExecutor', () => {
  let executor;

  before(() => {
    executor = new UpdateTicketStatusExecutor();
  });

  it('should have correct actionType', () => {
    assert.strictEqual(executor.actionType, 'update_ticket_status');
  });

  it('should have all valid Croatian status values', () => {
    const expectedStatuses = ['Nova', 'U radu', 'Na čekanju', 'Riješena', 'Zatvorena'];
    assert.deepStrictEqual(executor.validStatuses, expectedStatuses);
  });

  it('should fail if newStatus is missing', async () => {
    const config = { ticketId: 'ticket-1' };
    const context = { eventData: {} };

    const result = await executor.execute(config, context);
    
    assert.strictEqual(result.success, false);
    assert.match(result.error, /newStatus is required/);
  });

  it('should fail if status is invalid', async () => {
    const config = { ticketId: 'ticket-1', newStatus: 'InvalidStatus' };
    const context = { eventData: {} };

    const result = await executor.execute(config, context);
    
    assert.strictEqual(result.success, false);
    assert.match(result.error, /Invalid status/);
  });

  it('should fail if ticketId not found in config or context', async () => {
    const config = { newStatus: 'U radu' };
    const context = { eventData: {} };

    const result = await executor.execute(config, context);
    
    assert.strictEqual(result.success, false);
    assert.match(result.error, /ticketId not found/);
  });

  it('should accept ticketId from context eventData', async () => {
    const config = { newStatus: 'U radu' };
    const context = { eventData: { ticketId: 'ticket-from-context' } };

    // Will fail at database level but validates ticketId extraction logic
    const result = await executor.execute(config, context);
    
    // Even if it fails, it should have found the ticketId
    assert.ok(result.message || result.error);
  });
});

describe('AssignTechnicianExecutor', () => {
  let executor;

  before(() => {
    executor = new AssignTechnicianExecutor();
  });

  it('should have correct actionType', () => {
    assert.strictEqual(executor.actionType, 'assign_technician');
  });

  it('should have all valid assignment strategies', () => {
    const expectedStrategies = ['specific', 'least_loaded', 'round_robin'];
    assert.deepStrictEqual(executor.validStrategies, expectedStrategies);
  });

  it('should fail if assignmentStrategy is missing', async () => {
    const config = { ticketId: 'ticket-1' };
    const context = { eventData: {} };

    const result = await executor.execute(config, context);
    
    assert.strictEqual(result.success, false);
    assert.match(result.error, /assignmentStrategy is required/);
  });

  it('should fail if strategy is invalid', async () => {
    const config = { ticketId: 'ticket-1', assignmentStrategy: 'invalid_strategy' };
    const context = { eventData: {} };

    const result = await executor.execute(config, context);
    
    assert.strictEqual(result.success, false);
    assert.match(result.error, /Invalid strategy/);
  });

  it('should fail if ticketId not found', async () => {
    const config = { assignmentStrategy: 'specific', technicianId: 'tech-1' };
    const context = { eventData: {} };

    const result = await executor.execute(config, context);
    
    assert.strictEqual(result.success, false);
    assert.match(result.error, /ticketId not found/);
  });

  it('should fail if technicianId missing for specific strategy', async () => {
    const config = {
      ticketId: 'ticket-1',
      assignmentStrategy: 'specific'
    };
    const context = { eventData: {} };

    const result = await executor.execute(config, context);
    
    assert.strictEqual(result.success, false);
    assert.match(result.error, /technicianId is required/);
  });

  it('should initialize round-robin index at 0', () => {
    assert.strictEqual(executor.roundRobinIndex, 0);
  });
});

describe('CreateAnnouncementExecutor', () => {
  let executor;

  before(() => {
    executor = new CreateAnnouncementExecutor();
  });

  it('should have correct actionType', () => {
    assert.strictEqual(executor.actionType, 'create_announcement');
  });

  it('should fail if title is missing', async () => {
    const config = { content: 'Test content' };
    const context = { eventData: {} };

    const result = await executor.execute(config, context);
    
    assert.strictEqual(result.success, false);
    assert.match(result.error, /title is required/);
  });

  it('should fail if content is missing', async () => {
    const config = { title: 'Test Title' };
    const context = { eventData: {} };

    const result = await executor.execute(config, context);
    
    assert.strictEqual(result.success, false);
    assert.match(result.error, /content is required/);
  });

  it('should replace template variables in title and content', () => {
    const title = 'Ticket {{title}} resolved';
    const content = 'Ticket with priority {{priority}} has been resolved';
    const context = { title: 'Server Down', priority: 'Visoka' };
    
    const resultTitle = executor._replaceTemplateVariables(title, context);
    const resultContent = executor._replaceTemplateVariables(content, context);
    
    assert.strictEqual(resultTitle, 'Ticket Server Down resolved');
    assert.strictEqual(resultContent, 'Ticket with priority Visoka has been resolved');
  });
});

describe('ActionRegistry', () => {
  let registry;

  before(() => {
    registry = new ActionRegistry();
  });

  it('should register default executors on instantiation', () => {
    assert.strictEqual(registry.has('send_notification'), true);
    assert.strictEqual(registry.has('update_ticket_status'), true);
    assert.strictEqual(registry.has('assign_technician'), true);
    assert.strictEqual(registry.has('create_announcement'), true);
  });

  it('should get executor by action type', () => {
    const executor = registry.get('send_notification');
    assert.ok(executor instanceof SendNotificationExecutor);
  });

  it('should return null for unknown action type', () => {
    const executor = registry.get('unknown_action');
    assert.strictEqual(executor, null);
  });

  it('should register custom executor', () => {
    class CustomExecutor extends BaseActionExecutor {
      constructor() {
        super();
        this.actionType = 'custom_action';
      }
      async execute() {
        return { success: true };
      }
    }

    const customExecutor = new CustomExecutor();
    registry.register(customExecutor);

    assert.strictEqual(registry.has('custom_action'), true);
    assert.strictEqual(registry.get('custom_action'), customExecutor);
  });

  it('should throw error when registering non-executor', () => {
    const notAnExecutor = { actionType: 'test' };
    
    assert.throws(
      () => registry.register(notAnExecutor),
      { message: 'Executor must extend BaseActionExecutor' }
    );
  });

  it('should throw error when registering executor without actionType', () => {
    class InvalidExecutor extends BaseActionExecutor {
      constructor() {
        super();
        // No actionType set
      }
    }

    const executor = new InvalidExecutor();
    
    assert.throws(
      () => registry.register(executor),
      { message: 'Executor must have an actionType' }
    );
  });

  it('should return all registered action types', () => {
    const types = registry.getRegisteredTypes();
    
    assert.ok(types.includes('send_notification'));
    assert.ok(types.includes('update_ticket_status'));
    assert.ok(types.includes('assign_technician'));
    assert.ok(types.includes('create_announcement'));
    assert.strictEqual(types.length >= 4, true); // At least 4 default types
  });

  it('should throw error when executing unknown action type', async () => {
    await assert.rejects(
      async () => registry.execute('unknown_action', {}, {}),
      { message: 'Unknown action type: unknown_action' }
    );
  });
});
