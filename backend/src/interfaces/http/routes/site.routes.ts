// interface/http/routes/site.routes.ts
import { Router } from 'express';
import { SiteController } from '../controllers/SiteController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../../../domain/entities/User';

/**
 * @swagger
 * /sites:
 *   post:
 *     tags: [Sites]
 *     summary: Create site
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSiteDto'
 *     responses:
 *       201:
 *         description: Site created
 * 
 *   get:
 *     tags: [Sites]
 *     summary: Get all sites
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: zoneId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of sites
 */
export function siteRoutes(controller: SiteController) {
  const router = Router();

  router.post('/',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.BO_SPECIALIST, UserRole.PO_SPECIALIST]),
    controller.createSite
  );

  router.put('/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.BO_SPECIALIST, UserRole.PO_SPECIALIST]),
    controller.updateSite
  );

  router.delete('/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.BO_SPECIALIST, UserRole.PO_SPECIALIST]),
    controller.deleteSite
  );

  router.get('/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.BO_SPECIALIST, UserRole.PO_SPECIALIST]),
    controller.getSite
  );

  router.get('/',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.BO_SPECIALIST, UserRole.PO_SPECIALIST]),
    controller.getAllSites
  );

  router.get('/:id/details',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.BO_SPECIALIST, UserRole.PO_SPECIALIST]),
    controller.getSiteDetails
  );

  router.get('/:id/loas',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.BO_SPECIALIST, UserRole.PO_SPECIALIST]),
    controller.getSiteLoas
  );

  router.get('/:id/purchase-orders',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.BO_SPECIALIST, UserRole.PO_SPECIALIST]),
    controller.getSitePurchaseOrders
  );

  return router;
}