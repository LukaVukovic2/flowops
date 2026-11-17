# ProtectedRoute and RoleRoute Integration Example

This document shows how to update `App.jsx` to use the new `ProtectedRoute` and `RoleRoute` components.

## Complete App.jsx Example

```jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, RoleRoute } from './routes';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Public pages
import HomePage from './pages/public/HomePage';
import PublicAnnouncementsPage from './pages/public/PublicAnnouncementsPage';

// Protected pages (any authenticated user)
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import MyTicketsPage from './pages/profile/MyTicketsPage';

// Admin pages (Administrator only)
import UserManagementPage from './pages/admin/UserManagementPage';
import WorkflowManagementPage from './pages/admin/WorkflowManagementPage';
import AuditLogPage from './pages/admin/AuditLogPage';
import SystemSettingsPage from './pages/admin/SystemSettingsPage';

// Ticket pages (Registrirani_Korisnik, Tehničar, Administrator)
import TicketsPage from './pages/TicketsPage';
import TicketDetailPage from './pages/TicketDetailPage';

// Announcement pages (Tehničar, Administrator for management)
import AnnouncementsPage from './pages/AnnouncementsPage';
import AnnouncementDetailPage from './pages/AnnouncementDetailPage';
import AnnouncementManagementPage from './pages/AnnouncementManagementPage';

// Asset pages (Tehničar, Administrator)
import AssetsPage from './pages/AssetsPage';
import AssetDetailPage from './pages/AssetDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - no authentication required */}
        <Route path="/" element={<HomePage />} />
        <Route path="/announcements" element={<PublicAnnouncementsPage />} />
        <Route path="/announcements/:id" element={<AnnouncementDetailPage />} />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected routes - any authenticated user */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-tickets"
          element={
            <ProtectedRoute>
              <MyTicketsPage />
            </ProtectedRoute>
          }
        />

        {/* Ticket routes - accessible to authenticated users */}
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <TicketsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute>
              <TicketDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Announcement management - Tehničar and Administrator only */}
        <Route
          path="/admin/announcements"
          element={
            <RoleRoute allowedRoles={['Tehničar', 'Administrator']}>
              <AnnouncementManagementPage />
            </RoleRoute>
          }
        />

        {/* Asset management - Tehničar and Administrator only */}
        <Route
          path="/assets"
          element={
            <RoleRoute allowedRoles={['Tehničar', 'Administrator']}>
              <AssetsPage />
            </RoleRoute>
          }
        />

        <Route
          path="/assets/:id"
          element={
            <RoleRoute allowedRoles={['Tehničar', 'Administrator']}>
              <AssetDetailPage />
            </RoleRoute>
          }
        />

        {/* Admin routes - Administrator only */}
        <Route
          path="/admin/users"
          element={
            <RoleRoute allowedRoles="Administrator">
              <UserManagementPage />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/workflows"
          element={
            <RoleRoute allowedRoles="Administrator">
              <WorkflowManagementPage />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/audit-logs"
          element={
            <RoleRoute allowedRoles="Administrator">
              <AuditLogPage />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <RoleRoute allowedRoles="Administrator">
              <SystemSettingsPage />
            </RoleRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## Route Organization by Access Level

### Public Routes (No Authentication)
- `/` - Home page
- `/announcements` - Public announcements list
- `/announcements/:id` - Announcement detail
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Password reset

### Authenticated Routes (ProtectedRoute)
Any authenticated user can access:
- `/dashboard` - Main dashboard
- `/profile` - User profile
- `/my-tickets` - User's own tickets
- `/tickets` - Tickets list (filtered by role)
- `/tickets/:id` - Ticket detail

### Tehničar/Administrator Routes (RoleRoute)
Requires Tehničar OR Administrator role:
- `/admin/announcements` - Announcement management
- `/assets` - Asset list
- `/assets/:id` - Asset detail

### Administrator Routes (RoleRoute)
Requires Administrator role only:
- `/admin/users` - User management
- `/admin/workflows` - Workflow automation
- `/admin/audit-logs` - Audit logs
- `/admin/settings` - System settings

## Migration Guide

### Before (inline protection)

```jsx
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <div>No access</div>;
  }

  return children;
};
```

### After (dedicated components)

```jsx
import { ProtectedRoute, RoleRoute } from './routes';

// For any authenticated user
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>

// For specific role(s)
<RoleRoute allowedRoles="Administrator">
  <AdminPanel />
</RoleRoute>

// For multiple roles
<RoleRoute allowedRoles={['Tehničar', 'Administrator']}>
  <AssetManagement />
</RoleRoute>
```

## Benefits of the New Components

1. **Cleaner code** - No need to inline protection logic in App.jsx
2. **Consistent UI** - Same loading and error states everywhere
3. **Croatian localization** - Built-in Croatian error messages
4. **Better UX** - Professional loading spinners and error pages
5. **Tested** - Comprehensive test coverage
6. **Reusable** - Import once, use anywhere
7. **Maintainable** - Changes to protection logic in one place

## Testing Protected Routes

### Manual Testing Checklist

Test each protected route:

1. **Not authenticated:**
   - [ ] Redirects to login page
   - [ ] Preserves intended destination
   - [ ] After login, redirects to originally requested page

2. **Authenticated without required role:**
   - [ ] Shows "Nemate pristup" error
   - [ ] Displays required vs actual role
   - [ ] Back button works

3. **Authenticated with required role:**
   - [ ] Page loads successfully
   - [ ] Content renders correctly
   - [ ] Navigation works

### Automated Testing Example

```javascript
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import * as useAuthModule from './hooks/useAuth';

it('should protect admin route', () => {
  // Mock non-admin user
  useAuthModule.useAuth.mockReturnValue({
    isAuthenticated: true,
    isLoading: false,
    user: { role: 'Registrirani_Korisnik' },
  });

  render(
    <MemoryRouter initialEntries={['/admin/users']}>
      <Routes>
        <Route
          path="/admin/users"
          element={
            <RoleRoute allowedRoles="Administrator">
              <div>Admin Panel</div>
            </RoleRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );

  // Should show error, not admin content
  expect(screen.getByText('Nemate pristup')).toBeInTheDocument();
  expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
});
```

## Common Patterns

### Dashboard with Role-Based Content

```jsx
// Dashboard is accessible to all authenticated users,
// but shows different content based on role
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

Inside `DashboardPage.jsx`:
```jsx
import { useAuth } from '../hooks/useAuth';

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      {user.role === 'Administrator' && <AdminDashboard />}
      {user.role === 'Tehničar' && <TechnicianDashboard />}
      {user.role === 'Registrirani_Korisnik' && <UserDashboard />}
    </div>
  );
}
```

### Layout with Protected Content

```jsx
// Wrap the entire app layout in ProtectedRoute
<Route
  path="/app/*"
  element={
    <ProtectedRoute>
      <AppLayout>
        <Routes>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          {/* ... more routes ... */}
        </Routes>
      </AppLayout>
    </ProtectedRoute>
  }
/>
```

### Conditional Navigation Links

```jsx
import { useAuth } from '../hooks/useAuth';

function Navbar() {
  const { user, isAuthenticated } = useAuth();

  return (
    <nav>
      {isAuthenticated && <Link to="/dashboard">Dashboard</Link>}
      {isAuthenticated && <Link to="/tickets">Tiketi</Link>}
      
      {user?.role === 'Tehničar' || user?.role === 'Administrator' ? (
        <Link to="/assets">Imovina</Link>
      ) : null}
      
      {user?.role === 'Administrator' && (
        <>
          <Link to="/admin/users">Korisnici</Link>
          <Link to="/admin/workflows">Automatizirani procesi</Link>
        </>
      )}
    </nav>
  );
}
```

## Troubleshooting

### Issue: Infinite redirect loop
**Solution:** Ensure login page is NOT wrapped in ProtectedRoute

### Issue: Error "useAuth must be used within AuthProvider"
**Solution:** Wrap App with AuthProvider in main.jsx:
```jsx
<AuthProvider>
  <App />
</AuthProvider>
```

### Issue: User redirected to login even when authenticated
**Solution:** Check that token is valid and not expired. Verify localStorage contains token.

### Issue: Tests hang indefinitely
**Solution:** Wrap test routes in proper Router context with Routes/Route components, not just MemoryRouter.
