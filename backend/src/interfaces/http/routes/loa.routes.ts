// interfaces/http/routes/loa.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { LoaController } from '../controllers/LoaController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../../../domain/entities/User';

/**
 * @swagger
 * /loas:
 *   post:
 *     tags: [LOA]
 *     summary: Create new LOA
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - loaNumber
 *               - loaValue
 *               - deliveryPeriod
 *               - workDescription
 *               - documentFile
 *             properties:
 *               loaNumber:
 *                 type: string
 *               loaValue:
 *                 type: number
 *               deliveryPeriod:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     format: date
 *                   end:
 *                     type: string
 *                     format: date
 *               workDescription:
 *                 type: string
 *               documentFile:
 *                 type: string
 *                 format: binary
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: LOA created successfully
 * 
 *   get:
 *     tags: [LOA]
 *     summary: Get all LOAs
 *     parameters:
 *       - $ref: '#/components/parameters/paginationLimit'
 *       - $ref: '#/components/parameters/paginationOffset'
 *     responses:
 *       200:
 *         description: List of LOAs
 * 
 * /loas/{id}:
 *   get:
 *     tags: [LOA]
 *     summary: Get LOA by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: LOA details
 * 
 *   put:
 *     tags: [LOA]
 *     summary: Update LOA
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLoaDto'
 * 
 * /loas/{loaId}/amendments:
 *   post:
 *     tags: [LOA]
 *     summary: Create amendment
 *     parameters:
 *       - in: path
 *         name: loaId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateAmendmentDto'
 * 
 * /loas/amendments/{id}:
 *   put:
 *     tags: [LOA]
 *     summary: Update amendment
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAmendmentDto'
 * 
 *   delete:
 *     tags: [LOA]
 *     summary: Delete amendment
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */

// Configure multer for file upload
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed!'));
    }
  },
});

export function loaRoutes(controller: LoaController) {
  const router = Router();

  // LOA routes
  router.post('/',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    upload.single('documentFile'),
    controller.createLoa
  );

  router.put('/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    upload.single('documentFile'),
    controller.updateLoa
  );

  router.delete('/:id',
    authMiddleware([UserRole.ADMIN]),
    controller.deleteLoa
  );

  router.get('/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    controller.getLoa
  );

  router.get('/',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    controller.getAllLoas
  );

  // Amendment routes
  router.post('/:loaId/amendments',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    upload.single('documentFile'),
    controller.createAmendment
  );

  router.put('/amendments/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    upload.single('documentFile'),
    controller.updateAmendment
  );

  router.delete('/amendments/:id',
    authMiddleware([UserRole.ADMIN]),
    controller.deleteAmendment
  );

  return router;
}