// src/routes/boRoutes.ts
import { Router } from 'express';
import { BudgetaryOfferController } from '../controllers/boController';
import { authenticate, authorize } from '../middlewares/auth';
import { UserRole } from '../types';
import { Validators } from '../middlewares/validation';

const router = Router();

/**
 * Budgetary Offer Routes
 * Base path: /api/v1/budgetary-offers
 */

// Get statistics (placed before /:id to avoid conflict)
router.get('/statistics',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  Validators.listQuery,
  BudgetaryOfferController.getStatistics
);

// Create new budgetary offer
router.post('/',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  Validators.budgetaryOffer,
  BudgetaryOfferController.createOffer
);

// Update offer status
router.patch('/:id/status',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  Validators.statusUpdate,
  BudgetaryOfferController.updateStatus
);

// Update offer details
router.put('/:id',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  Validators.budgetaryOffer,
  BudgetaryOfferController.updateOffer
);

// Get specific offer details
router.get('/:id',
  authenticate,
  Validators.idParam,
  BudgetaryOfferController.getOffer
);

// List all offers with optional filters
router.get('/',
  authenticate,
  Validators.listQuery,
  BudgetaryOfferController.listOffers
);

export default router;