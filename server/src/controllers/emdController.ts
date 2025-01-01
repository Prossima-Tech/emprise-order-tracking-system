// src/controllers/emdController.ts
import { Request, Response, NextFunction } from 'express';
import { EMDTrackingModel } from '../models/EMDTracking';
import { EMDStatus } from '../types';
import { FileService } from '../services/fileServices';
import { Decimal } from '@prisma/client/runtime/library';

export class EMDController {
  /**
   * Creates a new EMD tracking record
   * @route POST /api/v1/emd
   */
  static async submitEMD(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('Received form data:', req.body); // Debug log

      const { offerId, amount, dueDate, documentPath } = req.body;

      // Validate required fields
      if (!offerId || !amount || !dueDate) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: offerId, amount, and dueDate are required'
        });
        return;
      }

      // Check if EMD already exists
      const existingEMD = await EMDTrackingModel.findByOfferId(offerId);
      if (existingEMD) {
        res.status(400).json({
          success: false,
          error: 'EMD already exists for this offer'
        });
        return;
      }

      // Create EMD
      const emdTracking = await EMDTrackingModel.create({
        offerId,
        amount: new Decimal(amount),
        dueDate: new Date(dueDate),
        documentPath: documentPath || 'placeholder_document_path' // Temporary placeholder
      });

      res.status(201).json({
        success: true,
        data: emdTracking,
        message: 'EMD details submitted successfully'
      });
    } catch (error) {
      console.error('EMD Creation Error:', error);
      next(error);
    }
  }

  /**
   * Updates EMD status
   * @route PATCH /api/v1/emd/:id/status
   */
  static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
  
      // Verify EMD exists
      const currentEMD = await EMDTrackingModel.findById(id);
      if (!currentEMD) {
        res.status(404).json({
          success: false,
          error: 'EMD tracking record not found'
        });
        return;
      }
  
      // Validate status transition
      const validTransitions: Record<EMDStatus, EMDStatus[]> = {
        [EMDStatus.PENDING]: [EMDStatus.SUBMITTED],
        [EMDStatus.SUBMITTED]: [EMDStatus.RETURNED, EMDStatus.FORFEITED],
        [EMDStatus.RETURNED]: [],
        [EMDStatus.FORFEITED]: []
      };
  
      if (!validTransitions[currentEMD.status as EMDStatus].includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status transition',
          data: {
            currentStatus: currentEMD.status,
            requestedStatus: status,
            allowedTransitions: validTransitions[currentEMD.status as EMDStatus]
          }
        });
        return;
      }
  
      // Handle document upload if provided
      const updateData: {
        status: EMDStatus;
        documentPath?: string;
      } = {
        status
      };
  
      if (req.file) {
        const documentPath = await FileService.uploadDocument(req.file, 'emd');
        updateData.documentPath = documentPath;
      }
  
      const updatedEMD = await EMDTrackingModel.updateStatus(id, updateData);
  
      res.json({
        success: true,
        data: updatedEMD,
        message: 'EMD status updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets EMD details for a specific offer
   * @route GET /api/v1/emd/offer/:offerId
   */
  static async getEMDByOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { offerId } = req.params;
      const emdTracking = await EMDTrackingModel.findByOfferId(offerId);

      if (!emdTracking) {
        res.status(404).json({
          success: false,
          error: 'EMD tracking record not found'
        });
        return;
      }

      // Calculate days remaining/overdue
      const today = new Date();
      const dueDate = new Date(emdTracking.dueDate);
      const daysRemaining = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      res.json({
        success: true,
        data: {
          ...emdTracking,
          daysRemaining,
          isOverdue: daysRemaining < 0
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Downloads EMD document
   * @route GET /api/v1/emd/:id/document
   */
  static async downloadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const emdTracking = await EMDTrackingModel.findById(id);

      if (!emdTracking || !emdTracking.documentPath) {
        res.status(404).json({
          success: false,
          error: 'EMD document not found'
        });
        return;
      }

      const document = await FileService.getDocument(emdTracking.documentPath);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=EMD-${id}.pdf`);
      res.send(document);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets EMD statistics
   * @route GET /api/v1/emd/statistics
   */
  static async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const statistics = await EMDTrackingModel.getStatistics();

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets overdue EMDs
   * @route GET /api/v1/emd/overdue
   */
  static async getOverdueEMDs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const overdueEMDs = await EMDTrackingModel.getOverdueEMDs();

      res.json({
        success: true,
        data: overdueEMDs,
        count: overdueEMDs.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates EMD document
   * @route PATCH /api/v1/emd/:id/document
   */
  static async updateDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No document provided'
        });
        return;
      }

      const emdTracking = await EMDTrackingModel.findById(id);
      if (!emdTracking) {
        res.status(404).json({
          success: false,
          error: 'EMD tracking record not found'
        });
        return;
      }

      const documentPath = await FileService.uploadDocument(req.file, 'emd');
      const updatedEMD = await EMDTrackingModel.updateDocument(id, documentPath);

      res.json({
        success: true,
        data: updatedEMD,
        message: 'EMD document updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}