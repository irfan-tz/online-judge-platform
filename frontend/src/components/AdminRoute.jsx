import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-loading" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="loading-spinner">⏳</div>
        <p>Loading...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth/signin?redirect=/admin/dashboard" replace />;
  }

  // If not admin, redirect to access denied page or home
  if (!isAdmin) {
    return (
      <div className="access-denied" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You must be an administrator to access this page.</p>
        <a href="/" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.5rem 1rem', background: '#f44336', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          Return to Home
        </a>
      </div>
    );
  }

  // If admin, render the protected component
  return children;
};

export default AdminRoute;
