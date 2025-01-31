import { Router } from 'express';
import multer from 'multer';
import { BudgetaryOfferController } from '../controllers/boController';
import { BudgetaryOfferValidators } from '../validators/boValidators';
import { authenticate, authorize } from '../middlewares/auth';
import { UserRole } from '../types/index';

const router = Router();

// Configure multer for memory storage (needed for S3 uploads)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * Base path: /api/v1/budgetary-offers
 */

// Dashboard statistics
router.get('/statistics',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  BudgetaryOfferValidators.validateListQuery,
  BudgetaryOfferController.getStatistics
);

// Create new budgetary offer
router.post('/',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  upload.single('emdDocument'),
  BudgetaryOfferValidators.validateBudgetaryOffer,
  BudgetaryOfferValidators.handleValidationErrors,
  BudgetaryOfferController.createOffer
);

// Submit for approval
router.post('/:id/submit',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  BudgetaryOfferValidators.validateIdParam,
  BudgetaryOfferValidators.handleValidationErrors,
  BudgetaryOfferController.submitForApproval
);

// Process approval/rejection
router.post('/:id/approve',
  authenticate,
  BudgetaryOfferValidators.validateIdParam,
  BudgetaryOfferValidators.validateApprovalAction,
  BudgetaryOfferValidators.handleValidationErrors,
  BudgetaryOfferController.processApproval
);

// Update offer
router.put('/:id',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  upload.single('emdDocument'),
  BudgetaryOfferValidators.validateIdParam,
  BudgetaryOfferValidators.validateBudgetaryOffer,
  BudgetaryOfferValidators.handleValidationErrors,
  BudgetaryOfferController.updateOffer
);

// Get specific offer
router.get('/:id',
  authenticate,
  BudgetaryOfferValidators.validateIdParam,
  BudgetaryOfferValidators.handleValidationErrors,
  BudgetaryOfferController.getOffer
);

// List all offers with filters
router.get('/',
  authenticate,
  BudgetaryOfferValidators.validateListQuery,
  BudgetaryOfferValidators.handleValidationErrors,
  BudgetaryOfferController.listOffers
);

// Download offer as PDF
router.get('/:id/pdf',
  authenticate,
  BudgetaryOfferValidators.validateIdParam,
  BudgetaryOfferValidators.handleValidationErrors,
  BudgetaryOfferController.downloadPDF
);

// Download EMD document
router.get('/:id/emd-document',
  authenticate,
  BudgetaryOfferValidators.validateIdParam,
  BudgetaryOfferValidators.handleValidationErrors,
  BudgetaryOfferController.downloadEMDDocument
);

export default router;