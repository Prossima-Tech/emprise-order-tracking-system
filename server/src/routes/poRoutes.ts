// src/routes/poRoutes.ts
import { Router } from 'express';
import { PurchaseOrderController } from '../controllers/poController';
import { authenticate, authorize } from '../middlewares/auth';
import { UserRole } from '../types';
import { validatePurchaseOrder, validatePOUpdate } from '../middlewares/validation';

const router = Router();

// Create new purchase order
router.post('/',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  validatePurchaseOrder,
  PurchaseOrderController.createPO
);

// Update PO status
router.patch('/:id/status',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  PurchaseOrderController.updateStatus
);

router.get('/statistics', 
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  PurchaseOrderController.getStatistics
);

// Get PO details
router.get('/:id',
  authenticate,
  PurchaseOrderController.getPODetails
);


// List all POs
router.get('/',
  authenticate,
  PurchaseOrderController.listPOs
);

// Update PO details
router.put('/:id',
  authenticate,
  authorize([UserRole.ADMIN, UserRole.MANAGER]),
  validatePOUpdate,
  PurchaseOrderController.updatePO
);

export default router;