// src/components/routing/AdminRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../context/auth/AuthContext';

// Wraps components/pages that should only be accessible by Admins
const AdminRoute = ({ children }) => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, loading, user } = authContext;

  // 1. Handle Loading State
  // Wait until authentication status and user data are loaded
  if (loading) {
    return <div className="text-center mt-20">Checking authorization...</div>; // Or a spinner
  }

  // 2. Handle Not Authenticated
  // If loading is done and user is not logged in at all
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // Redirect to login
  }

  // 3. Handle Authenticated but Not Admin
  // If user is logged in BUT their role is not 'Admin'
  if (user && user.role !== 'Admin') {
    // Redirect non-admins away (e.g., back to dashboard or a specific 'forbidden' page)
    console.log('AdminRoute: Access denied. User is not an Admin.');
    // Option A: Redirect to dashboard
    // return <Navigate to="/dashboard" replace />;
    // Option B: Redirect to a dedicated 'Not Authorized' page (let's plan for this)
    return <Navigate to="/not-authorized" replace />;
  }

  // 4. Handle Authenticated Admin User
  // If loading is done, user is authenticated, AND user role is 'Admin'
  if (isAuthenticated && user && user.role === 'Admin') {
    return children; // Render the component intended for Admins
  }

  // Fallback case (shouldn't ideally be reached if logic above is sound)
  console.warn('AdminRoute: Unexpected state, redirecting to login.');
  return <Navigate to="/login" replace />;

};

export default AdminRoute;