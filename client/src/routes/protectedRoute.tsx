// src/routes/protectedRoute.tsx
import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spin } from 'antd';

export const ProtectedRoute = () => {
  const { isAuthenticated, checkingAuth, checkAuth } = useAuth();

  useEffect(() => {
    console.log('Checking auth status...');
    checkAuth();
  }, []);

  console.log('Auth state:', { isAuthenticated, checkingAuth });

  if (checkingAuth) {
    return (
      <div className="font-sans antialiased text-gray-900 bg-gray-50" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};