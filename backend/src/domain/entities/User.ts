export enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    STAFF = 'STAFF',
    USER = 'USER',
    BO_SPECIALIST = 'BO_SPECIALIST',
    PO_SPECIALIST = 'PO_SPECIALIST'
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