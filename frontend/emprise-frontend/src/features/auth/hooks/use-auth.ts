import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../lib/stores/auth-store';
import { useToast } from '../../../hooks/use-toast-app';
import apiClient from '../../../lib/utils/api-client';
import { setAuthToken, setUser } from '../../../lib/utils/auth';
import type { LoginFormData, RegisterFormData } from '../types/auth';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser: setStoreUser, setIsAuthenticated } = useAuthStore();
  const { showSuccess, showError } = useToast();

  const login = async (credentials: LoginFormData) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/auth/login', credentials);
      const { token, user } = response.data;

      setAuthToken(token);
      setUser(user);
      setStoreUser(user);
      setIsAuthenticated(true);

      showSuccess('Successfully logged in');
      navigate('/dashboard');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/auth/register', data);
      const { token, user } = response.data;

      setAuthToken(token);
      setUser(user);
      setStoreUser(user);
      setIsAuthenticated(true);

      showSuccess('Account created successfully');
      navigate('/dashboard');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    register,
    loading,
  };
}