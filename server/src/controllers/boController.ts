// src/controllers/boController.ts
import { Request, Response, NextFunction } from 'express';
import { BudgetaryOfferModel } from '../models/BudgetaryOffer';
import { BudgetaryOfferStatus, BudgetaryOffer } from '../types';
import { Decimal } from '@prisma/client/runtime/library';

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
      const { tenderNo, amount, emdAmount, dueDate } = req.body;
      const calculatedEmdAmount = emdAmount || new Decimal(amount).mul(0.02);
  
      const offer = await BudgetaryOfferModel.create({
        tenderNo,
        amount: new Decimal(amount),
        emdAmount: calculatedEmdAmount,
        dueDate,
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

      // First check if the offer exists
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

      // Update the status
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

      // Build filters object
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

      // Calculate pagination
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Get data and count
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
      
      const filters: FilterQuery = {};
      if (startDate && endDate) {
        filters.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      }

      const allOffers = await BudgetaryOfferModel.findAll(filters);

      const statistics = {
        total: allOffers.length,
        totalValue: allOffers.reduce((sum, offer) => 
          sum.plus(offer.amount), new Decimal(0)
        ),
        byStatus: {
          [BudgetaryOfferStatus.DRAFT]: 0,
          [BudgetaryOfferStatus.SUBMITTED]: 0,
          [BudgetaryOfferStatus.APPROVED]: 0,
          [BudgetaryOfferStatus.REJECTED]: 0
        },
        averageEMDPercentage: allOffers.length > 0 
          ? allOffers.reduce((sum, offer) => 
              sum + (offer.emdAmount.div(offer.amount).mul(100).toNumber()), 0
            ) / allOffers.length
          : 0
      };

      // Count offers by status
      allOffers.forEach(offer => {
        statistics.byStatus[offer.status as BudgetaryOfferStatus]++;
      });

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
      const updateData = req.body;

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

      // Convert numeric values to Decimal
      if (updateData.amount) {
        updateData.amount = new Decimal(updateData.amount);
      }
      if (updateData.emdAmount) {
        updateData.emdAmount = new Decimal(updateData.emdAmount);
      }

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
}