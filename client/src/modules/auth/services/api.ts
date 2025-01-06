// src/modules/auth/services/index.ts
import api from '../../../config/axios';
import type { 
  LoginInput, 
  RegisterInput, 
  AuthResponse 
} from '@emprise/shared/src/types/auth';

export const authService = {
  login: (data: LoginInput) => 
    api.post<AuthResponse>('/auth/login', data),
  
  register: (data: RegisterInput) => 
    api.post<AuthResponse>('/auth/register', data),
  
  me: () => 
    api.get<AuthResponse>('/auth/me'),
  
  logout: () => 
    api.post('/auth/logout'),
};