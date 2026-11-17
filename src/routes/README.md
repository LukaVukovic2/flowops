# Route Components

This directory contains route guard components that handle authentication and authorization for protected routes in the FlowOps platform.

## Components

### ProtectedRoute

`ProtectedRoute` is a wrapper component that ensures only authenticated users can access wrapped content. It checks the authentication state and:

- Shows a loading spinner while authentication status is being verified
- Redirects unauthenticated users to the login page
- Preserves the intended destination for redirect after login
- Renders children when user is authenticated

**Requirements:** 1.6, 1.7

**Usage:**

```jsx
import { ProtectedRoute } from './routes';

// Protect a route
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

### RoleRoute

`RoleRoute` extends `ProtectedRoute` by also checking user roles. It ensures:

- User is authenticated (same as ProtectedRoute)
- User has one of the required roles
- Displays a Croatian error message when user lacks required permissions
- Shows both required and actual roles in error view
- Provides a back button in the error view

**Requirements:** 1.6, 1.7

**Usage:**

```jsx
import { RoleRoute } from './routes';

// Single role requirement
<Route
  path="/admin"
  element={
    <RoleRoute allowedRoles="Administrator">
      <AdminPanel />
    </RoleRoute>
  }
/>

// Multiple roles allowed
<Route
  path="/tickets"
  element={
    <RoleRoute allowedRoles={["Tehničar", "Administrator"]}>
      <TicketManagement />
    </RoleRoute>
  }
/>
```

## Props

### ProtectedRoute Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| children | React.ReactNode | Yes | Components to render if authenticated |

### RoleRoute Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| children | React.ReactNode | Yes | Components to render if authorized |
| allowedRoles | string \| string[] | Yes | Role(s) allowed to access this route |

## Roles

The FlowOps platform supports four user roles:

- **Posjetitelj** - Visitor with public access only
- **Registrirani_Korisnik** - Registered user with access to own tickets
- **Tehničar** - Technician/Editor with announcement management access
- **Administrator** - Full system access

## Authentication Flow

1. Component renders
2. `useAuth` hook provides authentication state
3. **If loading:** Show loading spinner
4. **If not authenticated:** Redirect to `/login` with original location preserved
5. **If authenticated (ProtectedRoute):** Render children
6. **If authenticated (RoleRoute):** Check role
   - **Has required role:** Render children
   - **Lacks required role:** Show Croatian error page

## Error Messages

All error messages are displayed in Croatian:

- **Loading:** "Učitavanje..."
- **No Access:** "Nemate pristup"
- **No Permission:** "Nemate potrebne dozvole za pristup ovoj stranici."
- **Back Button:** "Natrag"

## Testing

Both components have comprehensive test coverage:

- Loading state display
- Unauthenticated redirect behavior
- Authorized access rendering
- Unauthorized access error display
- Single and multiple role handling
- Error message content verification

Run tests:

```bash
npm test -- src/routes/ProtectedRoute.test.jsx src/routes/RoleRoute.test.jsx --run
```

## Dependencies

- `react` - Component library
- `react-router-dom` - Routing (Navigate, useLocation)
- `../hooks/useAuth` - Authentication context hook

## Example: App.jsx Integration

```jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute, RoleRoute } from './routes';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import TicketsPage from './pages/TicketsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <TicketsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/users"
          element={
            <RoleRoute allowedRoles="Administrator">
              <UserManagementPage />
            </RoleRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

## Design Notes

### Loading State

The loading spinner uses:
- Tailwind CSS for styling
- Dark theme (bg-neutral-900)
- Primary color accent (border-primary-500)
- Croatian text

### Error Page

The unauthorized error page features:
- Centered layout with max-width constraint
- Dark theme card with border
- Warning icon (SVG)
- Clear error message in Croatian
- Role information display
- Back button for navigation

### Redirect Behavior

When redirecting to login:
- Original location is preserved in router state
- Can be accessed after login to redirect back
- Uses React Router's `state` prop in Navigate

## Future Enhancements

Possible future improvements:

1. **Permission-based access** - Check specific permissions instead of just roles
2. **Custom error components** - Allow passing custom error UI
3. **Redirect URL customization** - Configure redirect destination
4. **Audit logging** - Log unauthorized access attempts
5. **Session timeout handling** - Graceful handling of expired sessions
