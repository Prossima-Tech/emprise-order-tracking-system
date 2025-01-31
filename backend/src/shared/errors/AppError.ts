export class AppError extends Error {
    constructor(
      public readonly message: string,
      public readonly statusCode: number = 400,
      public readonly code?: string,
      public readonly errors?: any[]
    ) {
      super(message);
      this.name = 'AppError';
      Error.captureStackTrace(this, this.constructor);
    }
  }