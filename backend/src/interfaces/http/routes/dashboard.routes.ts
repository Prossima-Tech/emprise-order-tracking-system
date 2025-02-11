import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../../../domain/entities/User';

export function setupDashboardRoutes(
  dashboardController: DashboardController
) {
  const router = Router();

  router.get(
    '/stats',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    dashboardController.getDashboardStats
  );

  router.get(
    '/activities',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    dashboardController.getRecentActivities
  );

  router.get(
    '/trends',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    dashboardController.getProcurementTrends
  );

  return router;
}