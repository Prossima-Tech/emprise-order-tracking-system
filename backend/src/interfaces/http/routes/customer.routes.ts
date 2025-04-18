import { Router } from 'express';
import { CustomerController } from '../controllers/CustomerController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../../../domain/entities/User';

/**
 * @swagger
 * /customers:
 *   get:
 *     tags: [Customers]
 *     summary: Get all customers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customers
 * 
 *   post:
 *     tags: [Customers]
 *     summary: Add a new customer
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Customer code (e.g., CR, WR)
 *               name:
 *                 type: string
 *                 description: Full name of the customer
 *               headquarters:
 *                 type: string
 *                 description: Headquarters location of the customer
 *             required:
 *               - id
 *               - name
 *               - headquarters
 *     responses:
 *       201:
 *         description: Customer created
 * 
 * /customers/{id}:
 *   get:
 *     tags: [Customers]
 *     summary: Get a customer by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer details
 * 
 *   put:
 *     tags: [Customers]
 *     summary: Update a customer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               headquarters:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer updated
 * 
 *   delete:
 *     tags: [Customers]
 *     summary: Delete a customer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Customer deleted
 */
export function customerRoutes(controller: CustomerController) {
  const router = Router();

  router.get('/',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.BO_SPECIALIST, UserRole.PO_SPECIALIST, UserRole.STAFF]),
    controller.getAllCustomers
  );

  router.get('/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.BO_SPECIALIST, UserRole.PO_SPECIALIST, UserRole.STAFF]),
    controller.getCustomer
  );

  router.post('/',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    controller.addCustomer
  );

  router.put('/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    controller.updateCustomer
  );

  router.delete('/:id',
    authMiddleware([UserRole.ADMIN]),
    controller.deleteCustomer
  );

  return router;
} 