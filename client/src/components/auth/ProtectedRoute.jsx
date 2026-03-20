import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = () => {
  const { session } = useAuth();

  if (!session) {
    // Redirect to landing/showcase page, not login page
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
