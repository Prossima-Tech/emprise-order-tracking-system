import { Router } from 'express';
import { RailwayZoneController } from '../controllers/RailwayZoneController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../../../domain/entities/User';

/**
 * @swagger
 * /railway-zones:
 *   get:
 *     tags: [RailwayZones]
 *     summary: Get all railway zones
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of railway zones
 * 
 *   post:
 *     tags: [RailwayZones]
 *     summary: Add a new railway zone
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
 *                 description: Railway zone code (e.g., CR, WR)
 *               name:
 *                 type: string
 *                 description: Full name of the railway zone
 *               headquarters:
 *                 type: string
 *                 description: Headquarters location of the railway zone
 *             required:
 *               - id
 *               - name
 *               - headquarters
 *     responses:
 *       201:
 *         description: Railway zone created
 * 
 * /railway-zones/{id}:
 *   get:
 *     tags: [RailwayZones]
 *     summary: Get a railway zone by ID
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
 *         description: Railway zone details
 * 
 *   put:
 *     tags: [RailwayZones]
 *     summary: Update a railway zone
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
 *         description: Railway zone updated
 * 
 *   delete:
 *     tags: [RailwayZones]
 *     summary: Delete a railway zone
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
 *         description: Railway zone deleted
 */
export function railwayZoneRoutes(controller: RailwayZoneController) {
  const router = Router();

  router.get('/',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.BO_SPECIALIST, UserRole.PO_SPECIALIST, UserRole.STAFF]),
    controller.getAllZones
  );

  router.get('/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.BO_SPECIALIST, UserRole.PO_SPECIALIST, UserRole.STAFF]),
    controller.getZone
  );

  router.post('/',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    controller.addZone
  );

  router.put('/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    controller.updateZone
  );

  router.delete('/:id',
    authMiddleware([UserRole.ADMIN]),
    controller.deleteZone
  );

  return router;
} 