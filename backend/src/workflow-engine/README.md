# Workflow Automation Engine

This directory contains the workflow automation engine for FlowOps Platform.

## Overview

The workflow automation engine enables rule-based automation of IT operations tasks. It consists of trigger evaluators that determine when workflows should execute and action executors that perform the actual automation tasks.

## Architecture

```
workflow-engine/
├── triggers.js       # Trigger evaluation logic ✓ IMPLEMENTED
├── triggers.test.js  # Trigger evaluator unit tests ✓ IMPLEMENTED
├── actions.js        # Action execution logic ✓ IMPLEMENTED
├── actions.test.js   # Action executor unit tests ✓ IMPLEMENTED
├── engine.js         # Main workflow engine orchestrator ✓ IMPLEMENTED
├── engine.test.js    # Workflow engine unit tests ✓ IMPLEMENTED
├── EXAMPLES.md       # Usage examples
├── WORKFLOW_ENGINE_README.md  # Engine documentation
└── README.md         # This file
```

## Trigger Evaluators

### Available Trigger Types

#### 1. Ticket Created Trigger (`ticket_created`)

Evaluates when a new ticket is created. Can optionally filter by priority and status.

**Configuration Example:**
```javascript
{
  triggerType: 'ticket_created',
  triggerConfig: {
    priority: 'Visoka',  // Optional: only trigger for high priority tickets
    status: 'Nova'       // Optional: only trigger for new tickets
  }
}
```

**Event Data Format:**
```javascript
{
  id: 'ticket-uuid',
  title: 'Server nije dostupan',
  priority: 'Visoka',
  status: 'Nova',
  creatorId: 'user-uuid',
  // ... other ticket fields
}
```

#### 2. Ticket Status Changed Trigger (`ticket_status_changed`)

Evaluates when a ticket status changes. Can filter by from/to status combinations.

**Configuration Example:**
```javascript
{
  triggerType: 'ticket_status_changed',
  triggerConfig: {
    fromStatus: 'Nova',      // Optional: trigger when changing from this status
    toStatus: 'U radu'       // Optional: trigger when changing to this status
  }
}
```

**Event Data Format:**
```javascript
{
  ticketId: 'ticket-uuid',
  oldStatus: 'Nova',
  newStatus: 'U radu',
  changedBy: 'user-uuid',
  // ... other relevant fields
}
```

#### 3. Time Scheduled Trigger (`time_scheduled`)

Evaluates based on cron expressions for scheduled workflow execution.

**Configuration Example:**
```javascript
{
  triggerType: 'time_scheduled',
  triggerConfig: {
    cronExpression: '0 9 * * 1'  // Every Monday at 9:00 AM
  }
}
```

**Cron Expression Examples:**
- `'0 9 * * 1'` - Every Monday at 9:00 AM
- `'0 0 * * *'` - Every day at midnight
- `'0 0 1 * *'` - First day of each month at midnight
- `'*/15 * * * *'` - Every 15 minutes

**Event Data Format:**
```javascript
{
  type: 'scheduled',
  timestamp: '2024-01-15T09:00:00Z'
}
```

**Scheduling:**
```javascript
const evaluator = new TimeScheduledEvaluator();
const workflowId = 'workflow-uuid';
const config = { cronExpression: '0 9 * * 1' };

// Schedule a workflow
const task = evaluator.scheduleWorkflow(workflowId, config, async () => {
  // Execute workflow actions
  await executeWorkflow(workflowId);
});

// Unschedule when workflow is disabled or deleted
evaluator.unscheduleWorkflow(workflowId);
```

#### 4. External Status Changed Trigger (`external_status_changed`)

Evaluates when an external service status changes.

**Configuration Example:**
```javascript
{
  triggerType: 'external_status_changed',
  triggerConfig: {
    serviceName: 'GitHub',           // Optional: filter by service name
    statusCondition: 'degraded'      // Optional: trigger for specific status
  }
}
```

**Event Data Format:**
```javascript
{
  serviceName: 'GitHub',
  oldStatus: 'operational',
  newStatus: 'degraded',
  description: 'Service experiencing issues',
  timestamp: '2024-01-15T10:30:00Z'
}
```

**Supported Status Values:**
- `operational` - Service is functioning normally
- `degraded` - Service is experiencing issues but still partially functional
- `down` - Service is completely unavailable
- `maintenance` - Service is under planned maintenance

## Action Executors

### Available Action Types

#### 1. Send Notification Action (`send_notification`)

Sends notifications to users based on role or specific user.

**Configuration Example:**
```javascript
{
  actionType: 'send_notification',
  actionConfig: {
    recipientRole: 'Tehničar',     // Optional: send to all users with this role
    recipientUserId: 'uuid',       // Optional: send to specific user
    messageTemplate: 'New ticket {{title}} created with priority {{priority}}'
  }
}
```

**Template Variables:**
- Use `{{variableName}}` syntax to insert values from event data
- Example: `{{title}}`, `{{priority}}`, `{{ticketId}}`

#### 2. Update Ticket Status Action (`update_ticket_status`)

Updates the status of a ticket.

**Configuration Example:**
```javascript
{
  actionType: 'update_ticket_status',
  actionConfig: {
    ticketId: 'uuid',        // Optional: specific ticket (or from context)
    newStatus: 'U radu'      // Required: new status value
  }
}
```

**Valid Status Values:**
- `Nova` - New
- `U radu` - In Progress
- `Na čekanju` - Waiting
- `Riješena` - Resolved
- `Zatvorena` - Closed

#### 3. Assign Technician Action (`assign_technician`)

Assigns a technician to a ticket using various strategies.

**Configuration Example:**
```javascript
{
  actionType: 'assign_technician',
  actionConfig: {
    ticketId: 'uuid',                    // Optional: specific ticket (or from context)
    assignmentStrategy: 'least_loaded',  // Required: assignment strategy
    technicianId: 'uuid'                 // Required for 'specific' strategy
  }
}
```

**Assignment Strategies:**
- `specific` - Assign to a specific technician (requires technicianId)
- `least_loaded` - Assign to technician with fewest active assigned tickets
- `round_robin` - Rotate through available technicians

#### 4. Create Announcement Action (`create_announcement`)

Creates an announcement automatically.

**Configuration Example:**
```javascript
{
  actionType: 'create_announcement',
  actionConfig: {
    title: 'System Notification',         // Required: announcement title
    content: 'Ticket {{ticketId}} resolved', // Required: content
    categoryId: 'uuid',                   // Optional: category
    authorId: 'uuid',                     // Optional: author (or system user)
    autoPublish: true                     // Optional: auto-publish (default: false)
  }
}
```

**Template Variables:**
- Supports `{{variableName}}` syntax in both title and content
- Variables are replaced with values from event data

## Using Trigger Evaluators

### Basic Usage

```javascript
import { TriggerRegistry } from './workflow-engine/triggers.js';

// Create registry (automatically registers all default evaluators)
const registry = new TriggerRegistry();

// Get evaluator for specific trigger type
const evaluator = registry.get('ticket_created');

// Evaluate trigger conditions
const config = { priority: 'Visoka' };
const eventData = { 
  priority: 'Visoka', 
  status: 'Nova' 
};

const shouldTrigger = await evaluator.evaluate(config, eventData);

if (shouldTrigger) {
  // Execute workflow actions
}
```

### Custom Evaluators

You can register custom trigger evaluators:

```javascript
import { BaseTriggerEvaluator, TriggerRegistry } from './workflow-engine/triggers.js';

class CustomTriggerEvaluator extends BaseTriggerEvaluator {
  constructor() {
    super();
    this.triggerType = 'custom_trigger';
  }

  async evaluate(triggerConfig, eventData) {
    // Custom evaluation logic
    return true;
  }
}

const registry = new TriggerRegistry();
registry.register(new CustomTriggerEvaluator());
```

## Using Action Executors

### Basic Usage

```javascript
import { ActionRegistry } from './workflow-engine/actions.js';

// Create registry (automatically registers all default executors)
const registry = new ActionRegistry();

// Execute an action
const result = await registry.execute(
  'send_notification',
  {
    recipientRole: 'Tehničar',
    messageTemplate: 'New ticket {{title}} created'
  },
  {
    eventData: { title: 'Server Down', priority: 'Visoka' },
    workflowId: 'workflow-uuid'
  }
);

if (result.success) {
  console.log('Action executed successfully:', result.message);
} else {
  console.error('Action failed:', result.error);
}
```

### Custom Executors

You can register custom action executors:

```javascript
import { BaseActionExecutor, ActionRegistry } from './workflow-engine/actions.js';

class CustomActionExecutor extends BaseActionExecutor {
  constructor() {
    super();
    this.actionType = 'custom_action';
  }

  async execute(actionConfig, context) {
    try {
      // Custom action logic here
      return {
        success: true,
        message: 'Custom action completed'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

const registry = new ActionRegistry();
registry.register(new CustomActionExecutor());
```

## Testing

Run trigger evaluator tests:

```bash
npm test -- src/workflow-engine/triggers.test.js
```

Run action executor tests:

```bash
npm test -- src/workflow-engine/actions.test.js
```

All tests should pass:
- **Trigger Tests**: 33 tests
- **Action Tests**: 32 tests
- **Total**: 65 tests

## Workflow Engine

The **WorkflowEngine** is now implemented in `engine.js` and provides the main orchestration logic:

### Key Features

- **Event Processing**: `processEvent(eventType, eventData)` triggers matching workflows
- **Time-Based Scheduling**: Automatically schedules workflows with `time_scheduled` triggers using node-cron
- **Error Resilience**: Graceful error handling ensures failures don't crash the system (Requirement 4.7)
- **Execution Logging**: All executions logged to `workflow_executions` table (Requirement 4.5)
- **Fast Execution**: Actions execute within 60 seconds of trigger (Requirement 4.4)

### Usage Example

```javascript
import workflowEngine from './workflow-engine/engine.js';

// Initialize engine on server startup
await workflowEngine.initialize();

// Process events
await workflowEngine.processEvent('ticket_created', {
  id: 'ticket-123',
  title: 'Server down',
  status: 'Nova',
  priority: 'Visoka'
});

// Reload workflows after CRUD operations
await workflowEngine.reloadWorkflows();

// Graceful shutdown
workflowEngine.shutdown();
```

For complete documentation, see [WORKFLOW_ENGINE_README.md](./WORKFLOW_ENGINE_README.md).

## Integration with Workflow Engine

The trigger evaluators and action executors are used by the workflow engine:

```javascript
// Pseudocode for workflow engine integration
class WorkflowEngine {
  constructor(db) {
    this.db = db;
    this.triggers = new TriggerRegistry();
    this.actions = new ActionRegistry();
  }

  async processEvent(eventType, eventData) {
    // Find all enabled workflows for this event type
    const workflows = await this.db
      .from('workflow_rules')
      .select('*')
      .eq('is_enabled', true)
      .eq('trigger_type', eventType);

    // Evaluate each workflow's trigger
    for (const workflow of workflows) {
      const evaluator = this.triggers.get(workflow.trigger_type);
      
      if (!evaluator) {
        console.error(`Unknown trigger type: ${workflow.trigger_type}`);
        continue;
      }

      const shouldExecute = await evaluator.evaluate(
        workflow.trigger_config,
        eventData
      );

      if (shouldExecute) {
        await this.executeWorkflow(workflow, eventData);
      }
    }
  }

  async executeWorkflow(workflow, eventData) {
    const context = {
      workflowId: workflow.id,
      eventType: workflow.trigger_type,
      eventData,
      systemUserId: 'system'
    };

    // Execute each action in the workflow
    for (const action of workflow.actions) {
      const result = await this.actions.execute(
        action.type,
        action.config,
        context
      );

      // Log execution result
      await this.logExecution(workflow.id, action.type, result);
    }
  }
}
```

## Implementation Status

- [x] Implement trigger evaluators (triggers.js)
- [x] Implement action executors (actions.js)
- [x] Implement workflow execution engine (engine.js)
- [x] Write comprehensive tests (triggers.test.js, actions.test.js, engine.test.js)
- [ ] Implement circular dependency detection
- [ ] Create workflow management API endpoints
- [ ] Build workflow management UI

## Related Requirements

This implementation satisfies:

- **Requirement 4.2**: Support trigger types (ticket_created, ticket_status_changed, time_scheduled, external_status_changed)
- **Requirement 4.3**: Support action types (send_notification, update_ticket_status, assign_technician, create_announcement)
- **Requirement 4.4**: Execute actions within 60 seconds when trigger condition met
- **Requirement 4.5**: Log all executions with timestamp, trigger, and result
- **Requirement 4.7**: Ensure workflow failures don't crash the system

## Croatian Locale Notes

The action executors work with Croatian status values and support Croatian-language templates:

- **Ticket Statuses**: Nova, U radu, Na čekanju, Riješena, Zatvorena
- **Ticket Priorities**: Niska, Srednja, Visoka, Hitna
- **User Roles**: Posjetitelj, Registrirani_Korisnik, Tehničar, Administrator
- **Timezone**: Europe/Zagreb (for scheduled triggers and timestamps)

