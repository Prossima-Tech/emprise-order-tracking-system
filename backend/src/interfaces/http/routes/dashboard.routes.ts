import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../../../domain/entities/User';

export function setupDashboardRoutes(
  dashboardController: DashboardController
) {
  const router = Router();

  router.get(
    '/dashboard/stats',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    dashboardController.getDashboardStats
  );

  router.get(
    '/dashboard/activities',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    dashboardController.getRecentActivities
  );

  router.get(
    '/dashboard/trends',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    dashboardController.getProcurementTrends
  );

  return router;
}