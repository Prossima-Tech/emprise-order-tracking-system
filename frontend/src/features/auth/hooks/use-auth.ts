import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../lib/stores/auth-store';

import apiClient from '../../../lib/utils/api-client';
import { getDefaultRouteForRole, setAuthToken, setUser } from '../../../lib/utils/auth';
import type { LoginFormData, RegisterFormData } from '../types/auth';
import { useToast } from '../../../hooks/use-toast';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser: setStoreUser, setIsAuthenticated } = useAuthStore();
  const { toast } = useToast();

  const handleError = (error: any) => {
    const errorMessage = error.response?.data?.message;
    
    if (errorMessage?.includes('already exists')) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "An account with this email already exists. Please try logging in instead.",
      });
    } else if (errorMessage?.includes('credentials')) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password. Please check your credentials and try again.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage || "An unexpected error occurred. Please try again later.",
      });
    }
  };

  const login = async (credentials: LoginFormData) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/auth/login', credentials);
      const { token, user } = response.data;

      setAuthToken(token);
      setUser(user);
      setStoreUser(user);
      setIsAuthenticated(true);

      toast({
        title: "Success",
        description: "Successfully logged in. Welcome back!",
      });
      
      const defaultRoute = getDefaultRouteForRole(user.role);
      navigate(defaultRoute);
    } catch (error: any) {
      handleError(error);
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

      toast({
        title: "Success",
        description: "Account created successfully. Welcome to the platform!",
      });
      
      const defaultRoute = getDefaultRouteForRole(user.role);
      navigate(defaultRoute);
    } catch (error: any) {
      handleError(error);
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