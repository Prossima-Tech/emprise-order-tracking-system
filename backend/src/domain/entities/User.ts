export enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    STAFF = 'STAFF'
  }
  
  export interface User {
    id: string;
    email: string;
    name: string;
    password: string;  // Will be hashed
    role: UserRole;
    department?: string;
    createdAt: Date;
    updatedAt: Date;
  }