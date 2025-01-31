// src/routes/userRoutes.ts

import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate, authorize } from '../middlewares/auth';
import { UserRole } from '../types';

const router = Router();

/**
 * Base path: /api/v1/users
 */

// Get approvers list
router.get('/approvers',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  UserController.getApprovers
);

// Get all users (with filters)
router.get('/',
  authenticate,
  authorize([UserRole.ADMIN]),
  UserController.listUsers
);

export default router;