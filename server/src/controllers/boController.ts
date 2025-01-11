// src/controllers/boController.ts
import { Request, Response, NextFunction } from 'express';
import { BudgetaryOfferModel } from '../models/BudgetaryOffer';
import { BudgetaryOfferStatus, WorkItem, EMDDetails } from '../types';

interface FilterQuery {
  status?: BudgetaryOfferStatus;
  createdAt?: {
    gte: Date;
    lte: Date;
  };
}

export class BudgetaryOfferController {
  /**
   * Creates a new budgetary offer
   * @route POST /api/v1/budgetary-offers
   */
  static async createOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        fromAuthority, 
        toAuthority, 
        subject, 
        workItems, 
        emdDetails, 
        termsAndConditions 
      } = req.body;

      // Calculate total value of work items
      const totalValue = workItems.reduce((sum: number, item: WorkItem) => {
        return sum + (item.basicRate * (1 + item.taxRate / 100));
      }, 0);

      // Validate EMD amount
      if (emdDetails.amount > totalValue * 0.05) {
        res.status(400).json({
          success: false,
          error: 'EMD amount cannot exceed 5% of total project value'
        });
        return;
      }

      const offer = await BudgetaryOfferModel.create({
        fromAuthority,
        toAuthority,
        subject,
        workItems,
        emdDetails,
        termsAndConditions,
        createdById: req.user!.id
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
   * Updates the status of a budgetary offer
   * @route PATCH /api/v1/budgetary-offers/:id/status
   */
  static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body as { status: BudgetaryOfferStatus };

      const currentOffer = await BudgetaryOfferModel.findById(id);
      if (!currentOffer) {
        res.status(404).json({
          success: false,
          error: 'Budgetary offer not found'
        });
        return;
      }

      // Validate status transition
      const validTransitions: Record<BudgetaryOfferStatus, BudgetaryOfferStatus[]> = {
        [BudgetaryOfferStatus.DRAFT]: [BudgetaryOfferStatus.SUBMITTED],
        [BudgetaryOfferStatus.SUBMITTED]: [BudgetaryOfferStatus.APPROVED, BudgetaryOfferStatus.REJECTED],
        [BudgetaryOfferStatus.APPROVED]: [],
        [BudgetaryOfferStatus.REJECTED]: [BudgetaryOfferStatus.DRAFT]
      };

      if (!validTransitions[currentOffer.status as BudgetaryOfferStatus].includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status transition',
          data: {
            currentStatus: currentOffer.status,
            requestedStatus: status,
            allowedTransitions: validTransitions[currentOffer.status as BudgetaryOfferStatus]
          }
        });
        return;
      }

      const updatedOffer = await BudgetaryOfferModel.updateStatus(id, status);

      res.json({
        success: true,
        data: updatedOffer,
        message: 'Budgetary offer status updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lists all budgetary offers with optional filters
   * @route GET /api/v1/budgetary-offers
   */
  static async listOffers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        status, 
        startDate, 
        endDate,
        page = '1',
        limit = '10'
      } = req.query;

      const filters: FilterQuery = {};
      
      if (status) {
        filters.status = status as BudgetaryOfferStatus;
      }
      
      if (startDate && endDate) {
        filters.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      }

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const [offers, total] = await Promise.all([
        BudgetaryOfferModel.findAll(filters, skip, limitNum),
        BudgetaryOfferModel.count(filters)
      ]);

      res.json({
        success: true,
        data: offers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets overview statistics for budgetary offers
   * @route GET /api/v1/budgetary-offers/statistics
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
   * Updates a budgetary offer
   * @route PUT /api/v1/budgetary-offers/:id
   */
  static async updateOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { 
        fromAuthority, 
        toAuthority, 
        subject, 
        workItems, 
        emdDetails, 
        termsAndConditions 
      } = req.body;

      const currentOffer = await BudgetaryOfferModel.findById(id);
      if (!currentOffer) {
        res.status(404).json({
          success: false,
          error: 'Budgetary offer not found'
        });
        return;
      }

      if (currentOffer.status !== BudgetaryOfferStatus.DRAFT) {
        res.status(400).json({
          success: false,
          error: 'Can only update offers in DRAFT status'
        });
        return;
      }

      // If updating work items, validate EMD amount
      if (workItems && emdDetails) {
        const totalValue = workItems.reduce((sum: number, item: WorkItem) => {
          return sum + (item.basicRate * (1 + item.taxRate / 100));
        }, 0);

        if (emdDetails.amount > totalValue * 0.05) {
          res.status(400).json({
            success: false,
            error: 'EMD amount cannot exceed 5% of total project value'
          });
          return;
        }
      }

      const updatedOffer = await BudgetaryOfferModel.update(id, {
        fromAuthority,
        toAuthority,
        subject,
        workItems,
        emdDetails,
        termsAndConditions
      });

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
   * Retrieves a specific budgetary offer
   * @route GET /api/v1/budgetary-offers/:id
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

      res.json({
        success: true,
        data: offer
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate total value of work items
   * @route POST /api/v1/budgetary-offers/calculate-value
   */
  static async calculateValue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { workItems } = req.body;

      const totalValue = workItems.reduce((sum: number, item: WorkItem) => {
        const itemValue = item.basicRate * (1 + item.taxRate / 100);
        return sum + itemValue;
      }, 0);

      const suggestedEMD = totalValue * 0.02; // 2% of total value

      res.json({
        success: true,
        data: {
          totalValue,
          suggestedEMD,
          maxEMD: totalValue * 0.05, // 5% of total value
          breakdown: workItems.map((item: { description: any; basicRate: number; taxRate: number; }) => ({
            description: item.description,
            basicValue: item.basicRate,
            taxValue: item.basicRate * (item.taxRate / 100),
            totalValue: item.basicRate * (1 + item.taxRate / 100)
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
