# Dashboard Recent Activity Endpoint Implementation

## Overview

The recent activity endpoint (`GET /api/v1/dashboard/recent-activity`) provides users with a view of recent ticket changes and newly published announcements. The endpoint implements comprehensive role-based filtering to ensure users only see activity appropriate to their permission level.

## Endpoint Details

### Endpoint
```
GET /api/v1/dashboard/recent-activity
```

### Authentication
- **Required**: Yes
- **Middleware**: `authMiddleware`
- All requests must include a valid JWT token in the Authorization header

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 10 | Number of items to return for each activity type |

### Response Structure

```json
{
  "recentTickets": [
    {
      "id": "uuid",
      "title": "Server nije dostupan",
      "status": "Nova",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T11:00:00Z",
      "creator": {
        "first_name": "Ivan",
        "last_name": "Horvat"
      }
    }
  ],
  "recentAnnouncements": [
    {
      "id": "uuid",
      "title": "Planirano održavanje sustava",
      "published_at": "2024-01-15T09:00:00Z",
      "author": {
        "first_name": "Ana",
        "last_name": "Kovač"
      }
    }
  ]
}
```

## Role-Based Filtering

### Posjetitelj (Visitor)
- **Tickets**: No tickets visible (empty array)
- **Announcements**: Published announcements only
- **Implementation**: Ticket query filtered by impossible ID match

### Registrirani_Korisnik (Registered User)
- **Tickets**: Own tickets only (where `creator_id = userId`)
- **Announcements**: Published announcements only
- **Implementation**: Ticket query filtered by creator_id

### Tehničar (Technician)
- **Tickets**: Assigned tickets only (where `assignee_id = userId`)
- **Announcements**: Published announcements only
- **Implementation**: Ticket query filtered by assignee_id

### Administrator
- **Tickets**: All tickets (no filter)
- **Announcements**: Published announcements only
- **Implementation**: No filter on tickets

## Data Ordering

### Recent Tickets
- Ordered by `updated_at` in **descending** order (most recently updated first)
- Shows tickets that have had recent activity (status changes, comments, updates)

### Recent Announcements
- Ordered by `published_at` in **descending** order (most recently published first)
- Only includes published announcements (`is_published = true`)
- Excludes soft-deleted announcements (`deleted_at IS NULL`)

## Database Queries

### Tickets Query (Administrator example)
```javascript
const ticketQuery = supabase
  .from('tickets')
  .select(`
    id,
    title,
    status,
    created_at,
    updated_at,
    creator:users!tickets_creator_id_fkey(first_name, last_name)
  `)
  .order('updated_at', { ascending: false })
  .limit(limit);
```

### Announcements Query (All roles)
```javascript
const announcementQuery = supabase
  .from('announcements')
  .select(`
    id,
    title,
    published_at,
    author:users!announcements_author_id_fkey(first_name, last_name)
  `)
  .eq('is_published', true)
  .is('deleted_at', null)
  .order('published_at', { ascending: false })
  .limit(limit);
```

## Error Handling

### Database Errors
If a database query fails:
- Status code: `500`
- Error response:
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Greška prilikom dohvaćanja nedavne aktivnosti"
  }
}
```
- Error logged to console for debugging

### Invalid Parameters
- Invalid `limit` parameter (e.g., "invalid"): Falls back to default value of 10
- Negative or zero `limit`: Accepted by database (Supabase handles gracefully)

## Implementation Files

### Controller
**File**: `src/controllers/dashboard.controller.js`

```javascript
export async function getRecentActivity(req, res) {
  try {
    const { userId, role } = req.user;
    const limit = parseInt(req.query.limit) || 10;

    const activity = await DashboardService.getRecentActivity(userId, role, limit);

    res.status(200).json(activity);
  } catch (error) {
    console.error('Error getting recent activity:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Greška prilikom dohvaćanja nedavne aktivnosti'
      }
    });
  }
}
```

### Service
**File**: `src/services/dashboard.service.js`

Key role-based filtering logic:
```javascript
// Posjetitelj - no tickets
if (role === 'Posjetitelj') {
  ticketQuery = ticketQuery.eq('id', '00000000-0000-0000-0000-000000000000');
}
// Registrirani_Korisnik - own tickets
else if (role === 'Registrirani_Korisnik') {
  ticketQuery = ticketQuery.eq('creator_id', userId);
}
// Tehničar - assigned tickets
else if (role === 'Tehničar') {
  ticketQuery = ticketQuery.eq('assignee_id', userId);
}
// Administrator - all tickets (no filter)
```

### Routes
**File**: `src/routes/dashboard.routes.js`

```javascript
router.get('/recent-activity', authMiddleware, DashboardController.getRecentActivity);
```

## Requirements Validation

### Requirement 6.3
✅ **"THE FLOWOPS_System SHALL display recent Announcements on the Dashboard"**
- Recent announcements are fetched and returned
- Ordered by published_at descending
- Limited to specified number (default 10)

### Additional Design Requirements
✅ **Role-based filtering** - Implemented for all four roles
✅ **Ticket changes** - Recent tickets ordered by updated_at
✅ **Author/Creator information** - Nested user objects included
✅ **Published only** - Announcements filtered by is_published = true
✅ **Croatian error messages** - Error responses in Croatian

## Testing

### Unit Tests
**File**: `src/controllers/dashboard.controller.test.js`
- Tests for role-based filtering logic
- Tests for default and custom limit parameters
- Tests for data structure validation
- 8 passing tests

### Integration Tests
**File**: `src/routes/dashboard.routes.test.js`
- Tests for endpoint configuration
- Tests for authentication requirement
- Tests for query structure and ordering
- Tests for error handling
- 16 passing tests

### Manual Testing

```bash
# Test as Administrator (all tickets)
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/dashboard/recent-activity"

# Test with custom limit
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/dashboard/recent-activity?limit=5"

# Test without authentication (should return 401)
curl "http://localhost:3000/api/v1/dashboard/recent-activity"
```

## Performance Considerations

### Query Performance
- Indexes exist on `updated_at` (tickets) and `published_at` (announcements)
- Limited result set (default 10 items)
- Foreign key joins use proper indexes

### Caching
- No caching implemented for recent activity (intentional for real-time updates)
- Dashboard statistics are cached separately (30 seconds)

## Security

### Authentication
- JWT token required for all requests
- User identity verified via authMiddleware

### Authorization
- Role-based filtering prevents unauthorized data access
- Posjetitelj cannot see any tickets
- Registrirani_Korisnik can only see own tickets
- Tehničar can only see assigned tickets

### SQL Injection Prevention
- All queries use parameterized Supabase methods
- No string concatenation of user input

## Future Enhancements

Potential improvements for future iterations:
1. Add filtering by date range (e.g., last 7 days)
2. Add pagination for very active systems
3. Include ticket priority in response
4. Add announcement category information
5. Add real-time updates via WebSocket subscriptions
6. Cache results for 30-60 seconds per user/role combination

## Conclusion

The recent activity endpoint is **fully implemented** and meets all requirements:
- ✅ Returns recent ticket changes
- ✅ Returns recent announcements
- ✅ Implements role-based filtering
- ✅ Includes proper data structure with nested user information
- ✅ Handles errors gracefully with Croatian messages
- ✅ Tested with comprehensive unit and integration tests

**Status**: Task 14.2 Complete ✓
