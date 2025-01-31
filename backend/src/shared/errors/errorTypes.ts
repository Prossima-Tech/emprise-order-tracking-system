import { AppError } from "./AppError";

export class ValidationError extends AppError {
    name: string;
    constructor(message: string, errors?: any[]) {
      super(message, 400, 'VALIDATION_ERROR', errors);
      this.name = 'ValidationError';
    }
  }
  
  export class AuthenticationError extends AppError {
    name: string;
    constructor(message: string = 'Authentication failed') {
      super(message, 401, 'AUTHENTICATION_ERROR');
      this.name = 'AuthenticationError';
    }
  }
  
  export class AuthorizationError extends AppError {
    name: string;
    constructor(message: string = 'You do not have permission to perform this action') {
      super(message, 403, 'AUTHORIZATION_ERROR');
      this.name = 'AuthorizationError';
    }
  }
  
  export class NotFoundError extends AppError {
    name: string;
    constructor(resource: string) {
      super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
      this.name = 'NotFoundError';
    }
  }
  
  export class ConflictError extends AppError {
    name: string;
    constructor(message: string) {
      super(message, 409, 'CONFLICT_ERROR');
      this.name = 'ConflictError';
    }
  }