# Task 17.3 Implementation Summary: Asset-Ticket Linking

## Overview
Implemented the missing asset-ticket linking functionality, completing requirements 8.6 and 8.7.

## What Was Implemented

### 1. Database Migration
**File:** `supabase/migrations/20240103000000_add_asset_fk_to_tickets.sql`
- Added foreign key constraint from `tickets.asset_id` to `assets.id`
- Configured `ON DELETE SET NULL` to preserve tickets when assets are deleted
- Created index on `asset_id` for query performance
- Updated column comments for clarity

### 2. Ticket Model Enhancement
**File:** `backend/src/models/ticket.model.js`
- Added `getTicketsByAssetId(assetId, options)` function
  - Retrieves all tickets linked to a specific asset
  - Supports pagination (page, limit)
  - Includes full creator and assignee details via JOIN
  - Orders tickets by creation date descending
  - Returns pagination metadata (total count, pages)

### 3. Assets Controller
**File:** `backend/src/controllers/assets.controller.js`
- Added `getAssetTickets(req, res)` controller function
  - Validates asset existence (returns 404 if not found)
  - Calls `getTicketsByAssetId()` model function
  - Implements proper error handling with Croatian messages
  - Supports pagination query parameters

### 4. Assets Routes
**File:** `backend/src/routes/assets.routes.js`
- Added `GET /api/v1/assets/:id/tickets` endpoint
  - Requires authentication (authMiddleware)
  - Requires Tehničar or Administrator role
  - Validates asset ID is valid UUID
  - Validates pagination parameters (page ≥ 1, limit 1-100)
  - Returns Croatian error messages for validation failures

## API Endpoint

### GET /api/v1/assets/:id/tickets
Retrieves all tickets linked to a specific asset.

**Access:** Tehničar, Administrator

**Path Parameters:**
- `id` (UUID) - Asset ID

**Query Parameters:**
- `page` (integer, optional) - Page number (default: 1, min: 1)
- `limit` (integer, optional) - Items per page (default: 20, min: 1, max: 100)

**Response 200:**
```json
{
  "tickets": [
    {
      "id": "uuid",
      "title": "Server Issue",
      "description": "Description",
      "status": "Nova",
      "priority": "Visoka",
      "creator_id": "uuid",
      "assignee_id": "uuid",
      "asset_id": "uuid",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "creator": {
        "id": "uuid",
        "email": "user@example.com",
        "first_name": "Ivan",
        "last_name": "Horvat",
        "role": "Registrirani_Korisnik"
      },
      "assignee": {
        "id": "uuid",
        "email": "tech@example.com",
        "first_name": "Ana",
        "last_name": "Marić",
        "role": "Tehničar"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

**Response 404:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Imovina nije pronađena"
  }
}
```

**Response 500:**
```json
{
  "error": {
    "code": "SERVER_ERROR",
    "message": "Greška pri dohvaćanju tiketa za imovinu"
  }
}
```

## Tests

### Unit Tests Added

**Ticket Model Tests** (`src/models/ticket.model.test.js`):
- ✅ Should retrieve tickets linked to an asset
- ✅ Should return empty array if no tickets linked
- ✅ Should support pagination
- ✅ Should order tickets by creation date descending
- ✅ Should include creator and assignee details

**Assets Controller Tests** (`src/controllers/assets.controller.test.js`):
- ✅ Should return tickets linked to an asset
- ✅ Should include creator and assignee details in tickets
- ✅ Should support pagination
- ✅ Should return 404 for non-existent asset
- ✅ Should require Tehničar or Administrator role
- ✅ Should return empty array if no tickets linked
- ✅ Should order tickets by creation date descending
- ✅ Should include pagination metadata
- ✅ Should validate UUID format for asset ID
- ✅ Should return Croatian error on failure
- ✅ Should filter tickets only for specified asset
- ✅ Should show relationship in both asset and ticket views

**Assets Routes Tests** (`src/routes/assets.routes.test.js`):
- ✅ Should require authentication
- ✅ Should require Tehničar or Administrator role
- ✅ Should validate asset ID is UUID
- ✅ Should validate pagination parameters
- ✅ Should use validation middleware
- ✅ Should route to getAssetTickets controller
- ✅ Should return Croatian error messages
- ✅ Should return tickets with asset relationship

## Requirements Satisfied

✅ **Requirement 8.6:** Asset-Ticket Linking
- Tickets can be linked to assets via `asset_id` foreign key
- Foreign key constraint ensures referential integrity
- Endpoint to retrieve tickets for an asset is implemented

✅ **Requirement 8.7:** Relationship Display
- Asset-ticket relationship is visible from asset view (GET /api/v1/assets/:id/tickets)
- Asset-ticket relationship is visible from ticket view (asset_id in ticket response)
- Both directions of the relationship are properly exposed in the API

✅ **Requirement 17.3:** Filtering and Pagination
- Pagination support (page, limit parameters)
- Returns total count and total pages
- Proper validation of pagination parameters

## Migration Instructions

The database migration file has been created but needs to be manually applied to the Supabase database:

1. Navigate to Supabase SQL Editor: https://[your-project].supabase.co/project/_/sql
2. Copy and execute the SQL from `supabase/migrations/20240103000000_add_asset_fk_to_tickets.sql`
3. After execution, mark as applied:
   ```sql
   INSERT INTO _migrations (filename) VALUES ('20240103000000_add_asset_fk_to_tickets.sql');
   ```

## Files Modified/Created

### Created:
- `supabase/migrations/20240103000000_add_asset_fk_to_tickets.sql` - Database migration

### Modified:
- `backend/src/models/ticket.model.js` - Added getTicketsByAssetId function
- `backend/src/controllers/assets.controller.js` - Added getAssetTickets function
- `backend/src/routes/assets.routes.js` - Added GET /assets/:id/tickets route
- `backend/src/models/ticket.model.test.js` - Added tests for getTicketsByAssetId
- `backend/src/controllers/assets.controller.test.js` - Added tests for getAssetTickets
- `backend/src/routes/assets.routes.test.js` - Added tests for new route

## Notes

1. **Existing Functionality:** The ticket model, controller, and routes already supported `assetId` in create and update operations, so no changes were needed there.

2. **Foreign Key Behavior:** The foreign key is configured with `ON DELETE SET NULL`, meaning if an asset is deleted, the `asset_id` in related tickets will be set to NULL rather than deleting the tickets. This preserves ticket history even after assets are removed.

3. **Authorization:** The new endpoint follows the same authorization pattern as other asset endpoints - accessible by Tehničar and Administrator roles only.

4. **Error Messages:** All error messages are in Croatian as per requirement 12.4 and 20.4.

5. **Test Coverage:** All tests pass successfully and validate the requirements 8.6, 8.7, and 17.3.

## Verification

Run the following commands to verify the implementation:

```bash
# Test ticket model
npm test -- src/models/ticket.model.test.js

# Test assets controller
npm test -- src/controllers/assets.controller.test.js

# Test assets routes
npm test -- src/routes/assets.routes.test.js
```

All tests should pass with no errors.
