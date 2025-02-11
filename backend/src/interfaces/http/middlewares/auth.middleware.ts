import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../../../shared/types/auth.types';
import { UserRole } from '../../../domain/entities/User';
import config from '../../../config';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authMiddleware(requiredRoles: UserRole[] = []) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
      
      req.user = decoded;
      console.log(req.user);

      // Check role if required
      if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.role)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
  };
}