// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- Import Page Components ---
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProfileEdit from './pages/ProfileEdit';
import NotAuthorized from './pages/NotAuthorized'; // 1. Import NotAuthorized page
// Import Admin Pages
import UserListPage from './pages/admin/UserListPage'; // 1. Import admin pages
import ReportListPage from './pages/admin/ReportListPage';

// --- Import Layout Components ---
import Navbar from './components/layout/Navbar';

// --- Import Routing Components ---
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute'; // 1. Import AdminRoute

function App() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto p-4 mt-4">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Private User Routes */}
          <Route
            path="/dashboard"
            element={<PrivateRoute><Dashboard /></PrivateRoute>}
          />
          <Route
            path="/profile/edit"
            element={<PrivateRoute><ProfileEdit /></PrivateRoute>}
          />

          {/* --- Admin Routes --- */}
          {/* Use AdminRoute to protect these */}
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <UserListPage />
              </AdminRoute>
            }
          />
           <Route
            path="/admin/reports"
            element={
              <AdminRoute>
                <ReportListPage />
              </AdminRoute>
            }
          />
          {/* -------------------- */}

          {/* Not Authorized Route */}
          <Route path="/not-authorized" element={<NotAuthorized />} />


          {/* Catch-all 404 route */}
          <Route path="*" element={<div className="text-center mt-10"><h1>404 - Page Not Found</h1></div>} />

        </Routes>
      </main>
    </>
  );
}

export default App;