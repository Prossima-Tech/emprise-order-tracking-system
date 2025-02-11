import { Router } from 'express';
import { ItemController } from '../controllers/ItemController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../../../domain/entities/User';

/**
 * @swagger
 * /items:
 *   post:
 *     tags: [Items]
 *     summary: Create item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateItemDto'
 *     responses:
 *       201:
 *         description: Item created
 * 
 *   get:
 *     tags: [Items]
 *     summary: Get all items
 *     parameters:
 *       - $ref: '#/components/parameters/paginationLimit'
 *       - $ref: '#/components/parameters/paginationOffset'
 *     responses:
 *       200:
 *         description: List of items
 * 
 * /items/{id}:
 *   get:
 *     tags: [Items]
 *     summary: Get item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *   
 *   put:
 *     tags: [Items]
 *     summary: Update item
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateItemDto'
 *   
 *   delete:
 *     tags: [Items]
 *     summary: Delete item
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 */

export function itemRoutes(controller: ItemController) {
  const router = Router();

  router.post('/',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.PO_SPECIALIST]),
    controller.createItem
  );

  router.put('/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.PO_SPECIALIST]),
    controller.updateItem
  );

  router.delete('/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.PO_SPECIALIST]),
    controller.deleteItem
  );

  router.get('/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.PO_SPECIALIST]),
    controller.getItem
  );

  router.get('/',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.PO_SPECIALIST]),
    controller.getAllItems
  );

  router.get('/:id/price-history',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.PO_SPECIALIST]),
    controller.getPriceHistory
  );

  return router;
}