import { Request, Response, NextFunction } from 'express';
import { BudgetaryOfferModel } from '../models/BudgetaryOffer';
import { S3Service } from '../services/s3Service';
import { PDFService } from '../services/pdfService';
import {
  BudgetaryOfferStatus,
  BudgetaryOfferCreateInput,
  BudgetaryOfferUpdateInput,
  WorkItem,
  EMDDetails,
  ApprovalLevel,
  EMDDocument
} from '../types/budgetaryOffer';
import { User } from '../types/index';
import { NotificationService } from '../services/notificationService';

export class BudgetaryOfferController {
  private static s3Service = new S3Service();


  /**
   * Retrieves a specific budgetary offer by ID
   */
  static async getOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const offer = await BudgetaryOfferModel.findById(id);

      if (!offer) {
        res.status(404).json({
          success: false,
          error: 'Budgetary offer not found'
        });
        return;
      }

      // Optional: Check if user has permission to view this offer
      const currentUser = req.user as User;
      const hasAccess =
        offer.createdById === currentUser.id || // Creator
        offer.approvalLevels.some(level => level.userId === currentUser.id) || // Approver
        currentUser.role === 'ADMIN'; // Admin

      if (!hasAccess) {
        res.status(403).json({
          success: false,
          error: 'You do not have permission to view this offer'
        });
        return;
      }

      // Optionally, you can include additional related data
      // For example, creator details, EMD tracking info, etc.
      const offerWithDetails = {
        ...offer,
        // // Add any additional fields or transformations here
        // emdTracking: await BudgetaryOfferModel.getEMDTracking(id),
        // createdBy: await BudgetaryOfferModel.getCreator(offer.createdById)
      };

      res.json({
        success: true,
        data: offerWithDetails
      });

    } catch (error) {
      next(error);
    }
  }



  /**
   * Creates a new budgetary offer
   * Handles file upload for EMD document and sets up approval chain
   */
  static async createOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const offerData: BudgetaryOfferCreateInput = req.body;
      const emdFile = req.file;

      // Handle EMD document upload if present
      let emdDocument;
      if (emdFile) {
        try {
          this.s3Service.validateFile(emdFile);
          emdDocument = await this.s3Service.uploadFile(emdFile);
        } catch (error) {
          res.status(400).json({
            success: false,
            error: 'Invalid EMD document: ' + (error as Error).message
          });
          return;
        }
      }

      // Set up approval chain
      const approvalLevels: ApprovalLevel[] = offerData.approvers.map((userId, index) => ({
        level: index + 1,
        userId,
        status: index === 0 ? 'PENDING' : 'PENDING',
        timestamp: index === 0 ? new Date() : undefined
      }));

      // Create offer with initial status
      const offer = await BudgetaryOfferModel.create({
        ...offerData,
        status: BudgetaryOfferStatus.DRAFT,
        emdDetails: {
          ...offerData.emdDetails,
          // document: emdDocument?.key
        },
        approvalLevels,
        currentApprovalLevel: 0,
        createdById: (req.user as User).id
      });

      res.status(201).json({
        success: true,
        data: offer,
        message: 'Budgetary offer created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates an existing budgetary offer
   * Handles EMD document updates and maintains approval chain
   */
  static async updateOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: BudgetaryOfferUpdateInput = req.body;
      const emdFile = req.file;

      // Fetch current offer
      const currentOffer = await BudgetaryOfferModel.findById(id);
      if (!currentOffer) {
        res.status(404).json({
          success: false,
          error: 'Budgetary offer not found'
        });
        return;
      }

      // Verify offer is in DRAFT status
      if (currentOffer.status !== BudgetaryOfferStatus.DRAFT) {
        res.status(400).json({
          success: false,
          error: 'Can only update offers in DRAFT status'
        });
        return;
      }

      // Handle EMD document update
      // if (emdFile) {
      //   try {
      //     this.s3Service.validateFile(emdFile);
      //     const newDocument = await this.s3Service.uploadFile(emdFile);

      //     // Delete old document if exists
      //     if (currentOffer.emdDetails.document?.key) {
      //       await this.s3Service.deleteFile(currentOffer.emdDetails.document.key);
      //     }

      //     updateData.emdDetails = {
      //       ...updateData.emdDetails,
      //       document: newDocument 
      //     };
      //   } catch (error) {
      //     res.status(400).json({
      //       success: false,
      //       error: 'Invalid EMD document: ' + (error as Error).message
      //     });
      //     return;
      //   }
      // }

      // Update offer
      const updatedOffer = await BudgetaryOfferModel.update(id, updateData);

      res.json({
        success: true,
        data: updatedOffer,
        message: 'Budgetary offer updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submits offer for approval
   * Initiates the approval workflow
   */
  static async submitForApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const offer = await BudgetaryOfferModel.findById(id);
      if (!offer) {
        res.status(404).json({
          success: false,
          error: 'Budgetary offer not found'
        });
        return;
      }

      if (offer.status !== BudgetaryOfferStatus.DRAFT) {
        res.status(400).json({
          success: false,
          error: 'Only offers in DRAFT status can be submitted for approval'
        });
        return;
      }

      // Update status and set first approval level as pending
      const updatedOffer = await BudgetaryOfferModel.updateStatus(id, {
        status: BudgetaryOfferStatus.PENDING_APPROVAL,
        currentApprovalLevel: 1,
        approvalLevels: offer.approvalLevels.map((level, index) => ({
          ...level,
          status: index === 0 ? 'PENDING' : 'PENDING',
          timestamp: index === 0 ? new Date() : undefined
        }))
      });

      res.json({
        success: true,
        data: updatedOffer,
        message: 'Budgetary offer submitted for approval'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles approval/rejection at each level
   */
  static async processApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { approve, remarks } = req.body;
      const currentUser = req.user as User;

      const offer = await BudgetaryOfferModel.findById(id);
      if (!offer) {
        res.status(404).json({
          success: false,
          error: 'Budgetary offer not found'
        });
        return;
      }

      // Verify user is current approver
      const currentLevel = offer.approvalLevels[offer.currentApprovalLevel! - 1];
      if (currentLevel.userId !== currentUser.id) {
        res.status(403).json({
          success: false,
          error: 'You are not authorized to approve this offer at this stage'
        });
        return;
      }

      // Update approval status
      currentLevel.status = approve ? 'APPROVED' : 'REJECTED';
      currentLevel.remarks = remarks;
      currentLevel.timestamp = new Date();

      let newStatus = offer.status;
      let newCurrentLevel = offer.currentApprovalLevel;

      if (approve) {
        // Check if this was the last approval
        if (offer.currentApprovalLevel === offer.approvalLevels.length) {
          newStatus = BudgetaryOfferStatus.APPROVED;
          newCurrentLevel = undefined;
        } else {
          newCurrentLevel = offer.currentApprovalLevel! + 1;
        }
      } else {
        // Handle rejection
        if (!remarks) {
          res.status(400).json({
            success: false,
            error: 'Rejection remarks are required'
          });
          return;
        }

        // Create rejection record
        const rejectionRecord = {
          level: offer.currentApprovalLevel || 0,
          rejectedBy: currentUser.id,
          rejectedAt: new Date(),
          remarks: remarks,
          previousStatus: offer.status
        };

        // Reset approval levels while preserving history
        const updatedApprovalLevels = offer.approvalLevels.map(level => ({
          ...level,
          status: level.level <= offer.currentApprovalLevel! ? 'REJECTED' : 'PENDING',
          timestamp: level.level === offer.currentApprovalLevel! ? new Date() : level.timestamp,
          remarks: level.level === offer.currentApprovalLevel! ? remarks : level.remarks
        }));

        // Store rejection history in offer
        offer.rejectionHistory = [...(offer.rejectionHistory || []), rejectionRecord];

        // Update status and reset approval level
        newStatus = BudgetaryOfferStatus.DRAFT;
        newCurrentLevel = undefined;

        // Send notification to offer creator and relevant stakeholders
        try {
          // await NotificationService.sendRejectionNotification({
          //   offerId: offer.id,
          //   rejectedBy: currentUser.name,
          //   level: offer.currentApprovalLevel,
          //   remarks: remarks,
          //   createdById: offer.createdById
          // });
          console.log("process Approval")
        } catch (error) {
          console.error('Failed to send rejection notification:', error);
          // Continue processing even if notification fails
        }
      }

      const updatedOffer = await BudgetaryOfferModel.updateStatus(id, {
        status: newStatus,
        currentApprovalLevel: newCurrentLevel,
        approvalLevels: offer.approvalLevels
      });

      res.json({
        success: true,
        data: updatedOffer,
        message: `Budgetary offer ${approve ? 'approved' : 'rejected'} successfully`
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generates and serves PDF document
   */
  static async downloadPDF(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const offer = await BudgetaryOfferModel.findById(id);
      if (!offer) {
        res.status(404).json({
          success: false,
          error: 'Budgetary offer not found'
        });
        return;
      }

      const pdfStream = PDFService.generateBudgetaryOfferPDF(offer);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="BO-${offer.id}.pdf"`);

      pdfStream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Downloads EMD document
   */
  static async downloadEMDDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const offer = await BudgetaryOfferModel.findById(id);
      if (!offer || !offer.emdDetails.document?.key) {
        res.status(404).json({
          success: false,
          error: 'EMD document not found'
        });
        return;
      }

      const presignedUrl = await this.s3Service.generatePresignedUrl(offer.emdDetails.document.key);

      res.json({
        success: true,
        data: { url: presignedUrl }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves dashboard statistics
   */
  static async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const dateRange = startDate && endDate ? {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
      } : undefined;

      const statistics = await BudgetaryOfferModel.getStatistics(dateRange);

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lists offers with filters and pagination
   */
  static async listOffers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        status,
        fromDate,
        toDate,
        createdById,
        pendingApprovalFor,
        page = '1',
        limit = '10'
      } = req.query;

      const filters: any = {};

      if (status) filters.status = status;
      if (fromDate && toDate) {
        filters.createdAt = {
          gte: new Date(fromDate as string),
          lte: new Date(toDate as string)
        };
      }
      if (createdById) filters.createdById = createdById;
      if (pendingApprovalFor) filters.pendingApprovalFor = pendingApprovalFor;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const [offers, total] = await Promise.all([
        BudgetaryOfferModel.findAll(filters, skip, limitNum),
        BudgetaryOfferModel.count(filters)
      ]);

      res.json({
        success: true,
        data: {
          offers,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}