// src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
  /**
   * Register new user
   * @route POST /api/v1/auth/register
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name, role, departmentId } = req.body;

      const result = await AuthService.register({
        email,
        password,
        name,
        role,
        departmentId
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * @route POST /api/v1/auth/login
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login({
        email,
        password
      });

      res.json({
        success: true,
        data: result,
        message: 'Logged in successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user
   * @route GET /api/v1/auth/me
   */
  static async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      next(error);
    }
  }
}