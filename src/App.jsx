import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, RoleRoute } from './routes';
import UserManagementPage from './pages/admin/UserManagementPage';
import { LoginPage, RegisterPage } from './pages/auth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Temporary home route */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-neutral-900 text-neutral-50">
              <div className="container mx-auto px-4 py-8">
                <div className="card max-w-2xl mx-auto text-center">
                  <h1 className="text-4xl font-bold text-primary-500 mb-4">
                    FlowOps
                  </h1>
                  <p className="text-xl text-neutral-300 mb-6">
                    IT Operations and Workflow Automation Platform
                  </p>
                  <div className="flex gap-4 justify-center">
                    <a href="/admin/users" className="btn btn-primary">
                      Upravljanje korisnicima
                    </a>
                  </div>
                </div>
              </div>
            </div>
          }
        />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

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
