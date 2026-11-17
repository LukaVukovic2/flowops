# FlowOps Ticket Models

Data access layer for ticket management, history tracking, and comments.

## Overview

This directory contains the data models for the FlowOps ticket system. All models interact with Supabase PostgreSQL and ensure:

- ✅ UTC timestamp storage
- ✅ Proper error handling
- ✅ Relational data loading
- ✅ Input validation
- ✅ Pagination support

## Models

### Ticket Model (`ticket.model.js`)

Main ticket data access layer.

#### Functions

##### `createTicket(ticketData)`

Creates a new ticket with automatic status "Nova".

```javascript
const ticket = await createTicket({
  title: 'Server nije dostupan',
  description: 'Web server ne odgovara na zahtjeve',
  priority: 'Visoka', // Optional: Niska, Srednja, Visoka, Hitna
  creatorId: userId,
  assigneeId: technicianId, // Optional
  assetId: assetId, // Optional
});
```

**Returns**: Created ticket object with creator and assignee details.

##### `getTicketById(ticketId)`

Retrieves a single ticket by ID.

```javascript
const ticket = await getTicketById('uuid');
```

**Returns**: Ticket object or null if not found.

##### `getTickets(filters)`

Lists tickets with filtering and pagination.

```javascript
const result = await getTickets({
  status: 'Nova', // Optional: Filter by status
  creatorId: userId, // Optional: Filter by creator
  assigneeId: technicianId, // Optional: Filter by assignee
  fromDate: '2024-01-01T00:00:00Z', // Optional: Filter by date
  toDate: '2024-12-31T23:59:59Z', // Optional
  page: 1, // Default: 1
  limit: 20, // Default: 20
});
```

**Returns**:
```javascript
{
  tickets: [...],
  pagination: {
    page: 1,
    limit: 20,
    total: 100,
    totalPages: 5
  }
}
```

##### `updateTicket(ticketId, updates)`

Updates ticket fields (title, description, priority, assignee, asset).

```javascript
const updatedTicket = await updateTicket(ticketId, {
  title: 'Updated title',
  description: 'Updated description',
  priority: 'Srednja',
  assigneeId: newTechnicianId,
});
```

**Note**: Status changes should use `updateTicketStatus` instead.

##### `updateTicketStatus(ticketId, status, userId)`

Changes ticket status with automatic timestamp handling.

```javascript
const updatedTicket = await updateTicketStatus(ticketId, 'U radu', userId);
```

**Valid statuses**: Nova, U radu, Na čekanju, Riješena, Zatvorena

**Automatic timestamps**:
- `resolved_at` set when status becomes "Riješena"
- `closed_at` set when status becomes "Zatvorena"

##### `deleteTicket(ticketId)`

Deletes a ticket (hard delete).

```javascript
await deleteTicket(ticketId);
```

**Note**: Cascading deletes will remove related history and comments.

---

### Ticket History Model (`ticketHistory.model.js`)

Tracks all changes to tickets.

#### Functions

##### `createTicketHistory(historyData)`

Creates a history entry.

```javascript
const history = await createTicketHistory({
  ticketId: ticketId,
  userId: userId,
  action: 'status_changed',
  oldValue: 'Nova',
  newValue: 'U radu',
});
```

##### `getTicketHistory(ticketId)`

Retrieves all history for a ticket in chronological order.

```javascript
const history = await getTicketHistory(ticketId);
```

**Returns**: Array of history entries with user details.

##### `recordStatusChange(ticketId, userId, oldStatus, newStatus)`

Specialized method for recording status changes.

```javascript
await recordStatusChange(ticketId, userId, 'Nova', 'U radu');
```

##### `recordAssignmentChange(ticketId, userId, oldAssigneeId, newAssigneeId)`

Records assignment changes.

```javascript
await recordAssignmentChange(ticketId, userId, null, technicianId);
```

##### `recordFieldUpdate(ticketId, userId, field, oldValue, newValue)`

Records generic field updates.

```javascript
await recordFieldUpdate(ticketId, userId, 'priority', 'Niska', 'Visoka');
```

##### `recordTicketCreation(ticketId, userId)`

Records ticket creation event.

```javascript
await recordTicketCreation(ticketId, userId);
```

##### `deleteTicketHistory(ticketId)`

Deletes all history for a ticket.

```javascript
await deleteTicketHistory(ticketId);
```

---

### Ticket Comments Model (`ticketComments.model.js`)

Manages ticket comments and discussions.

#### Functions

##### `createComment(commentData)`

Adds a comment to a ticket.

```javascript
const comment = await createComment({
  ticketId: ticketId,
  authorId: userId,
  content: 'Provjerit ću server logs',
});
```

**Returns**: Created comment with author details.

##### `getCommentsByTicketId(ticketId, options)`

Retrieves paginated comments for a ticket.

```javascript
const result = await getCommentsByTicketId(ticketId, {
  page: 1, // Default: 1
  limit: 20, // Default: 20
});
```

**Returns**:
```javascript
{
  comments: [...],
  pagination: {
    page: 1,
    limit: 20,
    total: 15,
    totalPages: 1
  }
}
```

##### `getCommentById(commentId)`

Retrieves a single comment.

```javascript
const comment = await getCommentById(commentId);
```

##### `updateComment(commentId, content)`

Updates comment content.

```javascript
const updatedComment = await updateComment(commentId, 'Updated comment text');
```

##### `deleteComment(commentId)`

Deletes a single comment.

```javascript
await deleteComment(commentId);
```

##### `deleteCommentsByTicketId(ticketId)`

Deletes all comments for a ticket.

```javascript
await deleteCommentsByTicketId(ticketId);
```

##### `countCommentsByTicketId(ticketId)`

Counts total comments on a ticket.

```javascript
const count = await countCommentsByTicketId(ticketId);
```

---

## Usage Pattern

Typical workflow for creating and updating a ticket:

```javascript
import {
  TicketModel,
  TicketHistoryModel,
  TicketCommentsModel,
} from './models/index.js';

// 1. Create ticket
const ticket = await TicketModel.createTicket({
  title: 'Server problem',
  description: 'Web server not responding',
  priority: 'Visoka',
  creatorId: userId,
});

// 2. Record creation
await TicketHistoryModel.recordTicketCreation(ticket.id, userId);

// 3. Assign to technician
await TicketModel.updateTicket(ticket.id, {
  assigneeId: technicianId,
});

await TicketHistoryModel.recordAssignmentChange(
  ticket.id,
  adminId,
  null,
  technicianId
);

// 4. Update status
await TicketModel.updateTicketStatus(ticket.id, 'U radu', technicianId);

await TicketHistoryModel.recordStatusChange(
  ticket.id,
  technicianId,
  'Nova',
  'U radu'
);

// 5. Add comment
await TicketCommentsModel.createComment({
  ticketId: ticket.id,
  authorId: technicianId,
  content: 'Checking server logs...',
});

// 6. Get full ticket details
const fullTicket = await TicketModel.getTicketById(ticket.id);
const history = await TicketHistoryModel.getTicketHistory(ticket.id);
const { comments } = await TicketCommentsModel.getCommentsByTicketId(ticket.id);
```

## Error Handling

All models throw errors with descriptive messages:

```javascript
try {
  await TicketModel.updateTicketStatus(ticketId, 'InvalidStatus', userId);
} catch (error) {
  console.error(error.message); // "Invalid status: InvalidStatus"
}
```

Common error patterns:
- Database connection errors: "Failed to create ticket: ..."
- Validation errors: "Invalid status: ..."
- Not found: Returns null instead of throwing

## Testing

Run smoke test to verify models load correctly:

```bash
node src/models/models-smoke-test.js
```

Run integration tests (requires database):

```bash
node --test src/models/ticket.model.test.js
node --test src/models/ticketHistory.model.test.js
node --test src/models/ticketComments.model.test.js
```

Or run all tests:

```bash
node --test src/models/*.test.js
```

**Note**: Integration tests require database migrations to be applied.

## Database Schema

Models align with these tables:

- `tickets`: Main ticket data
- `ticket_history`: Change audit trail
- `ticket_comments`: Comments and discussions

See migration file: `supabase/migrations/20240102000000_create_tickets_tables.sql`

## Requirements Fulfilled

- ✅ **Requirement 2.1**: Ticket creation with status, timestamps, and user tracking
- ✅ **Requirement 2.6**: Complete history tracking for all changes
- ✅ **Requirement 2.7**: Comment system with author and timestamps

## Key Features

1. **UTC Timestamps**: All timestamps use `TIMESTAMP WITH TIME ZONE`
2. **Auto Status**: New tickets automatically get "Nova" status
3. **Automatic Timestamps**: `resolved_at` and `closed_at` set automatically
4. **Relational Loading**: User details included in queries
5. **Pagination**: Standard page/limit/total pattern
6. **Validation**: Status validation in business logic
7. **Cascading Deletes**: Database handles cleanup

## Next Steps

These models are used by:
- Task 8.2: Ticket CRUD API endpoints
- Task 8.3: Ticket history and comments API
- Workflow automation engine
- Dashboard statistics
