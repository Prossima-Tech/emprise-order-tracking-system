// src/routes/loaRoutes.ts
import { Router } from 'express';
import { LOAController } from '../controllers/loaController';
import { authenticate, authorize } from '../middlewares/auth';
import { UserRole } from '../types';
import { validateLOARecord, validateAmendment } from '../middlewares/validation';

const router = Router();

// Record a received LOA
router.post('/',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  validateLOARecord,
  LOAController.recordLOA
);

// Get LOA details
router.get('/:id',
  authenticate,
  LOAController.getLOADetails
);

// Record amendment
router.post('/:id/amendment',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  validateAmendment,
  LOAController.recordAmendment
);

// Get LOA amendments
router.get('/:id/amendments',
  authenticate,
  LOAController.getAmendments
);

// Get LOA utilization
router.get('/:id/utilization',
  authenticate,
  LOAController.getUtilization
);

// Approve amendment
router.patch('/:id/amendments/:amendmentId/approve',
  authenticate,
  authorize([UserRole.ADMIN]),
  LOAController.approveAmendment
);

export default router;