/**
 * Unit tests for workflow trigger evaluators
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import {
  TicketCreatedEvaluator,
  TicketStatusChangedEvaluator,
  TimeScheduledEvaluator,
  ExternalStatusChangedEvaluator,
  TriggerRegistry
} from './triggers.js';

describe('TicketCreatedEvaluator', () => {
  let evaluator;

  before(() => {
    evaluator = new TicketCreatedEvaluator();
  });

  it('should have correct trigger type', () => {
    assert.strictEqual(evaluator.triggerType, 'ticket_created');
  });

  it('should trigger for all tickets when no config specified', async () => {
    const eventData = {
      id: 'ticket-1',
      priority: 'Visoka',
      status: 'Nova'
    };

    const result = await evaluator.evaluate({}, eventData);
    assert.strictEqual(result, true);
  });

  it('should trigger for all tickets when empty config specified', async () => {
    const eventData = {
      id: 'ticket-1',
      priority: 'Visoka',
      status: 'Nova'
    };

    const result = await evaluator.evaluate(null, eventData);
    assert.strictEqual(result, true);
  });

  it('should filter by priority correctly', async () => {
    const config = { priority: 'Visoka' };
    
    // Matching priority
    let result = await evaluator.evaluate(config, {
      priority: 'Visoka',
      status: 'Nova'
    });
    assert.strictEqual(result, true);

    // Non-matching priority
    result = await evaluator.evaluate(config, {
      priority: 'Niska',
      status: 'Nova'
    });
    assert.strictEqual(result, false);
  });

  it('should filter by status correctly', async () => {
    const config = { status: 'Nova' };
    
    // Matching status
    let result = await evaluator.evaluate(config, {
      priority: 'Visoka',
      status: 'Nova'
    });
    assert.strictEqual(result, true);

    // Non-matching status
    result = await evaluator.evaluate(config, {
      priority: 'Visoka',
      status: 'U radu'
    });
    assert.strictEqual(result, false);
  });

  it('should filter by both priority and status', async () => {
    const config = {
      priority: 'Visoka',
      status: 'Nova'
    };
    
    // Both match
    let result = await evaluator.evaluate(config, {
      priority: 'Visoka',
      status: 'Nova'
    });
    assert.strictEqual(result, true);

    // Priority matches, status doesn't
    result = await evaluator.evaluate(config, {
      priority: 'Visoka',
      status: 'U radu'
    });
    assert.strictEqual(result, false);

    // Status matches, priority doesn't
    result = await evaluator.evaluate(config, {
      priority: 'Niska',
      status: 'Nova'
    });
    assert.strictEqual(result, false);
  });
});

describe('TicketStatusChangedEvaluator', () => {
  let evaluator;

  before(() => {
    evaluator = new TicketStatusChangedEvaluator();
  });

  it('should have correct trigger type', () => {
    assert.strictEqual(evaluator.triggerType, 'ticket_status_changed');
  });

  it('should trigger for all status changes when no config specified', async () => {
    const eventData = {
      ticketId: 'ticket-1',
      oldStatus: 'Nova',
      newStatus: 'U radu'
    };

    const result = await evaluator.evaluate({}, eventData);
    assert.strictEqual(result, true);
  });

  it('should filter by fromStatus correctly', async () => {
    const config = { fromStatus: 'Nova' };
    
    // Matching fromStatus
    let result = await evaluator.evaluate(config, {
      oldStatus: 'Nova',
      newStatus: 'U radu'
    });
    assert.strictEqual(result, true);

    // Non-matching fromStatus
    result = await evaluator.evaluate(config, {
      oldStatus: 'U radu',
      newStatus: 'Riješena'
    });
    assert.strictEqual(result, false);
  });

  it('should filter by toStatus correctly', async () => {
    const config = { toStatus: 'Riješena' };
    
    // Matching toStatus
    let result = await evaluator.evaluate(config, {
      oldStatus: 'U radu',
      newStatus: 'Riješena'
    });
    assert.strictEqual(result, true);

    // Non-matching toStatus
    result = await evaluator.evaluate(config, {
      oldStatus: 'Nova',
      newStatus: 'U radu'
    });
    assert.strictEqual(result, false);
  });

  it('should filter by both fromStatus and toStatus', async () => {
    const config = {
      fromStatus: 'Nova',
      toStatus: 'U radu'
    };
    
    // Both match
    let result = await evaluator.evaluate(config, {
      oldStatus: 'Nova',
      newStatus: 'U radu'
    });
    assert.strictEqual(result, true);

    // fromStatus matches, toStatus doesn't
    result = await evaluator.evaluate(config, {
      oldStatus: 'Nova',
      newStatus: 'Riješena'
    });
    assert.strictEqual(result, false);

    // toStatus matches, fromStatus doesn't
    result = await evaluator.evaluate(config, {
      oldStatus: 'Na čekanju',
      newStatus: 'U radu'
    });
    assert.strictEqual(result, false);
  });
});

describe('TimeScheduledEvaluator', () => {
  let evaluator;

  before(() => {
    evaluator = new TimeScheduledEvaluator();
  });

  after(() => {
    // Clean up any scheduled tasks
    for (const [workflowId] of evaluator.getScheduledWorkflows()) {
      evaluator.unscheduleWorkflow(workflowId);
    }
  });

  it('should have correct trigger type', () => {
    assert.strictEqual(evaluator.triggerType, 'time_scheduled');
  });

  it('should throw error when cronExpression is missing', async () => {
    await assert.rejects(
      async () => {
        await evaluator.evaluate({}, {});
      },
      {
        message: 'cronExpression required for time_scheduled trigger'
      }
    );
  });

  it('should throw error for invalid cron expression', async () => {
    const config = { cronExpression: 'invalid cron' };

    await assert.rejects(
      async () => {
        await evaluator.evaluate(config, {});
      },
      {
        message: /Invalid cron expression/
      }
    );
  });

  it('should validate correct cron expressions', async () => {
    const validExpressions = [
      '0 9 * * 1',      // Every Monday at 9 AM
      '0 0 * * *',      // Every day at midnight
      '*/15 * * * *',   // Every 15 minutes
      '0 0 1 * *'       // First day of each month at midnight
    ];

    for (const expression of validExpressions) {
      const config = { cronExpression: expression };
      const eventData = { type: 'scheduled' };
      
      const result = await evaluator.evaluate(config, eventData);
      assert.strictEqual(result, true, `Should accept cron: ${expression}`);
    }
  });

  it('should return true for scheduled event type', async () => {
    const config = { cronExpression: '0 9 * * 1' };
    const eventData = { type: 'scheduled' };

    const result = await evaluator.evaluate(config, eventData);
    assert.strictEqual(result, true);
  });

  it('should return false for non-scheduled event types', async () => {
    const config = { cronExpression: '0 9 * * 1' };
    const eventData = { type: 'other' };

    const result = await evaluator.evaluate(config, eventData);
    assert.strictEqual(result, false);
  });

  it('should schedule a workflow correctly', () => {
    const workflowId = 'workflow-1';
    const config = { cronExpression: '*/5 * * * *' }; // Every 5 minutes
    let callbackCalled = false;
    const callback = () => { callbackCalled = true; };

    const task = evaluator.scheduleWorkflow(workflowId, config, callback);

    assert.ok(task, 'Should return task object');
    assert.strictEqual(evaluator.getScheduledWorkflows().has(workflowId), true);

    // Clean up
    evaluator.unscheduleWorkflow(workflowId);
  });

  it('should unschedule a workflow correctly', () => {
    const workflowId = 'workflow-2';
    const config = { cronExpression: '*/5 * * * *' };
    const callback = () => {};

    evaluator.scheduleWorkflow(workflowId, config, callback);
    assert.strictEqual(evaluator.getScheduledWorkflows().has(workflowId), true);

    evaluator.unscheduleWorkflow(workflowId);
    assert.strictEqual(evaluator.getScheduledWorkflows().has(workflowId), false);
  });

  it('should replace existing schedule when scheduling same workflow', () => {
    const workflowId = 'workflow-3';
    const config1 = { cronExpression: '*/5 * * * *' };
    const config2 = { cronExpression: '*/10 * * * *' };
    const callback = () => {};

    evaluator.scheduleWorkflow(workflowId, config1, callback);
    const scheduledCount1 = evaluator.getScheduledWorkflows().size;

    evaluator.scheduleWorkflow(workflowId, config2, callback);
    const scheduledCount2 = evaluator.getScheduledWorkflows().size;

    assert.strictEqual(scheduledCount1, scheduledCount2, 'Should not create duplicate schedules');

    // Clean up
    evaluator.unscheduleWorkflow(workflowId);
  });

  it('should throw error when scheduling without cronExpression', () => {
    const workflowId = 'workflow-4';
    const config = {};
    const callback = () => {};

    assert.throws(
      () => {
        evaluator.scheduleWorkflow(workflowId, config, callback);
      },
      {
        message: 'cronExpression required for scheduling'
      }
    );
  });

  it('should throw error when scheduling with invalid cron expression', () => {
    const workflowId = 'workflow-5';
    const config = { cronExpression: 'invalid' };
    const callback = () => {};

    assert.throws(
      () => {
        evaluator.scheduleWorkflow(workflowId, config, callback);
      },
      {
        message: /Invalid cron expression/
      }
    );
  });
});

describe('ExternalStatusChangedEvaluator', () => {
  let evaluator;

  before(() => {
    evaluator = new ExternalStatusChangedEvaluator();
  });

  it('should have correct trigger type', () => {
    assert.strictEqual(evaluator.triggerType, 'external_status_changed');
  });

  it('should trigger for all status changes when no config specified', async () => {
    const eventData = {
      serviceName: 'GitHub',
      oldStatus: 'operational',
      newStatus: 'degraded'
    };

    const result = await evaluator.evaluate({}, eventData);
    assert.strictEqual(result, true);
  });

  it('should filter by serviceName correctly', async () => {
    const config = { serviceName: 'GitHub' };
    
    // Matching service
    let result = await evaluator.evaluate(config, {
      serviceName: 'GitHub',
      newStatus: 'degraded'
    });
    assert.strictEqual(result, true);

    // Non-matching service
    result = await evaluator.evaluate(config, {
      serviceName: 'AWS',
      newStatus: 'degraded'
    });
    assert.strictEqual(result, false);
  });

  it('should filter by statusCondition correctly', async () => {
    const config = { statusCondition: 'degraded' };
    
    // Matching status
    let result = await evaluator.evaluate(config, {
      serviceName: 'GitHub',
      newStatus: 'degraded'
    });
    assert.strictEqual(result, true);

    // Non-matching status
    result = await evaluator.evaluate(config, {
      serviceName: 'GitHub',
      newStatus: 'operational'
    });
    assert.strictEqual(result, false);
  });

  it('should filter by both serviceName and statusCondition', async () => {
    const config = {
      serviceName: 'GitHub',
      statusCondition: 'down'
    };
    
    // Both match
    let result = await evaluator.evaluate(config, {
      serviceName: 'GitHub',
      newStatus: 'down'
    });
    assert.strictEqual(result, true);

    // serviceName matches, statusCondition doesn't
    result = await evaluator.evaluate(config, {
      serviceName: 'GitHub',
      newStatus: 'operational'
    });
    assert.strictEqual(result, false);

    // statusCondition matches, serviceName doesn't
    result = await evaluator.evaluate(config, {
      serviceName: 'AWS',
      newStatus: 'down'
    });
    assert.strictEqual(result, false);
  });
});

describe('TriggerRegistry', () => {
  let registry;

  before(() => {
    registry = new TriggerRegistry();
  });

  it('should register default evaluators on construction', () => {
    assert.strictEqual(registry.has('ticket_created'), true);
    assert.strictEqual(registry.has('ticket_status_changed'), true);
    assert.strictEqual(registry.has('time_scheduled'), true);
    assert.strictEqual(registry.has('external_status_changed'), true);
  });

  it('should get evaluator by trigger type', () => {
    const evaluator = registry.get('ticket_created');
    assert.ok(evaluator instanceof TicketCreatedEvaluator);
  });

  it('should return null for unknown trigger type', () => {
    const evaluator = registry.get('unknown_trigger');
    assert.strictEqual(evaluator, null);
  });

  it('should return all registered trigger types', () => {
    const types = registry.getRegisteredTypes();
    
    assert.strictEqual(types.length, 4);
    assert.ok(types.includes('ticket_created'));
    assert.ok(types.includes('ticket_status_changed'));
    assert.ok(types.includes('time_scheduled'));
    assert.ok(types.includes('external_status_changed'));
  });

  it('should allow registering custom evaluators', () => {
    class CustomEvaluator extends TicketCreatedEvaluator {
      constructor() {
        super();
        this.triggerType = 'custom_trigger';
      }
    }

    const customEvaluator = new CustomEvaluator();
    registry.register(customEvaluator);

    assert.strictEqual(registry.has('custom_trigger'), true);
    assert.strictEqual(registry.get('custom_trigger'), customEvaluator);
  });

  it('should throw error when registering non-evaluator object', () => {
    assert.throws(
      () => {
        registry.register({ notAnEvaluator: true });
      },
      {
        message: 'Evaluator must extend BaseTriggerEvaluator'
      }
    );
  });
});
