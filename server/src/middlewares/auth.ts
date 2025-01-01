// middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import prisma from '../config/database';
import { User, UserRole } from '../types';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Authentication middleware
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
      return;
    }

    const decoded = jwt.verify(token, config.jwt.secret) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        department: true
      }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    req.user = user as unknown as User;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid authentication token'
    });
    return;
  }
};

// Role-based authorization middleware
export const authorize = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        success: false,
        error: 'Access denied'
      });
      return;
    }

    next();
  };
};