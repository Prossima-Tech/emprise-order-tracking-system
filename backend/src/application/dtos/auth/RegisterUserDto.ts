import { UserRole } from '../../../domain/entities/User';

export interface RegisterUserDto {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    department?: string;
  }
  