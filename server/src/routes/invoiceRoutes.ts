// // src/routes/invoiceRoutes.ts
// import { Router } from 'express';
// import { InvoiceController } from '../controllers/invoiceController';
// import { authenticate, authorize } from '../middlewares/auth';
// import { UserRole } from '../types';
// import { validateInvoice } from '../middlewares/validation';
// import { uploadMiddleware } from '../middlewares/fileUpload';

// const router = Router();

// /**
//  * Invoice Routes
//  * Base path: /api/v1/invoices
//  * 
//  * These routes handle the complete invoice lifecycle from creation
//  * through payment processing. They include document management and
//  * payment tracking functionality.
//  */

// // Create new invoice with document
// // POST /api/v1/invoices
// router.post('/',
//   authenticate,
//   authorize([UserRole.ADMIN, UserRole.MANAGER, UserRole.VENDOR]),
//   uploadMiddleware.single('document'),
//   validateInvoice,
//   InvoiceController.createInvoice
// );

// // Process payment for invoice
// // POST /api/v1/invoices/:id/process-payment
// router.post('/:id/process-payment',
//   authenticate,
//   authorize([UserRole.ADMIN, UserRole.MANAGER]),
//   InvoiceController.processPayment
// );

// // Update invoice status (approve/reject)
// // PATCH /api/v1/invoices/:id/status
// router.patch('/:id/status',
//   authenticate,
//   authorize([UserRole.ADMIN, UserRole.MANAGER]),
//   InvoiceController.updateStatus
// );

// // Get invoice details
// // GET /api/v1/invoices/:id
// router.get('/:id',
//   authenticate,
//   InvoiceController.getInvoiceDetails
// );

// // Get invoice analytics
// // GET /api/v1/invoices/analytics
// router.get('/analytics',
//   authenticate,
//   authorize([UserRole.ADMIN, UserRole.MANAGER]),
//   InvoiceController.getAnalytics
// );

// export default router;