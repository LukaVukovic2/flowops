import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, RoleRoute } from './routes';
import UserManagementPage from './pages/admin/UserManagementPage';
import DashboardPage from './pages/admin/DashboardPage';
import { LoginPage, RegisterPage } from './pages/auth';
import AnnouncementsPage from './pages/announcements/AnnouncementsPage';
import TicketsPage from './pages/tickets/TicketsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home route - redirect to dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />

        {/* Dashboard route - accessible to authenticated users */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Ticket routes - accessible to authenticated users */}
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <TicketsPage />
            </ProtectedRoute>
          }
        />

        {/* Announcement routes - accessible to all users (including public) */}
        <Route path="/announcements" element={<AnnouncementsPage />} />

        {/* Admin routes */}
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

export default App;
