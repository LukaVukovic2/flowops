# Task 8.2 Implementation: Ticket CRUD API Endpoints

## Overview

Implemented complete ticket CRUD API endpoints with comprehensive authorization, validation, and Croatian localization as specified in requirements 2.2, 2.3, 2.4, 2.5, 2.8, 2.10, and 17.1.

## Files Created

### 1. Controllers
- **`src/controllers/tickets.controller.js`** - Business logic for ticket operations
  - GET /api/v1/tickets - List tickets with role-based filtering
  - POST /api/v1/tickets - Create ticket (auto-assigns "Nova" status)
  - GET /api/v1/tickets/:id - Get single ticket with authorization
  - PUT /api/v1/tickets/:id - Update ticket with ownership validation
  - PATCH /api/v1/tickets/:id/status - Change ticket status
  - GET /api/v1/tickets/:id/history - Get ticket change history
  - GET /api/v1/tickets/:id/comments - Get ticket comments
  - POST /api/v1/tickets/:id/comments - Add comment to ticket

### 2. Routes
- **`src/routes/tickets.routes.js`** - Express routes with validation and middleware
  - Input validation using express-validator
  - Role-based access control using auth middleware
  - Croatian error messages for all validation failures

### 3. Tests
- **`src/controllers/tickets.controller.test.js`** - Comprehensive unit tests
  - 43 test cases covering all requirements
  - Tests for role-based authorization
  - Tests for filtering and pagination
  - Tests for Croatian error messages

## Files Modified

- **`src/routes/index.js`** - Added ticket routes export
- **`src/app.js`** - Registered ticket routes at `/api/v1/tickets`

## Implementation Details

### Authentication & Authorization

All endpoints require authentication via JWT token in Authorization header.

#### Role-Based Access Control:

**Registrirani_Korisnik (Registered User):**
- Can create tickets
- Can view only their own tickets
- Can update only their own tickets
- Cannot change ticket status
- Can comment on their own tickets

**Tehničar (Technician):**
- Can create tickets
- Can view tickets assigned to them or created by them
- Can update tickets assigned to them
- Can change status of assigned tickets
- Can comment on assigned tickets

**Administrator:**
- Full access to all tickets
- Can perform all operations without restrictions

### Automatic Behaviors

1. **Status Assignment** (Requirement 2.2)
   - New tickets automatically get status "Nova"
   
2. **History Tracking** (Requirement 2.6)
   - All changes recorded in ticket_history table
   - Includes timestamp, user, action, old/new values

3. **Timestamp Management**
   - `resolved_at` set when status changes to "Riješena"
   - `closed_at` set when status changes to "Zatvorena"

### Filtering Support (Requirement 17.1)

GET /api/v1/tickets supports:
- `status` - Filter by ticket status
- `assigneeId` - Filter by assigned technician
- `creatorId` - Filter by ticket creator
- `fromDate` - Filter tickets created after date
- `toDate` - Filter tickets created before date
- `page` - Page number for pagination (default: 1)
- `limit` - Items per page (default: 20, max: 100)

### Validation

All endpoints include comprehensive validation:
- UUID format validation for IDs
- Enum validation for status and priority
- Required field validation
- Length limits on text fields
- Date format validation (ISO 8601)

### Error Responses

All errors return Croatian messages:
- `Tiket nije pronađen` - Ticket not found
- `Nemate ovlasti za pristup ovom tiketu` - No permission to access ticket
- `Možete uređivati samo vlastite tikete` - Can only edit own tickets
- `Nevažeći status` - Invalid status
- `Naslov je obavezan` - Title is required
- `Opis je obavezan` - Description is required

## API Endpoints Summary

### GET /api/v1/tickets
List tickets with filtering and pagination.

**Query Parameters:**
- `status`, `assigneeId`, `creatorId`, `fromDate`, `toDate`, `page`, `limit`

**Response:**
```json
{
  "tickets": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### POST /api/v1/tickets
Create new ticket (status automatically set to "Nova").

**Request Body:**
```json
{
  "title": "Server nije dostupan",
  "description": "Web server ne odgovara na zahtjeve",
  "priority": "Visoka",
  "assetId": "uuid-optional"
}
```

**Response:** 201 Created with ticket object

### GET /api/v1/tickets/:id
Get single ticket by ID with authorization check.

**Response:** Ticket object with creator and assignee details

### PUT /api/v1/tickets/:id
Update ticket with ownership validation.

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "Srednja",
  "assigneeId": "uuid"
}
```

**Response:** Updated ticket object

### PATCH /api/v1/tickets/:id/status
Change ticket status (requires Tehničar or Administrator).

**Request Body:**
```json
{
  "status": "U radu"
}
```

**Response:** Updated ticket object

### GET /api/v1/tickets/:id/history
Get ticket change history.

**Response:**
```json
{
  "history": [
    {
      "id": "uuid",
      "action": "status_changed",
      "oldValue": "Nova",
      "newValue": "U radu",
      "user": {...},
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### GET /api/v1/tickets/:id/comments
Get ticket comments with pagination.

**Response:**
```json
{
  "comments": [...],
  "pagination": {...}
}
```

### POST /api/v1/tickets/:id/comments
Add comment to ticket.

**Request Body:**
```json
{
  "content": "Provjerit ću server logs"
}
```

**Response:** 201 Created with comment object

## Requirements Validation

✅ **Requirement 2.2** - Tickets created with status "Nova"  
✅ **Requirement 2.3** - Registrirani_Korisnik can view own tickets  
✅ **Requirement 2.4** - Tehničar can view assigned tickets  
✅ **Requirement 2.5** - Administrator can view all tickets  
✅ **Requirement 2.6** - Changes recorded in history with timestamp and user  
✅ **Requirement 2.7** - Comments appended with timestamp and author  
✅ **Requirement 2.8** - Support for all ticket statuses  
✅ **Requirement 2.9** - Tehničar assignment recorded with timestamp  
✅ **Requirement 2.10** - Ownership validation for updates  
✅ **Requirement 17.1** - Filtering by status, assignee, creator, date range  

## Testing

All 43 unit tests pass successfully:
```
✓ Tickets Controller (32.3151ms)
ℹ tests 43
ℹ suites 11
ℹ pass 43
ℹ fail 0
```

Tests cover:
- Role-based authorization
- Input validation
- Filtering and pagination
- Error handling
- Croatian localization
- Status transitions
- History tracking

## Next Steps

Task 8.2 is complete. The ticket CRUD API endpoints are fully implemented with:
- Complete authorization logic
- Comprehensive validation
- Croatian error messages
- Change history tracking
- Comment support
- Extensive test coverage

The endpoints are ready for integration with the frontend (Phase 3, Tasks 9.1-9.3).
