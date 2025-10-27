// interfaces/http/routes/emd.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { EmdController } from '../controllers/EmdController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../../../domain/entities/User';

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
 *             required:
 *               - amount
 *               - submissionDate
 *               - maturityDate
 *             properties:
 *               amount:
 *                 type: number
 *               paymentMode:
 *                 type: string
 *                 default: FDR
 *               submissionDate:
 *                 type: string
 *                 format: date
 *               maturityDate:
 *                 type: string
 *                 format: date
 *               bankName:
 *                 type: string
 *                 default: IDBI
 *               documentFile:
 *                 type: string
 *                 format: binary
 *               extractedData:
 *                 type: string
 *                 description: JSON string of extracted data
 *               offerId:
 *                 type: string
 *               loaId:
 *                 type: string
 *               tenderId:
 *                 type: string
 *               tags:
 *                 type: string
 *                 description: JSON array of tags
 *     responses:
 *       201:
 *         description: EMD created successfully
 *       400:
 *         description: Invalid input data
 *
 *   get:
 *     tags: [EMD]
 *     summary: Get all EMDs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, EXPIRED, RELEASED]
 *       - in: query
 *         name: offerId
 *         schema:
 *           type: string
 *       - in: query
 *         name: loaId
 *         schema:
 *           type: string
 *       - in: query
 *         name: tenderId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of EMDs
 *
 * /emds/{id}:
 *   get:
 *     tags: [EMD]
 *     summary: Get EMD by ID
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
 *         description: EMD details
 *       404:
 *         description: EMD not found
 *
 *   put:
 *     tags: [EMD]
 *     summary: Update EMD
 *     security:
 *       - bearerAuth: []
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
 *               extractedData:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, EXPIRED, RELEASED]
 *               offerId:
 *                 type: string
 *               loaId:
 *                 type: string
 *               tenderId:
 *                 type: string
 *               tags:
 *                 type: string
 *     responses:
 *       200:
 *         description: EMD updated successfully
 *
 *   delete:
 *     tags: [EMD]
 *     summary: Delete EMD
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
 *         description: EMD deleted successfully
 *
 * /emds/{id}/status:
 *   patch:
 *     tags: [EMD]
 *     summary: Update EMD status
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, EXPIRED, RELEASED]
 *     responses:
 *       200:
 *         description: EMD status updated successfully
 *
 * /emds/expiring/list:
 *   get:
 *     tags: [EMD]
 *     summary: Get expiring EMDs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: List of expiring EMDs
 *
 * /emds/extract:
 *   post:
 *     tags: [EMD]
 *     summary: Extract data from document using AI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - extractedText
 *             properties:
 *               extractedText:
 *                 type: string
 *                 description: OCR extracted text from document
 *     responses:
 *       200:
 *         description: Data extracted successfully
 *       400:
 *         description: Extraction failed
 */

// Configure multer for file uploads
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

// Setup routes
export function emdRoutes(controller: EmdController) {
  const router = Router();

  // Create EMD
  router.post(
    '/',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    upload.single('documentFile'),
    controller.createEmd
  );

  // AI extraction endpoint (called by frontend with text)
  router.post(
    '/extract',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    controller.extractData
  );

  // File extraction endpoint (OCR + AI - handles PDF and images)
  router.post(
    '/extract-from-file',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    upload.single('file'),
    controller.extractFromFile
  );

  // Get expiring EMDs (must be before /:id route)
  router.get(
    '/expiring/list',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.USER]),
    controller.getExpiringEmds
  );

  // Get all EMDs
  router.get(
    '/',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.USER]),
    controller.getAllEmds
  );

  // Get EMD by ID
  router.get(
    '/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.USER]),
    controller.getEmdById
  );

  // Update EMD
  router.put(
    '/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    upload.single('documentFile'),
    controller.updateEmd
  );

  // Delete EMD
  router.delete(
    '/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    controller.deleteEmd
  );

  // Update EMD status
  router.patch(
    '/:id/status',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    controller.updateStatus
  );

  return router;
}
