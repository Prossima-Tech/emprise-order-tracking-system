// interfaces/http/routes/fdr.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { FdrController } from '../controllers/FdrController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../../../domain/entities/User';

/**
 * @swagger
 * /fdrs:
 *   post:
 *     tags: [FDR]
 *     summary: Create new FDR
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - depositAmount
 *               - dateOfDeposit
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [FD, BG]
 *                 default: FD
 *               bankName:
 *                 type: string
 *                 default: IDBI
 *               accountNo:
 *                 type: string
 *               fdrNumber:
 *                 type: string
 *               accountName:
 *                 type: string
 *               depositAmount:
 *                 type: number
 *               dateOfDeposit:
 *                 type: string
 *                 format: date
 *               maturityValue:
 *                 type: number
 *               maturityDate:
 *                 type: string
 *                 format: date
 *               contractNo:
 *                 type: string
 *               contractDetails:
 *                 type: string
 *               poc:
 *                 type: string
 *               location:
 *                 type: string
 *               emdAmount:
 *                 type: number
 *               sdAmount:
 *                 type: number
 *               documentFile:
 *                 type: string
 *                 format: binary
 *               extractedData:
 *                 type: string
 *                 description: JSON string of extracted data
 *               status:
 *                 type: string
 *                 enum: [RUNNING, COMPLETED, CANCELLED, RETURNED]
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
 *         description: FDR created successfully
 *       400:
 *         description: Invalid input data
 *
 *   get:
 *     tags: [FDR]
 *     summary: Get all FDRs
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
 *         name: category
 *         schema:
 *           type: string
 *           enum: [FD, BG]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [RUNNING, COMPLETED, CANCELLED, RETURNED]
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
 *         description: List of FDRs
 *
 * /fdrs/bulk-import:
 *   post:
 *     tags: [FDR]
 *     summary: Bulk import FDRs from Excel
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file with FDR data
 *     responses:
 *       200:
 *         description: FDRs imported successfully
 *       400:
 *         description: Import failed
 *
 * /fdrs/{id}:
 *   get:
 *     tags: [FDR]
 *     summary: Get FDR by ID
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
 *         description: FDR details
 *       404:
 *         description: FDR not found
 *
 *   put:
 *     tags: [FDR]
 *     summary: Update FDR
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
 *               category:
 *                 type: string
 *                 enum: [FD, BG]
 *               bankName:
 *                 type: string
 *               accountNo:
 *                 type: string
 *               fdrNumber:
 *                 type: string
 *               accountName:
 *                 type: string
 *               depositAmount:
 *                 type: number
 *               dateOfDeposit:
 *                 type: string
 *                 format: date
 *               maturityValue:
 *                 type: number
 *               maturityDate:
 *                 type: string
 *                 format: date
 *               contractNo:
 *                 type: string
 *               contractDetails:
 *                 type: string
 *               poc:
 *                 type: string
 *               location:
 *                 type: string
 *               emdAmount:
 *                 type: number
 *               sdAmount:
 *                 type: number
 *               documentFile:
 *                 type: string
 *                 format: binary
 *               extractedData:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [RUNNING, COMPLETED, CANCELLED, RETURNED]
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
 *         description: FDR updated successfully
 *
 *   delete:
 *     tags: [FDR]
 *     summary: Delete FDR
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
 *         description: FDR deleted successfully
 *
 * /fdrs/{id}/status:
 *   patch:
 *     tags: [FDR]
 *     summary: Update FDR status
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
 *                 enum: [RUNNING, COMPLETED, CANCELLED, RETURNED]
 *     responses:
 *       200:
 *         description: FDR status updated successfully
 *
 * /fdrs/expiring/list:
 *   get:
 *     tags: [FDR]
 *     summary: Get expiring FDRs
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
 *         description: List of expiring FDRs
 *
 * /fdrs/extract:
 *   post:
 *     tags: [FDR]
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

// Configure multer for file uploads (FDR documents)
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

// Configure multer for Excel file uploads (bulk import)
const excelUpload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed!'));
    }
  },
});

// Setup routes
export function fdrRoutes(controller: FdrController) {
  const router = Router();

  // Create FDR
  router.post(
    '/',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    upload.single('documentFile'),
    controller.createFdr
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

  // Bulk import FDRs from Excel (must be before /:id route)
  router.post(
    '/bulk-import',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    excelUpload.single('file'),
    controller.bulkImport
  );

  // Get expiring FDRs (must be before /:id route)
  router.get(
    '/expiring/list',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.USER]),
    controller.getExpiringFdrs
  );

  // Get all FDRs
  router.get(
    '/',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.USER]),
    controller.getAllFdrs
  );

  // Get FDR by ID
  router.get(
    '/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.USER]),
    controller.getFdrById
  );

  // Update FDR
  router.put(
    '/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    upload.single('documentFile'),
    controller.updateFdr
  );

  // Delete FDR
  router.delete(
    '/:id',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER]),
    controller.deleteFdr
  );

  // Update FDR status
  router.patch(
    '/:id/status',
    authMiddleware([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
    controller.updateStatus
  );

  return router;
}
