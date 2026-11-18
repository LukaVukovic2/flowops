# Workflow Execution Engine

The Workflow Execution Engine is the core orchestrator of the FlowOps workflow automation system. It coordinates trigger evaluation and action execution for both event-driven and time-based workflows.

## Overview

The workflow engine implements Requirements 4.4, 4.5, and 4.7:
- **4.4**: Execute workflow actions within 60 seconds when trigger conditions are met
- **4.5**: Log all executions with timestamp, trigger, and result to `workflow_executions` table
- **4.7**: Ensure workflow failures don't crash the system (graceful error handling)

## Architecture

```
WorkflowEngine
├── TriggerRegistry (from triggers.js)
├── ActionRegistry (from actions.js)
└── Scheduled workflows (Map)
```

### Components

1. **WorkflowEngine** (`engine.js`)
   - Main orchestration class
   - Manages event processing and workflow scheduling
   - Singleton instance exported for use throughout application

2. **TriggerRegistry** (`triggers.js`)
   - Registry of all trigger evaluators
   - Evaluates trigger conditions for workflows

3. **ActionRegistry** (`actions.js`)
   - Registry of all action executors
   - Executes workflow actions

## Usage

### Initialization

The workflow engine must be initialized on application startup:

```javascript
import workflowEngine from './workflow-engine/engine.js';

// Initialize engine (loads and schedules all active workflows)
await workflowEngine.initialize();
```

### Processing Events

When events occur in the system, trigger workflow evaluation:

```javascript
import workflowEngine from './workflow-engine/engine.js';

// Example: Ticket created
const eventData = {
  id: 'ticket-123',
  title: 'Server nie dostupan',
  status: 'Nova',
  priority: 'Visoka',
  creatorId: 'user-456'
};

const results = await workflowEngine.processEvent('ticket_created', eventData);
console.log('Workflow execution results:', results);
```

### Event Types

The engine supports the following event types:

1. **ticket_created** - Fired when a new ticket is created
2. **ticket_status_changed** - Fired when a ticket status changes
3. **external_status_changed** - Fired when external service status changes
4. **time_scheduled** - Triggered by cron schedule (handled automatically)

### Event Data Structure

Each event type expects specific data:

#### ticket_created
```javascript
{
  id: string,           // Ticket ID
  title: string,        // Ticket title
  description: string,  // Ticket description
  status: string,       // Ticket status
  priority?: string,    // Ticket priority (optional)
  creatorId: string,    // Creator user ID
  assetId?: string      // Associated asset ID (optional)
}
```

#### ticket_status_changed
```javascript
{
  id: string,           // Ticket ID
  ticketId: string,     // Ticket ID (alias)
  oldStatus: string,    // Previous status
  newStatus: string,    // New status
  priority?: string,    // Ticket priority
  title?: string        // Ticket title
}
```

#### external_status_changed
```javascript
{
  serviceName: string,  // External service name
  oldStatus: string,    // Previous status
  newStatus: string,    // New status
  statusData?: object   // Additional status data
}
```

## Workflow Execution Flow

1. **Event Occurs**: System event triggers `processEvent(eventType, eventData)`

2. **Fetch Workflows**: Query database for enabled workflows matching event type

3. **Evaluate Triggers**: For each workflow:
   - Get trigger evaluator from registry
   - Evaluate trigger conditions with event data
   - Skip workflow if conditions not met

4. **Execute Actions**: For matching workflows:
   - Execute each action in sequence
   - Build execution context with workflow and event data
   - Handle action failures gracefully

5. **Log Execution**: Write execution result to `workflow_executions` table:
   - workflow_rule_id
   - trigger_data
   - status (success, failure, partial)
   - error_message (if any)
   - executed_at timestamp

6. **Return Results**: Return array of execution results to caller

## Time-Based Workflows

Time-based workflows are automatically scheduled using node-cron:

```javascript
// Workflow rule with cron trigger
{
  trigger_type: 'time_scheduled',
  trigger_config: {
    cronExpression: '0 9 * * 1'  // Every Monday at 9:00 AM
  },
  actions: [...]
}
```

The engine:
- Loads all enabled time_scheduled workflows on initialization
- Creates cron jobs for each workflow
- Executes workflow actions when cron triggers
- Reschedules workflows when `reloadWorkflows()` is called

### Managing Scheduled Workflows

```javascript
// Get all scheduled workflows
const scheduled = workflowEngine.getScheduledWorkflows();
console.log(`${scheduled.size} workflows scheduled`);

// Unschedule a specific workflow
workflowEngine.unscheduleWorkflow('workflow-id');

// Reload all workflows (useful after adding/updating workflows)
await workflowEngine.reloadWorkflows();
```

## Error Handling

The engine implements comprehensive error handling per Requirement 4.7:

### System-Level Failures
- Database connection errors
- Query failures
- Registry errors

**Handling**: Log error, return empty results, continue operation

### Workflow-Level Failures
- Unknown trigger types
- Trigger evaluation errors
- Action execution errors

**Handling**: Log error, mark workflow as failed, continue processing other workflows

### Action-Level Failures
- Invalid action configuration
- Action execution errors
- Database update failures

**Handling**: Log error, mark action as failed, continue executing other actions

### Execution Logging

All execution attempts are logged to the database:

```javascript
// Success
{
  status: 'success',
  error_message: null,
  action_results: [...]
}

// Partial success (some actions failed)
{
  status: 'partial',
  error_message: null,
  action_results: [{ success: true }, { success: false, error: '...' }]
}

// Complete failure
{
  status: 'failure',
  error_message: 'Error message here',
  action_results: []
}
```

## Integration Points

### Ticket Management

In ticket controllers, trigger workflows on key events:

```javascript
// After creating ticket
await workflowEngine.processEvent('ticket_created', {
  id: ticket.id,
  title: ticket.title,
  status: ticket.status,
  priority: ticket.priority,
  creatorId: ticket.creator_id
});

// After status change
await workflowEngine.processEvent('ticket_status_changed', {
  id: ticket.id,
  ticketId: ticket.id,
  oldStatus: oldStatus,
  newStatus: newStatus,
  title: ticket.title
});
```

### External Service Monitoring

In external service poller:

```javascript
// When service status changes
await workflowEngine.processEvent('external_status_changed', {
  serviceName: 'GitHub',
  oldStatus: 'operational',
  newStatus: 'degraded',
  statusData: serviceData
});
```

### Server Startup

Initialize engine in server.js:

```javascript
import workflowEngine from './workflow-engine/engine.js';

// After database connection established
await workflowEngine.initialize();
console.log('Workflow engine initialized');

// On server shutdown
process.on('SIGTERM', () => {
  workflowEngine.shutdown();
  // ... other cleanup
});
```

## API Methods

### `initialize()`
Initialize the engine and schedule time-based workflows.
- **Returns**: `Promise<void>`
- **Throws**: Error if scheduling fails
- **Idempotent**: Safe to call multiple times

### `processEvent(eventType, eventData)`
Process an event and trigger matching workflows.
- **Parameters**:
  - `eventType` (string): Type of event
  - `eventData` (object): Event data
- **Returns**: `Promise<Array>` - Array of execution results
- **Throws**: Never (errors are caught and logged)

### `scheduleWorkflows()`
Load and schedule all active time-based workflows.
- **Returns**: `Promise<void>`
- **Throws**: Error if database query fails
- **Side effects**: Unschedules existing workflows first

### `reloadWorkflows()`
Reload workflows (calls `scheduleWorkflows()`).
- **Returns**: `Promise<void>`
- **Use case**: After workflow CRUD operations

### `unscheduleWorkflow(workflowId)`
Unschedule a specific workflow.
- **Parameters**:
  - `workflowId` (string): Workflow rule ID
- **Returns**: `void`
- **Safe**: Handles non-existent workflows gracefully

### `getScheduledWorkflows()`
Get all currently scheduled workflows.
- **Returns**: `Map<string, CronTask>`
- **Use case**: Monitoring, debugging

### `isEngineInitialized()`
Check if engine is initialized.
- **Returns**: `boolean`

### `shutdown()`
Gracefully shutdown the engine.
- **Returns**: `void`
- **Side effects**: Unschedules all workflows, marks as uninitialized

## Performance Considerations

### Database Queries
- Workflows are queried on each event (filtered by event type and enabled status)
- Use database indexes on `trigger_type` and `is_enabled` columns
- Consider caching workflow rules if performance becomes an issue

### Action Execution
- Actions execute sequentially within a workflow
- Multiple workflows for same event execute sequentially
- Consider adding parallel execution if needed for performance

### Logging
- Every execution is logged (writes to database)
- Logging failures don't prevent workflow execution
- Monitor `workflow_executions` table size and implement retention policy

## Testing

Unit tests cover:
- Engine initialization
- Workflow scheduling/unscheduling
- Event processing
- Error handling
- Shutdown behavior

Run tests:
```bash
npm test src/workflow-engine/engine.test.js
```

## Monitoring

### Logs
The engine logs to the application logger:
- INFO: Normal operations (initialization, scheduling, execution)
- WARN: Non-critical issues (workflow skipped, partial failure)
- ERROR: Failures (database errors, execution failures)

### Database
Monitor the `workflow_executions` table:
```sql
-- Recent failures
SELECT * FROM workflow_executions 
WHERE status = 'failure' 
ORDER BY executed_at DESC 
LIMIT 10;

-- Success rate by workflow
SELECT 
  workflow_rule_id,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
  ROUND(100.0 * SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM workflow_executions
GROUP BY workflow_rule_id;
```

## Troubleshooting

### Workflow Not Executing

1. **Check workflow is enabled**:
   ```sql
   SELECT * FROM workflow_rules WHERE id = 'workflow-id';
   ```

2. **Check trigger conditions**:
   - Verify `trigger_config` matches event data
   - Check logs for "trigger conditions not met" message

3. **Check event type matches**:
   - Verify `trigger_type` matches the event you're triggering

### Time-Based Workflow Not Running

1. **Check cron expression**:
   ```javascript
   import cron from 'node-cron';
   console.log(cron.validate('0 9 * * 1')); // Should be true
   ```

2. **Check scheduled workflows**:
   ```javascript
   const scheduled = workflowEngine.getScheduledWorkflows();
   console.log('Scheduled:', Array.from(scheduled.keys()));
   ```

3. **Reload workflows**:
   ```javascript
   await workflowEngine.reloadWorkflows();
   ```

### Actions Not Executing

1. **Check action type is registered**:
   ```javascript
   const actionRegistry = engine.actionRegistry;
   console.log('Registered actions:', actionRegistry.getRegisteredTypes());
   ```

2. **Check action configuration**:
   - Verify required fields present in `action.config`
   - Check logs for configuration errors

3. **Check execution logs**:
   ```sql
   SELECT * FROM workflow_executions 
   WHERE workflow_rule_id = 'workflow-id' 
   ORDER BY executed_at DESC 
   LIMIT 1;
   ```

## Future Enhancements

Potential improvements for the workflow engine:

1. **Parallel execution**: Execute actions in parallel where possible
2. **Conditional actions**: Support if/else logic in action sequences
3. **Workflow dependencies**: Execute workflows in dependency order
4. **Retry logic**: Automatic retry for failed actions
5. **Rate limiting**: Prevent workflow execution spam
6. **Workflow versioning**: Track changes to workflow rules
7. **Testing mode**: Dry-run workflows without executing actions
8. **Workflow templates**: Predefined workflow patterns
9. **Real-time monitoring**: WebSocket updates for workflow executions
10. **Workflow analytics**: Advanced metrics and reporting
