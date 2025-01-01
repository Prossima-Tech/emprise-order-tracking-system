// src/routes/masterDataRoutes.ts
import { Router } from 'express';
import { MasterDataController } from '../controllers/masterDataController';
import { validateItemData, validateVendorData, validateVendorStatus } from '../middlewares/validation';
import { authenticate, authorize } from '../middlewares/auth';
import { UserRole } from '../types';
import { RequestHandler } from 'express';

const router = Router();

// Item Master Routes
router.post('/items', 
    authenticate as RequestHandler,
    authorize([UserRole.ADMIN]) as RequestHandler,
    validateItemData as RequestHandler[],
    MasterDataController.createItem as RequestHandler
);

router.put('/items/:id', 
    authenticate as RequestHandler,
    authorize([UserRole.ADMIN]) as RequestHandler,
    validateItemData as RequestHandler[],
    MasterDataController.updateItem as RequestHandler
);

router.get('/items', 
    authenticate as RequestHandler,
    MasterDataController.getItems as RequestHandler
);

router.get('/items/:id', 
    authenticate as RequestHandler,
    MasterDataController.getItemById as RequestHandler
);

// Vendor Master Routes
router.post('/vendors', 
    authenticate as RequestHandler,
    authorize([UserRole.ADMIN]) as RequestHandler,
    validateVendorData as RequestHandler[],
    MasterDataController.createVendor as RequestHandler
);

router.put('/vendors/:id', 
    authenticate as RequestHandler,
    authorize([UserRole.ADMIN]) as RequestHandler,
    validateVendorData as RequestHandler[],
    MasterDataController.updateVendor as RequestHandler
);

router.get('/vendors', 
    authenticate as RequestHandler,
    MasterDataController.getVendors as RequestHandler
);

router.get('/vendors/:id', 
    authenticate as RequestHandler,
    MasterDataController.getVendorById as RequestHandler
);

router.patch('/vendors/:id/status', 
    authenticate as RequestHandler,
    authorize([UserRole.ADMIN]) as RequestHandler,
    validateVendorStatus as RequestHandler[],
    MasterDataController.updateVendorStatus as RequestHandler
);

export default router;