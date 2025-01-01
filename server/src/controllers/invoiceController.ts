// // src/controllers/invoiceController.ts
// import { Request, Response, NextFunction } from 'express';
// import { InvoiceModel } from '../models/Invoice';
// import { PurchaseOrderModel } from '../models/PurchaseOrder';
// import { InvoiceStatus, POStatus } from '../types';
// import { NotificationService } from '../services/notificationService.ts';
// import { FileService } from '../services/fileService';

// export class InvoiceController {
//   /**
//    * Creates a new invoice against a purchase order
//    * Includes validation against PO value and status
//    * Route: POST /api/invoices
//    */
//   static async createInvoice(req: Request, res: Response, next: NextFunction) {
//     try {
//       const { poId, vendorId, amount, dueDate, description } = req.body;
//       let documentPath: string | undefined;

//       // First verify PO exists and has sufficient remaining value
//       const po = await PurchaseOrderModel.findById(poId);
//       if (!po) {
//         return res.status(404).json({
//           success: false,
//           error: 'Purchase order not found'
//         });
//       }

//       // Verify PO status is valid for invoicing
//       if (po.status !== POStatus.ISSUED && po.status !== POStatus.IN_PROGRESS) {
//         return res.status(400).json({
//           success: false,
//           error: 'Purchase order is not in a valid status for invoicing'
//         });
//       }

//       // Verify vendor matches PO
//       if (po.vendorId !== vendorId) {
//         return res.status(403).json({
//           success: false,
//           error: 'Vendor does not match purchase order'
//         });
//       }

//       // Check remaining invoiceable amount
//       const invoicedAmount = await InvoiceModel.getTotalInvoicedAmount(poId);
//       const remainingAmount = po.value - invoicedAmount;

//       if (amount > remainingAmount) {
//         return res.status(400).json({
//           success: false,
//           error: 'Invoice amount exceeds remaining PO value',
//           remainingAmount
//         });
//       }

//       // Handle document upload if provided
//       if (req.file) {
//         documentPath = await FileService.uploadDocument(req.file, 'invoice');
//       }

//       // Generate unique invoice number
//       const invoiceNo = await InvoiceModel.generateInvoiceNumber();

//       const invoice = await InvoiceModel.create({
//         poId,
//         vendorId,
//         invoiceNo,
//         amount,
//         dueDate,
//         description,
//         documentPath
//       });

//       // Update PO status to IN_PROGRESS if not already
//       if (po.status === POStatus.ISSUED) {
//         await PurchaseOrderModel.updateStatus(poId, POStatus.IN_PROGRESS);
//       }

//       // Send notification to finance team
//       await NotificationService.notifyInvoiceCreated(invoice);

//       res.status(201).json({
//         success: true,
//         data: invoice,
//         message: 'Invoice created successfully'
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   /**
//    * Processes invoice for payment
//    * Updates invoice status and handles related PO updates
//    * Route: POST /api/invoices/:id/process-payment
//    */
//   static async processPayment(req: Request, res: Response, next: NextFunction) {
//     try {
//       const { id } = req.params;
//       const { paymentReference, paymentMode, remarks } = req.body;

//       const invoice = await InvoiceModel.findById(id);
//       if (!invoice) {
//         return res.status(404).json({
//           success: false,
//           error: 'Invoice not found'
//         });
//       }

//       if (invoice.status !== InvoiceStatus.APPROVED) {
//         return res.status(400).json({
//           success: false,
//           error: 'Invoice must be approved before payment'
//         });
//       }

//       // Process payment
//       const updatedInvoice = await InvoiceModel.processPayment(id, {
//         paymentReference,
//         paymentMode,
//         remarks,
//         processedById: req.user!.id
//       });

//       // Check if all invoices for the PO are paid
//       const allInvoicesPaid = await InvoiceModel.areAllInvoicesPaid(invoice.poId);
//       if (allInvoicesPaid) {
//         await PurchaseOrderModel.updateStatus(invoice.poId, POStatus.COMPLETED);
//       }

//       // Send payment notification to vendor
//       await NotificationService.notifyInvoicePaid(updatedInvoice);

//       res.json({
//         success: true,
//         data: updatedInvoice,
//         message: 'Payment processed successfully'
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   /**
//    * Approves or rejects an invoice
//    * Route: PATCH /api/invoices/:id/status
//    */
//   static async updateStatus(req: Request, res: Response, next: NextFunction) {
//     try {
//       const { id } = req.params;
//       const { status, remarks } = req.body;

//       const invoice = await InvoiceModel.findById(id);
//       if (!invoice) {
//         return res.status(404).json({
//           success: false,
//           error: 'Invoice not found'
//         });
//       }

//       // Validate status transition
//       const validTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
//         [InvoiceStatus.PENDING]: [InvoiceStatus.APPROVED, InvoiceStatus.REJECTED],
//         [InvoiceStatus.APPROVED]: [InvoiceStatus.PAID],
//         [InvoiceStatus.REJECTED]: [InvoiceStatus.PENDING],
//         [InvoiceStatus.PAID]: []
//       };

//       if (!validTransitions[invoice.status].includes(status)) {
//         return res.status(400).json({
//           success: false,
//           error: 'Invalid status transition'
//         });
//       }

//       const updatedInvoice = await InvoiceModel.updateStatus(id, status, {
//         remarks,
//         updatedById: req.user!.id
//       });

//       // Send notifications based on status change
//       switch (status) {
//         case InvoiceStatus.APPROVED:
//           await NotificationService.notifyInvoiceApproved(updatedInvoice);
//           break;
//         case InvoiceStatus.REJECTED:
//           await NotificationService.notifyInvoiceRejected(updatedInvoice);
//           break;
//       }

//       res.json({
//         success: true,
//         data: updatedInvoice,
//         message: 'Invoice status updated successfully'
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   /**
//    * Gets invoice details with payment tracking
//    * Route: GET /api/invoices/:id
//    */
//   static async getInvoiceDetails(req: Request, res: Response, next: NextFunction) {
//     try {
//       const { id } = req.params;
//       const invoice = await InvoiceModel.findById(id);

//       if (!invoice) {
//         return res.status(404).json({
//           success: false,
//           error: 'Invoice not found'
//         });
//       }

//       // Get additional payment and aging metrics
//       const metrics = await InvoiceModel.getInvoiceMetrics(id);

//       res.json({
//         success: true,
//         data: {
//           ...invoice,
//           metrics
//         }
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   /**
//    * Gets analytics and aging report for invoices
//    * Route: GET /api/invoices/analytics
//    */
//   static async getAnalytics(req: Request, res: Response, next: NextFunction) {
//     try {
//       const { startDate, endDate, vendorId } = req.query;
      
//       const filters = {
//         ...(startDate && endDate ? {
//           createdAt: {
//             gte: new Date(startDate as string),
//             lte: new Date(endDate as string)
//           }
//         } : {}),
//         ...(vendorId ? { vendorId: vendorId as string } : {})
//       };

//       const analytics = await InvoiceModel.getAnalytics(filters);

//       res.json({
//         success: true,
//         data: analytics
//       });
//     } catch (error) {
//       next(error);
//     }
//   }
// }