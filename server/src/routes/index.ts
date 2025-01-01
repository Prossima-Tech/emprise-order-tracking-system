// src/routes/index.ts
import { Router } from 'express';
import budgetaryOfferRoutes from './boRoutes';
import emdRoutes from './emdRoutes';
import loaRoutes from './loaRoutes';
import purchaseOrderRoutes from './poRoutes';
import authRoutes from './authRoutes';
// import invoiceRoutes from './invoiceRoutes';
// import masterDataRoutes from './masterDataRoutes';
// import purchaseOrderItemRoutes from './purchaseOrderItemRoutes';

// Create main router instance
const router = Router();

// Configure API routes with versioning
// This allows for future API versioning if needed
router.use('/v1/budgetary-offers', budgetaryOfferRoutes);
router.use('/v1/emd', emdRoutes);
router.use('/v1/loa', loaRoutes);
router.use('/v1/purchase-orders', purchaseOrderRoutes);
router.use('/v1/auth', authRoutes);
// router.use('/v1/invoices', invoiceRoutes);
// router.use('/api/master', masterDataRoutes);
// router.use('/api/items', purchaseOrderItemßRoutes);

export default router;