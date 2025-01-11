// src/routes/public.tsx
import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { SuspenseWrapper } from '../components/shared/SuspenseWrapper';

const Login = lazy(() => import('../modules/auth/pages/LoginPage'));
// const ForgotPassword = lazy(() => import('../modules/auth/pages/ForgotPasswordPage'));

export const publicRoutes: RouteObject[] = [
  {
    path: 'login',
    element: <SuspenseWrapper><Login /></SuspenseWrapper>,
  },
  // {
  //   path: 'forgot-password',
  //   element: <SuspenseWrapper><ForgotPassword /></SuspenseWrapper>,
  // },
];