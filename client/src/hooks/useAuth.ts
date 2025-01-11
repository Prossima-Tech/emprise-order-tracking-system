// src/hooks/useAuth.ts
import { useAppSelector, useAppDispatch } from './redux';
import { login, logout, checkAuthStatus } from '../store/slices/authSlice';
import type { LoginInput } from '../types/auth';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error, isAuthenticated, checkingAuth } = useAppSelector(
    (state) => state.auth
  );

  const handleLogin = async (credentials: LoginInput) => {
    try {
      await dispatch(login(credentials)).unwrap();
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const checkAuth = () => {
    dispatch(checkAuthStatus());
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    checkingAuth,
    login: handleLogin,
    logout: handleLogout,
    checkAuth,
  };
};