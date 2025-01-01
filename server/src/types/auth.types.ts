// src/types/auth.types.ts
export interface RegisterInput {
    email: string;
    password: string;
    name: string;
    role: string;
    departmentId: string;
  }
  
  export interface LoginInput {
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      departmentId: string;
      department?: {
        deptCode: string;
        deptName: string;
      };
    };
  }