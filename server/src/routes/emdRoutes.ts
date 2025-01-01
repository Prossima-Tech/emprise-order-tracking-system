// src/routes/emdRoutes.ts
import { Router } from 'express';
import { EMDController } from '../controllers/emdController';
import { authenticate, authorize } from '../middlewares/auth';
import { UserRole } from '../types';
import { validateEMDSubmission } from '../middlewares/validation';
import multer from 'multer';

const router = Router();
const upload = multer();

// Submit EMD details (removed file upload middleware)
router.post('/',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  upload.none(),
  // validateEMDSubmission,
  EMDController.submitEMD
);

// Update EMD status
router.patch('/:id/status',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  EMDController.updateStatus
);

// Get EMD details for specific offer
router.get('/offer/:offerId',
  authenticate,
  EMDController.getEMDByOffer
);

// Get EMD statistics
router.get('/statistics',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  EMDController.getStatistics
);

export default router;