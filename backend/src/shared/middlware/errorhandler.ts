// shared/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
// import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

interface ErrorResponse {
  status: string;
  message: string;
  code?: string;
  errors?: any[];
  stack?: string;
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
    next: NextFunction    
) => {
  console.error('Error:', {
    name: error.name,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });

  let response: ErrorResponse = {
    status: 'error',
    message: 'Internal server error'
  };

  // Handle custom AppError instances
  if (error instanceof AppError) {
    response = {
      status: 'error',
      message: error.message,
      code: error.code,
      errors: error.errors,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };
    return res.status(error.statusCode).json(response);
  }

  // Handle Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    switch ((error as PrismaClientKnownRequestError).code) {
      case 'P2002': // Unique constraint violation
        response = {
          status: 'error',
          message: 'A record with this data already exists',
          code: 'UNIQUE_CONSTRAINT_VIOLATION'
        };
        return res.status(409).json(response);
      case 'P2014': // Invalid ID
        response = {
          status: 'error',
          message: 'Invalid ID provided',
          code: 'INVALID_ID'
        };
        return res.status(400).json(response);
      case 'P2003': // Foreign key constraint violation
        response = {
          status: 'error',
          message: 'Related record not found',
          code: 'FOREIGN_KEY_VIOLATION'
        };
        return res.status(400).json(response);
      default:
        response = {
          status: 'error',
          message: 'Database operation failed',
          code: 'DATABASE_ERROR'
        };
        return res.status(500).json(response);
    }
  }

  // Handle Zod validation errors
//   if (error instanceof ZodError) {
//     response = {
//       status: 'error',
//       message: 'Validation failed',
//       code: 'VALIDATION_ERROR',
//       errors: error.errors.map(err => ({
//         field: err.path.join('.'),
//         message: err.message
//       }))
//     };
//     return res.status(400).json(response);
//   }

  // Handle JWT errors
  if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
    response = {
      status: 'error',
      message: error instanceof TokenExpiredError ? 'Token has expired' : 'Invalid token',
      code: 'INVALID_TOKEN'
    };
    return res.status(401).json(response);
  }

  // Handle Multer errors
  if (error instanceof multer.MulterError) {
    response = {
      status: 'error',
      message: error.message,
      code: 'FILE_UPLOAD_ERROR'
    };
    return res.status(400).json(response);
  }

  // Handle validation errors from express-validator
  if (error.name === 'ValidationError') {
    response = {
      status: 'error',
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: [error.message]
    };
    return res.status(400).json(response);
  }

  // Handle file size error
  if (error.name === 'PayloadTooLargeError') {
    response = {
      status: 'error',
      message: 'File size too large',
      code: 'FILE_TOO_LARGE'
    };
    return res.status(413).json(response);
  }

  // Only include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  // Generic error handler
  res.status(500).json(response);
};