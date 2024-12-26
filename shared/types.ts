// shared/types.ts
export interface User {
    id: number;
    name: string;
    email: string;
  }
  
  export interface ApiResponse<T> {
    data: T;
    message: string;
    status: number;
  }