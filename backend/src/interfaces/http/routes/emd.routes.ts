// interfaces/http/routes/emd.routes.ts
import { Router } from 'express';
import { EmdController } from '../controllers/EmdController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../../../domain/entities/User';
import multer from 'multer';

/**
 * @swagger
 * /emds:
 *   post:
 *     tags: [EMD]
 *     summary: Create new EMD
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               paymentMode:
 *                 type: string
 *               submissionDate:
 *                 type: string
 *                 format: date
 *               maturityDate:
 *                 type: string
 *                 format: date
 *               bankName:
 *                 type: string
 *               documentFile:
 *                 type: string
 *                 format: binary
 *               offerId:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: EMD created successfully
 * 
 *   get:
 *     tags: [EMD]
 *     summary: Get all EMDs
 *     parameters:
 *       - $ref: '#/components/parameters/paginationLimit'
 *       - $ref: '#/components/parameters/paginationOffset'
 *     responses:
 *       200:
 *         description: List of EMDs
 * 
 * /emds/{id}:
 *   get:
 *     tags: [EMD]
 *     summary: Get EMD by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: EMD details
 * 
 *   put:
 *     tags: [EMD]
 *     summary: Update an existing EMD
 *     description: Update EMD details including optional document upload
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the EMD to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Updated EMD amount
 *               submissionDate:
 *                 type: string
 *                 format: date
 *                 description: Date when EMD was submitted
 *               maturityDate:
 *                 type: string
 *                 format: date
 *                 description: Date when EMD matures
 *               bankName:
 *                 type: string
 *                 description: Name of the bank
 *               documentFile:
 *                 type: string
 *                 format: binary
 *                 description: Updated EMD document file (PDF)
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, EXPIRED, RELEASED]
 *                 description: Current status of the EMD
 *               offerId:
 *                 type: string
 *                 format: uuid
 *                 description: Associated budgetary offer ID
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags for categorizing the EMD
 *     responses:
 *       200:
 *         description: EMD updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EMD'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: EMD not found
 * 
 *   delete:
 *     tags: [EMD]
 *     summary: Delete EMD
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 * 
 * /emds/{id}/status:
 *   patch:
 *     tags: [EMD]
 *     summary: Update EMD status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, EXPIRED, RELEASED]
 * 
 * /emds/expiring/list:
 *   get:
 *     tags: [EMD]
 *     summary: Get expiring EMDs
 *     responses:
 *       200:
 *         description: List of expiring EMDs
 */

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed!'));
    }
  },
});

export function emdRoutes(controller: EmdController) {
  const router = Router();

  // Create new EMD
  router.post('/',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    upload.single('document'),
    controller.createEMD
  );

  // Update existing EMD
  router.put('/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    upload.single('document'),
    controller.updateEMD
  );

  // Delete EMD
  router.delete('/:id',
    authMiddleware([UserRole.ADMIN]),
    controller.deleteEMD
  );

  // Get single EMD
  router.get('/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    controller.getEMD
  );

  // Get all EMDs with filters and pagination
  router.get('/',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    controller.getAllEMDs
  );

  // Update EMD status
  router.patch('/:id/status',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    controller.updateStatus
  );

  // Get expiring EMDs
  router.get('/expiring/list',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    controller.getExpiringEMDs
  );

  return router;
}