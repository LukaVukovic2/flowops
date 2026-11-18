# Workflow Trigger Evaluator Examples

This document provides practical examples of using workflow trigger evaluators.

## Example 1: Auto-assign high priority tickets

**Use Case:** Automatically assign a technician when a high priority ticket is created.

```javascript
import { TriggerRegistry } from './workflow-engine/index.js';

const registry = new TriggerRegistry();
const evaluator = registry.get('ticket_created');

// Workflow configuration
const workflowRule = {
  name: 'Auto-assign high priority tickets',
  triggerType: 'ticket_created',
  triggerConfig: {
    priority: 'Visoka'
  },
  actions: [
    {
      type: 'assign_technician',
      config: {
        assignmentStrategy: 'least_loaded'
      }
    }
  ]
};

// When a ticket is created
const newTicketEvent = {
  id: 'ticket-123',
  title: 'Server down',
  priority: 'Visoka',
  status: 'Nova',
  creatorId: 'user-456'
};

// Evaluate if workflow should trigger
const shouldTrigger = await evaluator.evaluate(
  workflowRule.triggerConfig,
  newTicketEvent
);

if (shouldTrigger) {
  console.log('✓ High priority ticket detected - assigning technician');
  // Execute workflow actions...
}
```

## Example 2: Send notification on status change

**Use Case:** Send notification when ticket moves from "Nova" to "U radu".

```javascript
import { TriggerRegistry } from './workflow-engine/index.js';

const registry = new TriggerRegistry();
const evaluator = registry.get('ticket_status_changed');

// Workflow configuration
const workflowRule = {
  name: 'Notify on work started',
  triggerType: 'ticket_status_changed',
  triggerConfig: {
    fromStatus: 'Nova',
    toStatus: 'U radu'
  },
  actions: [
    {
      type: 'send_notification',
      config: {
        recipientRole: 'creator',
        messageTemplate: 'Vaš ticket {{ticket.title}} je uzet u obradu'
      }
    }
  ]
};

// When ticket status changes
const statusChangeEvent = {
  ticketId: 'ticket-123',
  oldStatus: 'Nova',
  newStatus: 'U radu',
  changedBy: 'tech-789'
};

// Evaluate if workflow should trigger
const shouldTrigger = await evaluator.evaluate(
  workflowRule.triggerConfig,
  statusChangeEvent
);

if (shouldTrigger) {
  console.log('✓ Work started - sending notification to ticket creator');
  // Execute workflow actions...
}
```

## Example 3: Daily ticket summary report

**Use Case:** Generate and send a daily summary of ticket statistics every morning at 9 AM.

```javascript
import { TimeScheduledEvaluator } from './workflow-engine/index.js';

const evaluator = new TimeScheduledEvaluator();

// Workflow configuration
const workflowRule = {
  id: 'workflow-daily-summary',
  name: 'Daily ticket summary',
  triggerType: 'time_scheduled',
  triggerConfig: {
    cronExpression: '0 9 * * *'  // Every day at 9:00 AM
  },
  actions: [
    {
      type: 'create_announcement',
      config: {
        announcementTitle: 'Dnevni pregled ticketa',
        announcementContent: 'Statistika ticketa za {{date}}...',
        categoryId: 'reports-category-id',
        autoPublish: true
      }
    }
  ]
};

// Schedule the workflow
const task = evaluator.scheduleWorkflow(
  workflowRule.id,
  workflowRule.triggerConfig,
  async () => {
    console.log('✓ Running daily summary at', new Date().toLocaleString('hr-HR'));
    
    // Create scheduled event
    const scheduledEvent = {
      type: 'scheduled',
      timestamp: new Date().toISOString()
    };
    
    // Evaluate (will return true for scheduled events)
    const shouldTrigger = await evaluator.evaluate(
      workflowRule.triggerConfig,
      scheduledEvent
    );
    
    if (shouldTrigger) {
      // Execute workflow actions...
      console.log('✓ Generating and publishing daily report');
    }
  }
);

console.log('✓ Daily summary workflow scheduled');

// Later, when workflow is disabled or deleted
// evaluator.unscheduleWorkflow(workflowRule.id);
```

## Example 4: Alert on external service degradation

**Use Case:** Create an announcement when GitHub service status changes to degraded or down.

```javascript
import { TriggerRegistry } from './workflow-engine/index.js';

const registry = new TriggerRegistry();
const evaluator = registry.get('external_status_changed');

// Workflow configuration
const workflowRule = {
  name: 'Alert on GitHub issues',
  triggerType: 'external_status_changed',
  triggerConfig: {
    serviceName: 'GitHub',
    statusCondition: 'degraded'
  },
  actions: [
    {
      type: 'create_announcement',
      config: {
        announcementTitle: 'GitHub problemi',
        announcementContent: 'GitHub doživljava probleme. Molimo strpljenje.',
        categoryId: 'system-alerts-id',
        autoPublish: true
      }
    }
  ]
};

// When external service status changes
const externalStatusEvent = {
  serviceName: 'GitHub',
  oldStatus: 'operational',
  newStatus: 'degraded',
  description: 'GitHub API experiencing high latency',
  timestamp: new Date().toISOString()
};

// Evaluate if workflow should trigger
const shouldTrigger = await evaluator.evaluate(
  workflowRule.triggerConfig,
  externalStatusEvent
);

if (shouldTrigger) {
  console.log('✓ GitHub degradation detected - creating alert announcement');
  // Execute workflow actions...
}
```

## Example 5: Complete workflow processing

**Use Case:** Process an event through the workflow system with multiple rules.

```javascript
import { TriggerRegistry } from './workflow-engine/index.js';

class SimpleWorkflowProcessor {
  constructor(workflowRules) {
    this.workflows = workflowRules;
    this.triggers = new TriggerRegistry();
  }

  async processEvent(eventType, eventData) {
    console.log(`\n📋 Processing ${eventType} event`);

    // Find workflows matching this event type
    const matchingWorkflows = this.workflows.filter(
      w => w.isEnabled && w.triggerType === eventType
    );

    console.log(`   Found ${matchingWorkflows.length} enabled workflows`);

    // Evaluate each workflow
    for (const workflow of matchingWorkflows) {
      const evaluator = this.triggers.get(workflow.triggerType);
      
      if (!evaluator) {
        console.error(`   ✗ Unknown trigger type: ${workflow.triggerType}`);
        continue;
      }

      const shouldTrigger = await evaluator.evaluate(
        workflow.triggerConfig,
        eventData
      );

      if (shouldTrigger) {
        console.log(`   ✓ Triggering: ${workflow.name}`);
        console.log(`     Actions to execute: ${workflow.actions.length}`);
        
        // In real implementation, execute actions here
        for (const action of workflow.actions) {
          console.log(`     - ${action.type}`);
        }
      } else {
        console.log(`   ○ Skipped: ${workflow.name} (conditions not met)`);
      }
    }
  }
}

// Example workflow rules
const workflows = [
  {
    id: '1',
    name: 'Auto-assign urgent tickets',
    isEnabled: true,
    triggerType: 'ticket_created',
    triggerConfig: { priority: 'Hitna' },
    actions: [{ type: 'assign_technician', config: {} }]
  },
  {
    id: '2',
    name: 'Notify on high priority tickets',
    isEnabled: true,
    triggerType: 'ticket_created',
    triggerConfig: { priority: 'Visoka' },
    actions: [{ type: 'send_notification', config: {} }]
  },
  {
    id: '3',
    name: 'Track resolution',
    isEnabled: true,
    triggerType: 'ticket_status_changed',
    triggerConfig: { toStatus: 'Riješena' },
    actions: [{ type: 'create_announcement', config: {} }]
  }
];

// Create processor
const processor = new SimpleWorkflowProcessor(workflows);

// Process different events
await processor.processEvent('ticket_created', {
  priority: 'Visoka',
  status: 'Nova'
});
// Output:
// 📋 Processing ticket_created event
//    Found 2 enabled workflows
//    ○ Skipped: Auto-assign urgent tickets (conditions not met)
//    ✓ Triggering: Notify on high priority tickets
//      Actions to execute: 1
//      - send_notification

await processor.processEvent('ticket_status_changed', {
  oldStatus: 'U radu',
  newStatus: 'Riješena'
});
// Output:
// 📋 Processing ticket_status_changed event
//    Found 1 enabled workflows
//    ✓ Triggering: Track resolution
//      Actions to execute: 1
//      - create_announcement
```

## Example 6: Managing scheduled workflows

**Use Case:** Dynamically schedule and unschedule workflows based on admin configuration.

```javascript
import { TimeScheduledEvaluator } from './workflow-engine/index.js';

class WorkflowScheduler {
  constructor() {
    this.evaluator = new TimeScheduledEvaluator();
  }

  // Schedule all time-based workflows from database
  async scheduleAllWorkflows(workflows) {
    const timeBasedWorkflows = workflows.filter(
      w => w.isEnabled && w.triggerType === 'time_scheduled'
    );

    for (const workflow of timeBasedWorkflows) {
      try {
        await this.scheduleWorkflow(workflow);
        console.log(`✓ Scheduled: ${workflow.name}`);
      } catch (error) {
        console.error(`✗ Failed to schedule ${workflow.name}:`, error.message);
      }
    }
  }

  // Schedule a single workflow
  async scheduleWorkflow(workflow) {
    this.evaluator.scheduleWorkflow(
      workflow.id,
      workflow.triggerConfig,
      async () => {
        console.log(`⏰ Executing scheduled workflow: ${workflow.name}`);
        // Execute workflow actions...
      }
    );
  }

  // Unschedule a workflow (when disabled or deleted)
  unscheduleWorkflow(workflowId) {
    this.evaluator.unscheduleWorkflow(workflowId);
    console.log(`✓ Unscheduled workflow: ${workflowId}`);
  }

  // Reschedule a workflow (when configuration changes)
  async rescheduleWorkflow(workflow) {
    this.unscheduleWorkflow(workflow.id);
    await this.scheduleWorkflow(workflow);
    console.log(`✓ Rescheduled workflow: ${workflow.name}`);
  }

  // Get count of scheduled workflows
  getScheduledCount() {
    return this.evaluator.getScheduledWorkflows().size;
  }
}

// Usage
const scheduler = new WorkflowScheduler();

const workflows = [
  {
    id: 'wf-1',
    name: 'Morning report',
    isEnabled: true,
    triggerType: 'time_scheduled',
    triggerConfig: { cronExpression: '0 9 * * *' }
  },
  {
    id: 'wf-2',
    name: 'Weekly cleanup',
    isEnabled: true,
    triggerType: 'time_scheduled',
    triggerConfig: { cronExpression: '0 0 * * 0' }
  }
];

// Schedule all workflows
await scheduler.scheduleAllWorkflows(workflows);
console.log(`Total scheduled: ${scheduler.getScheduledCount()}`);

// Later, when workflow is disabled
scheduler.unscheduleWorkflow('wf-1');
```

## Testing Your Workflows

Always test your workflow configurations before enabling them:

```javascript
import { TriggerRegistry } from './workflow-engine/index.js';

async function testWorkflow(workflowConfig, testEventData) {
  const registry = new TriggerRegistry();
  const evaluator = registry.get(workflowConfig.triggerType);

  if (!evaluator) {
    console.error('Invalid trigger type');
    return false;
  }

  try {
    const result = await evaluator.evaluate(
      workflowConfig.triggerConfig,
      testEventData
    );
    
    console.log(`Test result: ${result ? 'PASS' : 'SKIP'}`);
    return result;
  } catch (error) {
    console.error('Test failed:', error.message);
    return false;
  }
}

// Test a workflow configuration
const config = {
  triggerType: 'ticket_created',
  triggerConfig: { priority: 'Visoka' }
};

const testData = {
  priority: 'Visoka',
  status: 'Nova'
};

await testWorkflow(config, testData);
```

## Action Executor Examples

### Example 1: Send Notification to Technicians

Send notification to all technicians when a high-priority ticket is created.

```javascript
import { ActionRegistry } from './workflow-engine/actions.js';

const actionRegistry = new ActionRegistry();

// Execute notification action
const result = await actionRegistry.execute(
  'send_notification',
  {
    recipientRole: 'Tehničar',
    messageTemplate: 'Hitna prijava: {{title}} - Prioritet: {{priority}}'
  },
  {
    eventData: {
      title: 'Server nije dostupan',
      priority: 'Hitna'
    },
    workflowId: 'workflow-123',
    eventType: 'ticket_created'
  }
);

console.log(result);
// {
//   success: true,
//   message: 'Notification sent to 3 recipient(s)',
//   recipientCount: 3,
//   recipients: [...]
// }
```

### Example 2: Auto-Assign Technician Using Least-Loaded Strategy

Automatically assign the least busy technician to a new ticket.

```javascript
const result = await actionRegistry.execute(
  'assign_technician',
  {
    assignmentStrategy: 'least_loaded'
  },
  {
    eventData: {
      id: 'ticket-456',
      title: 'Printer problem'
    },
    workflowId: 'workflow-auto-assign'
  }
);

console.log(result);
// {
//   success: true,
//   message: 'Ticket assigned to Ivan Horvat',
//   ticketId: 'ticket-456',
//   technicianId: 'tech-uuid',
//   technicianEmail: 'ivan.horvat@example.com',
//   strategy: 'least_loaded'
// }
```

### Example 3: Update Ticket Status After Resolution

Update ticket status to "Riješena" when specific conditions are met.

```javascript
const result = await actionRegistry.execute(
  'update_ticket_status',
  {
    newStatus: 'Riješena'
  },
  {
    eventData: {
      ticketId: 'ticket-789'
    },
    systemUserId: 'system',
    workflowId: 'workflow-auto-resolve'
  }
);

console.log(result);
// {
//   success: true,
//   message: 'Ticket status updated to Riješena',
//   ticketId: 'ticket-789',
//   newStatus: 'Riješena'
// }
```

### Example 4: Create Announcement with Auto-Publish

Create and automatically publish an announcement when external service goes down.

```javascript
const result = await actionRegistry.execute(
  'create_announcement',
  {
    title: 'Prekid usluge: {{serviceName}}',
    content: 'Trenutno {{serviceName}} nije dostupan. Status: {{newStatus}}. Radimo na rješavanju problema.',
    categoryId: 'category-system-status',
    autoPublish: true
  },
  {
    eventData: {
      serviceName: 'GitHub',
      newStatus: 'down'
    },
    systemUserId: 'system-announcer',
    workflowId: 'workflow-service-alert'
  }
);

console.log(result);
// {
//   success: true,
//   message: 'Announcement created: Prekid usluge: GitHub',
//   announcementId: 'announcement-uuid',
//   title: 'Prekid usluge: GitHub',
//   isPublished: true
// }
```

### Example 5: Complete Workflow - High Priority Ticket Automation

Complete workflow that triggers when a high-priority ticket is created.

```javascript
import { TriggerRegistry } from './workflow-engine/triggers.js';
import { ActionRegistry } from './workflow-engine/actions.js';

const triggers = new TriggerRegistry();
const actions = new ActionRegistry();

// Workflow definition
const workflow = {
  id: 'workflow-high-priority',
  name: 'Auto-handle high priority tickets',
  trigger_type: 'ticket_created',
  trigger_config: {
    priority: 'Hitna'
  },
  actions: [
    {
      type: 'assign_technician',
      config: {
        assignmentStrategy: 'least_loaded'
      }
    },
    {
      type: 'update_ticket_status',
      config: {
        newStatus: 'U radu'
      }
    },
    {
      type: 'send_notification',
      config: {
        recipientRole: 'Administrator',
        messageTemplate: 'HITNO: Ticket {{title}} automatski dodijeljen i postavljen u rad'
      }
    }
  ]
};

// Event data (new ticket created)
const eventData = {
  id: 'ticket-urgent-123',
  title: 'Kritičan kvar servera',
  priority: 'Hitna',
  status: 'Nova'
};

// Process workflow
const evaluator = triggers.get(workflow.trigger_type);
const shouldTrigger = await evaluator.evaluate(workflow.trigger_config, eventData);

if (shouldTrigger) {
  console.log('Workflow triggered! Executing actions...');
  
  const context = {
    workflowId: workflow.id,
    eventType: workflow.trigger_type,
    eventData,
    systemUserId: 'system'
  };
  
  for (const action of workflow.actions) {
    const result = await actions.execute(action.type, action.config, context);
    console.log(`Action ${action.type}:`, result.success ? 'SUCCESS' : 'FAILED');
  }
}
```

### Example 6: Round-Robin Technician Assignment

Distribute tickets evenly among technicians using round-robin strategy.

```javascript
// First ticket - assigned to tech 1
const result1 = await actionRegistry.execute(
  'assign_technician',
  {
    assignmentStrategy: 'round_robin'
  },
  {
    eventData: { id: 'ticket-1' }
  }
);

// Second ticket - assigned to tech 2
const result2 = await actionRegistry.execute(
  'assign_technician',
  {
    assignmentStrategy: 'round_robin'
  },
  {
    eventData: { id: 'ticket-2' }
  }
);

// Third ticket - assigned to tech 3 (or back to tech 1 if only 2 technicians)
const result3 = await actionRegistry.execute(
  'assign_technician',
  {
    assignmentStrategy: 'round_robin'
  },
  {
    eventData: { id: 'ticket-3' }
  }
);
```

### Example 7: Specific Technician Assignment

Assign a ticket to a specific technician for specialized tasks.

```javascript
const result = await actionRegistry.execute(
  'assign_technician',
  {
    ticketId: 'ticket-network-issue',
    assignmentStrategy: 'specific',
    technicianId: 'tech-network-specialist-uuid'
  },
  {
    eventData: {},
    workflowId: 'workflow-network-specialist'
  }
);
```

### Example 8: Send Notification to Specific User

Send notification to the ticket creator when their ticket is resolved.

```javascript
const result = await actionRegistry.execute(
  'send_notification',
  {
    recipientUserId: 'user-creator-uuid',
    messageTemplate: 'Vaša prijava "{{title}}" je riješena. Status: {{newStatus}}'
  },
  {
    eventData: {
      title: 'Printer problem',
      newStatus: 'Riješena'
    },
    workflowId: 'workflow-resolution-notification'
  }
);
```

### Example 9: Scheduled Weekly Report Announcement

Create a weekly system status announcement (triggered by time_scheduled).

```javascript
// Triggered every Monday at 9 AM by time_scheduled trigger
const result = await actionRegistry.execute(
  'create_announcement',
  {
    title: 'Tjedni izvještaj sustava',
    content: 'Pregled sustava za prošli tjedan. Sve usluge rade normalno.',
    categoryId: 'category-reports',
    autoPublish: true
  },
  {
    eventData: {
      type: 'scheduled',
      timestamp: new Date().toISOString()
    },
    systemUserId: 'system',
    workflowId: 'workflow-weekly-report'
  }
);
```

### Example 10: Multi-Action Workflow on Status Change

Execute multiple actions when ticket status changes from "Na čekanju" to "U radu".

```javascript
const workflow = {
  trigger_type: 'ticket_status_changed',
  trigger_config: {
    fromStatus: 'Na čekanju',
    toStatus: 'U radu'
  },
  actions: [
    {
      type: 'send_notification',
      config: {
        recipientUserId: '{{creatorId}}', // Notify ticket creator
        messageTemplate: 'Vaša prijava {{title}} je ponovo u radu'
      }
    },
    {
      type: 'send_notification',
      config: {
        recipientUserId: '{{assigneeId}}', // Notify assigned technician
        messageTemplate: 'Ticket {{title}} vraćen u rad - molimo provjerite'
      }
    }
  ]
};

// Event data
const eventData = {
  ticketId: 'ticket-123',
  title: 'Network connectivity issue',
  oldStatus: 'Na čekanju',
  newStatus: 'U radu',
  creatorId: 'user-creator-uuid',
  assigneeId: 'tech-assignee-uuid'
};

// Process workflow...
```


## Workflow Engine Examples

### Example 11: Initialize and Use the Workflow Engine

Complete workflow engine initialization and usage in a Node.js application.

```javascript
import express from 'express';
import workflowEngine from './workflow-engine/engine.js';

const app = express();

// Initialize workflow engine on server startup
async function startServer() {
  try {
    // Initialize workflow engine
    await workflowEngine.initialize();
    console.log('✓ Workflow engine initialized');
    console.log(`  Scheduled workflows: ${workflowEngine.getScheduledWorkflows().size}`);

    // Start Express server
    app.listen(3000, () => {
      console.log('✓ Server running on port 3000');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  workflowEngine.shutdown();
  process.exit(0);
});

startServer();
```

### Example 12: Trigger Workflows from Ticket Controller

Integrate workflow engine into ticket creation and status change operations.

```javascript
import workflowEngine from '../workflow-engine/engine.js';
import supabase from '../config/database.js';

// Ticket creation controller
async function createTicket(req, res) {
  try {
    const { title, description, priority } = req.body;
    const creatorId = req.user.id;

    // Create ticket in database
    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert({
        title,
        description,
        priority,
        status: 'Nova',
        creator_id: creatorId
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger workflows for ticket creation
    const workflowResults = await workflowEngine.processEvent('ticket_created', {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      creatorId: ticket.creator_id
    });

    console.log(`Triggered ${workflowResults.length} workflow(s) for new ticket`);

    res.status(201).json({ ticket, workflowsTriggered: workflowResults.length });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Greška prilikom kreiranja ticketa' });
  }
}

// Ticket status change controller
async function updateTicketStatus(req, res) {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body;

    // Get current ticket
    const { data: currentTicket } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();

    const oldStatus = currentTicket.status;

    // Update ticket status
    const { data: ticket, error } = await supabase
      .from('tickets')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Trigger workflows for status change
    const workflowResults = await workflowEngine.processEvent('ticket_status_changed', {
      id: ticket.id,
      ticketId: ticket.id,
      title: ticket.title,
      oldStatus,
      newStatus,
      priority: ticket.priority,
      changedBy: req.user.id
    });

    console.log(`Triggered ${workflowResults.length} workflow(s) for status change`);

    res.json({ ticket, workflowsTriggered: workflowResults.length });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ error: 'Greška prilikom ažuriranja statusa' });
  }
}

export { createTicket, updateTicketStatus };
```

### Example 13: Trigger Workflows from External Service Monitor

Integrate workflow engine with external service status monitoring.

```javascript
import axios from 'axios';
import workflowEngine from '../workflow-engine/engine.js';
import supabase from '../config/database.js';

class ExternalServiceMonitor {
  constructor() {
    this.services = [
      {
        name: 'GitHub',
        url: 'https://www.githubstatus.com/api/v2/status.json'
      }
    ];
    this.pollingInterval = 5 * 60 * 1000; // 5 minutes
  }

  async start() {
    console.log('Starting external service monitor...');
    
    // Initial poll
    await this.pollAllServices();

    // Schedule periodic polling
    setInterval(() => this.pollAllServices(), this.pollingInterval);
  }

  async pollAllServices() {
    for (const service of this.services) {
      try {
        await this.pollService(service);
      } catch (error) {
        console.error(`Error polling ${service.name}:`, error.message);
      }
    }
  }

  async pollService(service) {
    // Fetch current status
    const response = await axios.get(service.url);
    const newStatus = response.data.status.indicator; // e.g., "none", "minor", "major"

    // Map to our status values
    const mappedStatus = this.mapStatus(newStatus);

    // Get cached status from database
    const { data: cached } = await supabase
      .from('external_service_status')
      .select('status')
      .eq('service_name', service.name)
      .single();

    const oldStatus = cached?.status || 'operational';

    // Update cache
    await supabase
      .from('external_service_status')
      .upsert({
        service_name: service.name,
        status: mappedStatus,
        status_data: response.data,
        last_checked_at: new Date().toISOString(),
        cached_until: new Date(Date.now() + this.pollingInterval).toISOString()
      });

    // If status changed, trigger workflows
    if (oldStatus !== mappedStatus) {
      console.log(`Status change detected for ${service.name}: ${oldStatus} → ${mappedStatus}`);

      const workflowResults = await workflowEngine.processEvent('external_status_changed', {
        serviceName: service.name,
        oldStatus,
        newStatus: mappedStatus,
        statusData: response.data,
        timestamp: new Date().toISOString()
      });

      console.log(`Triggered ${workflowResults.length} workflow(s) for external status change`);
    }
  }

  mapStatus(githubStatus) {
    const statusMap = {
      'none': 'operational',
      'minor': 'degraded',
      'major': 'down',
      'critical': 'down'
    };
    return statusMap[githubStatus] || 'operational';
  }
}

// Start monitor
const monitor = new ExternalServiceMonitor();
monitor.start();

export default monitor;
```

### Example 14: Reload Workflows After CRUD Operations

Reload workflows when they are created, updated, or deleted via admin interface.

```javascript
import workflowEngine from '../workflow-engine/engine.js';
import supabase from '../config/database.js';

// Create workflow route handler
async function createWorkflow(req, res) {
  try {
    const workflowData = req.body;
    const userId = req.user.id;

    // Create workflow in database
    const { data: workflow, error } = await supabase
      .from('workflow_rules')
      .insert({
        ...workflowData,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;

    // Reload workflows (schedules new time-based workflows)
    await workflowEngine.reloadWorkflows();

    res.status(201).json({ 
      workflow,
      message: 'Workflow uspješno kreiran i aktiviran'
    });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ error: 'Greška prilikom kreiranja workflow-a' });
  }
}

// Update workflow route handler
async function updateWorkflow(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Update workflow in database
    const { data: workflow, error } = await supabase
      .from('workflow_rules')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Reload workflows (reschedules if cron expression changed)
    await workflowEngine.reloadWorkflows();

    res.json({ 
      workflow,
      message: 'Workflow uspješno ažuriran'
    });
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({ error: 'Greška prilikom ažuriranja workflow-a' });
  }
}

// Toggle workflow enabled/disabled
async function toggleWorkflow(req, res) {
  try {
    const { id } = req.params;

    // Get current status
    const { data: current } = await supabase
      .from('workflow_rules')
      .select('is_enabled')
      .eq('id', id)
      .single();

    // Toggle enabled status
    const { data: workflow, error } = await supabase
      .from('workflow_rules')
      .update({ 
        is_enabled: !current.is_enabled,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Reload workflows (schedules or unschedules time-based workflows)
    await workflowEngine.reloadWorkflows();

    res.json({ 
      workflow,
      message: workflow.is_enabled ? 'Workflow aktiviran' : 'Workflow deaktiviran'
    });
  } catch (error) {
    console.error('Error toggling workflow:', error);
    res.status(500).json({ error: 'Greška prilikom mijenjanja statusa workflow-a' });
  }
}

// Delete workflow route handler
async function deleteWorkflow(req, res) {
  try {
    const { id } = req.params;

    // Delete workflow from database
    const { error } = await supabase
      .from('workflow_rules')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Reload workflows (unschedules deleted workflow)
    await workflowEngine.reloadWorkflows();

    res.json({ message: 'Workflow uspješno obrisan' });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({ error: 'Greška prilikom brisanja workflow-a' });
  }
}

export { createWorkflow, updateWorkflow, toggleWorkflow, deleteWorkflow };
```

### Example 15: View Workflow Execution History

Query and display workflow execution history for monitoring and debugging.

```javascript
import supabase from '../config/database.js';

// Get workflow execution history
async function getWorkflowExecutions(req, res) {
  try {
    const { workflowId } = req.params;
    const { limit = 50, status, fromDate, toDate } = req.query;

    let query = supabase
      .from('workflow_executions')
      .select(`
        *,
        workflow_rules (
          id,
          name,
          trigger_type
        )
      `)
      .order('executed_at', { ascending: false })
      .limit(parseInt(limit));

    // Filter by workflow ID if specified
    if (workflowId) {
      query = query.eq('workflow_rule_id', workflowId);
    }

    // Filter by status if specified
    if (status) {
      query = query.eq('status', status);
    }

    // Filter by date range if specified
    if (fromDate) {
      query = query.gte('executed_at', fromDate);
    }
    if (toDate) {
      query = query.lte('executed_at', toDate);
    }

    const { data: executions, error } = await query;

    if (error) throw error;

    // Calculate statistics
    const stats = {
      total: executions.length,
      success: executions.filter(e => e.status === 'success').length,
      failure: executions.filter(e => e.status === 'failure').length,
      partial: executions.filter(e => e.status === 'partial').length
    };

    res.json({ executions, stats });
  } catch (error) {
    console.error('Error fetching workflow executions:', error);
    res.status(500).json({ error: 'Greška prilikom dohvaćanja historije izvršavanja' });
  }
}

// Get workflow execution statistics
async function getWorkflowStats(req, res) {
  try {
    // Get execution counts by workflow
    const { data: workflowStats, error } = await supabase
      .from('workflow_executions')
      .select('workflow_rule_id, status')
      .order('executed_at', { ascending: false });

    if (error) throw error;

    // Group by workflow and calculate stats
    const stats = {};
    for (const exec of workflowStats) {
      if (!stats[exec.workflow_rule_id]) {
        stats[exec.workflow_rule_id] = {
          total: 0,
          success: 0,
          failure: 0,
          partial: 0
        };
      }
      stats[exec.workflow_rule_id].total++;
      stats[exec.workflow_rule_id][exec.status]++;
    }

    // Calculate success rates
    const result = Object.entries(stats).map(([workflowId, s]) => ({
      workflowId,
      ...s,
      successRate: ((s.success / s.total) * 100).toFixed(2)
    }));

    res.json({ stats: result });
  } catch (error) {
    console.error('Error calculating workflow stats:', error);
    res.status(500).json({ error: 'Greška prilikom izračuna statistike' });
  }
}

export { getWorkflowExecutions, getWorkflowStats };
```

### Example 16: Health Check and Monitoring Endpoints

Create monitoring endpoints to check workflow engine health.

```javascript
import workflowEngine from '../workflow-engine/engine.js';
import supabase from '../config/database.js';

// Workflow engine health check
async function workflowEngineHealth(req, res) {
  try {
    const health = {
      status: 'healthy',
      initialized: workflowEngine.isEngineInitialized(),
      scheduledWorkflows: workflowEngine.getScheduledWorkflows().size,
      timestamp: new Date().toISOString()
    };

    // Check recent execution failures
    const { data: recentFailures } = await supabase
      .from('workflow_executions')
      .select('id')
      .eq('status', 'failure')
      .gte('executed_at', new Date(Date.now() - 3600000).toISOString()) // Last hour
      .limit(10);

    health.recentFailures = recentFailures?.length || 0;

    if (!health.initialized) {
      health.status = 'unhealthy';
      health.message = 'Workflow engine not initialized';
    } else if (health.recentFailures > 5) {
      health.status = 'degraded';
      health.message = 'High failure rate detected';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    console.error('Error checking workflow engine health:', error);
    res.status(503).json({ 
      status: 'unhealthy',
      error: error.message 
    });
  }
}

// Get active workflows
async function getActiveWorkflows(req, res) {
  try {
    const { data: workflows, error } = await supabase
      .from('workflow_rules')
      .select('*')
      .eq('is_enabled', true);

    if (error) throw error;

    const scheduled = workflowEngine.getScheduledWorkflows();
    
    const result = workflows.map(w => ({
      ...w,
      isScheduled: w.trigger_type === 'time_scheduled' && scheduled.has(w.id)
    }));

    res.json({ 
      workflows: result,
      totalActive: workflows.length,
      totalScheduled: scheduled.size
    });
  } catch (error) {
    console.error('Error fetching active workflows:', error);
    res.status(500).json({ error: 'Greška prilikom dohvaćanja aktivnih workflow-a' });
  }
}

export { workflowEngineHealth, getActiveWorkflows };
```

These examples demonstrate how to integrate the workflow engine into a complete FlowOps application, from initialization to monitoring and health checks.
