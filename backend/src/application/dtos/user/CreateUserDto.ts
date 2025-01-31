import { UserRole } from '../../../domain/entities/User';

export interface CreateUserDto {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    department?: string;
}