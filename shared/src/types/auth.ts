import { UserRole, User } from './user';

export interface LoginInput {
    email: string;
    password: string;
  }
  
  export interface RegisterInput {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    departmentId: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: User;
  }