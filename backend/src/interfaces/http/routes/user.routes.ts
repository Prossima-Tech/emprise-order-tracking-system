import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../../../domain/entities/User';

export const userRoutes = (controller: UserController) => {
  const router = Router();

  // Only allow ADMIN users to access user information
  router.get('/', authMiddleware([UserRole.ADMIN]), controller.getAllUsers);
  router.get('/:id', authMiddleware([UserRole.ADMIN]), controller.getUserById);

  return router;
};