// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

// Custom error classes
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class DuplicateError extends AppError {
  constructor(resource: string) {
    super(`${resource} already exists`, 409);
    this.name = 'DuplicateError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

// Prisma error mapping
const prismaErrorMap: Record<string, (err: Prisma.PrismaClientKnownRequestError) => AppError> = {
  P2002: (err) => {
    const target = (err.meta?.target as string[])?.join(', ') || 'field';
    return new DuplicateError(`Record with this ${target} already exists`);
  },
  P2025: () => new NotFoundError('Record'),
  P2003: () => new ValidationError('Invalid input data: Foreign key constraint failed'),
  P2014: () => new ValidationError('Invalid input data: Invalid ID'),
  P2000: () => new ValidationError('Invalid input data: Invalid value'),
};

// Main error handler middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const handler = prismaErrorMap[err.code];
    const error = handler ? handler(err) : new AppError('Database error occurred', 500);
    
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: err.code,
      ...(process.env.NODE_ENV === 'development' && { detail: err.message })
    });
    return;
  }

  // Handle custom application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.code && { code: err.code })
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'Token expired'
    });
    return;
  }

  // Handle validation errors (e.g., from express-validator)
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: err.message
    });
    return;
  }

  // Handle all other errors
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async handler wrapper
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

