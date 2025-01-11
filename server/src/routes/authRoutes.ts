// src/routes/authRoutes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRegister, validateLogin } from '../middlewares/validation';
import { authenticate, authorize } from '../middlewares/auth';
import { UserRole } from '../types';

const router = Router();

// Register new user (only admins can register new users)
router.post('/register',
  // authenticate,
  // authorize([UserRole.ADMIN]),
  validateRegister,
  AuthController.register
);

// Login
router.post('/login',
  validateLogin,
  AuthController.login
);

// Get current user
router.get('/me',
  authenticate,
  AuthController.getCurrentUser
);

export default router;