// src/components/routing/PrivateRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom'; // Used for redirection
import AuthContext from '../../context/auth/AuthContext'; // Import the context

// This component receives the component to render as 'children'
const PrivateRoute = ({ children }) => {
  // Get authentication state from context
  const authContext = useContext(AuthContext);
  const { isAuthenticated, loading } = authContext;

  // Handle the loading state:
  // While the authentication status is being checked (e.g., initial loadUser),
  // display a loading message or spinner instead of prematurely redirecting.
  if (loading) {
    return <div className="text-center mt-20">Loading...</div>; // Or replace with a spinner component
  }

  // If loading is finished and user is authenticated, render the child component
  if (isAuthenticated) {
    return children; // Render the component passed (e.g., <Dashboard />)
  }

  // If loading is finished and user is NOT authenticated, redirect to login page
  // The <Navigate> component performs the redirection.
  // 'replace' prop is often used to replace the current entry in history,
  // so the user doesn't get stuck in a redirect loop using the back button.
  return <Navigate to="/login" replace />;

};

export default PrivateRoute;