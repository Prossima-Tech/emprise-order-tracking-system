import { Router } from 'express';
import { ShippingAddressController } from '../controllers/ShippingAddressController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../../../domain/entities/User';

/**
 * @swagger
 * /shipping-addresses:
 *   post:
 *     tags: [ShippingAddresses]
 *     summary: Create shipping address
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               address:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Shipping address created
 *
 *   get:
 *     tags: [ShippingAddresses]
 *     summary: Get all shipping addresses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of shipping addresses
 */
export function shippingAddressRoutes(controller: ShippingAddressController) {
  const router = Router();

  // POST route for creating a shipping address
  router.post('/',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.PO_SPECIALIST]),
    controller.createShippingAddress
  );

  // GET routes for shipping address collections
  router.get('/',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.PO_SPECIALIST]),
    controller.getAllShippingAddresses
  );

  // Routes with :id parameter
  router.get('/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.PO_SPECIALIST]),
    controller.getShippingAddress
  );

  router.put('/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.PO_SPECIALIST]),
    controller.updateShippingAddress
  );

  router.delete('/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.PO_SPECIALIST]),
    controller.deleteShippingAddress
  );

  return router;
}
