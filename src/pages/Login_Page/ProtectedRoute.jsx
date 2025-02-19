// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Corrected import: jwt-decode exports default

const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem('token');
  console.log('ProtectedRoute: Retrieved token:', token);

  if (!token) {
    console.log('ProtectedRoute: No token found, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  let decodedToken;
  try {
    decodedToken = jwtDecode(token);
    console.log('ProtectedRoute: Decoded token:', decodedToken);
  } catch (error) {
    console.error('ProtectedRoute: Error decoding token:', error);
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(decodedToken.role)) {
    console.log(
      'ProtectedRoute: Token role not allowed. Allowed roles:',
      allowedRoles,
      'but token has role:',
      decodedToken.role
    );
    return <Navigate to="/not-authorized" replace />;
  }

  console.log('ProtectedRoute: Access granted. Rendering children.');
  return children;
};

export default ProtectedRoute;
