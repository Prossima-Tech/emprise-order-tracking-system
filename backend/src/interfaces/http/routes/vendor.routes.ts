import { Router } from 'express';
import { VendorController } from '../controllers/VendorController';
import { authMiddleware} from '../middlewares/auth.middleware';
import { UserRole } from '../../../domain/entities/User';


/**
 * @swagger
 * /vendors:
 *   post:
 *     tags: [Vendors]
 *     summary: Create vendor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVendorDto'
 *     responses:
 *       201:
 *         description: Vendor created
 * 
 *   get:
 *     tags: [Vendors]
 *     summary: Get all vendors
 *     parameters:
 *       - $ref: '#/components/parameters/paginationLimit'
 *       - $ref: '#/components/parameters/paginationOffset'
 *     responses:
 *       200:
 *         description: List of vendors
 * 
 * /vendors/{id}:
 *   get:
 *     tags: [Vendors]
 *     summary: Get vendor by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *   
 *   put:
 *     tags: [Vendors]
 *     summary: Update vendor
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateVendorDto'
 *   
 *   delete:
 *     tags: [Vendors]
 *     summary: Delete vendor
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 */

export function vendorRoutes(controller: VendorController) {
  const router = Router();

  router.post('/',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.BO_SPECIALIST, UserRole.PO_SPECIALIST]),
    // validateRequest(createVendorSchema),
    controller.createVendor
  );

  router.put('/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.PO_SPECIALIST, UserRole.BO_SPECIALIST]),
    // validateRequest(updateVendorSchema),
    controller.updateVendor
  );

  router.delete('/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.PO_SPECIALIST, UserRole.BO_SPECIALIST]),
    controller.deleteVendor
  );

  router.get('/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.PO_SPECIALIST, UserRole.BO_SPECIALIST]),
    controller.getVendor
  );

  router.get('/',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.PO_SPECIALIST, UserRole.BO_SPECIALIST]),
    controller.getAllVendors
  );

  return router;
}