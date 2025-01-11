// src/routes/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { AuthLayout } from '../components/layout/AuthLayout';
import { ProtectedRoute } from './protectedRoute';
import { publicRoutes } from './public';
import { privateRoutes } from './private';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          ...privateRoutes,
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: publicRoutes,
  },
]);