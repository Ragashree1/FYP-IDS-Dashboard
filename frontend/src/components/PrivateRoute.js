import React from "react";
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth();

  if (!user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.userRole)) {
    // User's role is not authorized, redirect to home page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
