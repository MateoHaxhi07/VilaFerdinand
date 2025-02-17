// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // If there's no token, redirect to login
    return <Navigate to="/login" replace />;
  }

  let decodedToken;
  try {
    decodedToken = jwtDecode(token);
  } catch (error) {
    // If token is invalid, redirect to login
    return <Navigate to="/login" replace />;
  }

  // If the user's role isn't in the allowed roles, redirect to a "Not Authorized" page.
  if (!allowedRoles.includes(decodedToken.role)) {
    return <Navigate to="/not-authorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
