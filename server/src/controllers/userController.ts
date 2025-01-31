// src/controllers/userController.ts

import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/userModel';
import { UserRole } from '../types';

export class UserController {
  /**
   * Get list of users who can be approvers
   */
  static async getApprovers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const approvers = await UserModel.findApprovers();

      res.json({
        success: true,
        data: approvers
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all users with optional filters
   */
  static async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, search, page = '1', limit = '10' } = req.query;

      const filters: any = {};
      if (role) filters.role = role;
      if (search) filters.search = search;

      const users = await UserModel.findAll(filters, {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }
}