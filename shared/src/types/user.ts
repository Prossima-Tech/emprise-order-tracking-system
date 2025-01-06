export enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    USER = 'USER',
    VENDOR = 'VENDOR'
  }
  
  export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    departmentId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Department {
    id: string;
    deptCode: string;
    deptName: string;
    parentDeptId?: string;
    isActive: boolean;
  }