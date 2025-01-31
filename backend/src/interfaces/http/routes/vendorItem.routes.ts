import { Router } from 'express';
import { VendorItemController } from '../controllers/VendorItemController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../../../domain/entities/User';

/**
 * @swagger
 * /vendors/{vendorId}/items:
 *   post:
 *     tags: [Vendor Items]
 *     summary: Assign item to vendor
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVendorItemDto'
 * 
 *   get:
 *     tags: [Vendor Items]
 *     summary: Get vendor items
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         schema:
 *           type: string
 * 
 * /vendors/{vendorId}/items/{itemId}:
 *   put:
 *     tags: [Vendor Items]
 *     summary: Update vendor item price
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateVendorItemDto'
 * 
 *   delete:
 *     tags: [Vendor Items]
 *     summary: Remove item from vendor
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         schema:
 *           type: string
 * 
 * /items/{itemId}/vendors:
 *   get:
 *     tags: [Vendor Items]
 *     summary: Get item vendors
 *     parameters:
 *       - in: path
 *         name: itemId
 *         schema:
 *           type: string
 */

export function vendorItemRoutes(controller: VendorItemController) {
  const router = Router();

  // Vendor perspective routes
  router.post('/vendors/:vendorId/items',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    controller.assignItemToVendor
  );

  router.get('/vendors/:vendorId/items',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    controller.getVendorItems
  );

  router.put('/vendors/:vendorId/items/:itemId',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    controller.updateVendorItemPrice
  );

  router.delete('/vendors/:vendorId/items/:itemId',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    controller.removeItemFromVendor
  );

  // Item perspective routes
  router.get('/items/:itemId/vendors',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    controller.getItemVendors
  );

  return router;
}