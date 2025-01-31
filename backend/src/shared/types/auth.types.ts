import { UserRole } from '../../domain/entities/User';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  id: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}