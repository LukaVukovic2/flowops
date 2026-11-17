# Ticket API Testing Guide

## Prerequisites

1. Backend server running: `npm start` from `backend/` directory
2. Database configured with tickets, ticket_history, and ticket_comments tables
3. JWT token from authentication endpoint

## Get JWT Token

First, authenticate to get a token:

```bash
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Save the returned token for subsequent requests.

## Test Endpoints

### 1. Create a Ticket

```bash
POST http://localhost:3000/api/v1/tickets
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Server nije dostupan",
  "description": "Web server ne odgovara na zahtjeve",
  "priority": "Visoka"
}
```

**Expected Response:** 201 Created with ticket object (status = "Nova")

### 2. List All Tickets

```bash
GET http://localhost:3000/api/v1/tickets
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:** 200 OK with tickets array and pagination

### 3. Filter Tickets by Status

```bash
GET http://localhost:3000/api/v1/tickets?status=Nova
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:** 200 OK with filtered tickets

### 4. Filter Tickets by Date Range

```bash
GET http://localhost:3000/api/v1/tickets?fromDate=2024-01-01T00:00:00Z&toDate=2024-12-31T23:59:59Z
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:** 200 OK with filtered tickets

### 5. Get Single Ticket

```bash
GET http://localhost:3000/api/v1/tickets/{ticket-id}
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:** 200 OK with ticket details including creator and assignee

### 6. Update Ticket

```bash
PUT http://localhost:3000/api/v1/tickets/{ticket-id}
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "Srednja"
}
```

**Expected Response:** 200 OK with updated ticket

### 7. Change Ticket Status (Tehničar or Administrator only)

```bash
PATCH http://localhost:3000/api/v1/tickets/{ticket-id}/status
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "status": "U radu"
}
```

**Expected Response:** 200 OK with updated ticket

### 8. Get Ticket History

```bash
GET http://localhost:3000/api/v1/tickets/{ticket-id}/history
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:** 200 OK with history array showing all changes

### 9. Get Ticket Comments

```bash
GET http://localhost:3000/api/v1/tickets/{ticket-id}/comments
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:** 200 OK with comments array and pagination

### 10. Add Comment to Ticket

```bash
POST http://localhost:3000/api/v1/tickets/{ticket-id}/comments
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "content": "Provjerit ću server logs i javim se uskoro"
}
```

**Expected Response:** 201 Created with comment object

## Authorization Testing

### Test 1: Registrirani_Korisnik Cannot Access Other User's Tickets

1. Create ticket as User A
2. Try to access that ticket as User B (Registrirani_Korisnik role)
3. **Expected:** 403 Forbidden with message "Nemate ovlasti za pristup ovom tiketu"

### Test 2: Registrirani_Korisnik Cannot Change Status

1. Create ticket as Registrirani_Korisnik
2. Try to change status using PATCH /tickets/{id}/status
3. **Expected:** 403 Forbidden with message "Nemate ovlasti za promjenu statusa tiketa"

### Test 3: Tehničar Can Access Assigned Tickets

1. Assign ticket to Tehničar (as Administrator)
2. Access ticket as that Tehničar
3. **Expected:** 200 OK with ticket details

### Test 4: Administrator Has Full Access

1. Access any ticket as Administrator
2. Update any ticket as Administrator
3. Change any ticket status as Administrator
4. **Expected:** All operations succeed (200 OK)

## Validation Testing

### Test Invalid Status

```bash
PATCH http://localhost:3000/api/v1/tickets/{ticket-id}/status
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "status": "InvalidStatus"
}
```

**Expected Response:** 400 Bad Request with Croatian error message

### Test Missing Required Fields

```bash
POST http://localhost:3000/api/v1/tickets
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "description": "Missing title"
}
```

**Expected Response:** 400 Bad Request with "Naslov je obavezan"

### Test Invalid Priority

```bash
POST http://localhost:3000/api/v1/tickets
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Test",
  "description": "Test",
  "priority": "InvalidPriority"
}
```

**Expected Response:** 400 Bad Request with "Nevažeći prioritet"

## Pagination Testing

```bash
GET http://localhost:3000/api/v1/tickets?page=1&limit=5
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:** 200 OK with:
- Maximum 5 tickets
- Pagination object with page=1, limit=5, total count, totalPages

## Error Response Format

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Croatian error message",
    "details": [
      {
        "field": "fieldName",
        "message": "Croatian field error"
      }
    ]
  }
}
```

## Success Indicators

✅ All endpoints return JSON responses  
✅ All error messages are in Croatian  
✅ New tickets have status "Nova"  
✅ Status changes record resolved_at/closed_at timestamps  
✅ All changes appear in ticket history  
✅ Authorization correctly enforced based on role  
✅ Filters work correctly  
✅ Pagination works correctly  

## Common Issues

1. **401 Unauthorized:** Token expired or missing - re-authenticate
2. **403 Forbidden:** Insufficient permissions for operation - check user role
3. **404 Not Found:** Ticket doesn't exist - verify ticket ID
4. **400 Bad Request:** Validation error - check request body format
5. **500 Server Error:** Database issue - check server logs and database connection
