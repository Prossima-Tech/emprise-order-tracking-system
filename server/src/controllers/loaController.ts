import { Request, Response, NextFunction } from 'express';
import { LOAModel } from '../models/LOAManagement';
import { LOAStatus, AmendmentStatus } from '../types/loa.types';
import { Decimal } from '@prisma/client/runtime/library';

export class LOAController {
  static async recordLOA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        loaNo,
        offerId,
        value,
        scope,
        issuingAuthority,
        referenceNumber,
        receivedDate,
        validityPeriod,
        projectCode,
        department,
        remarks
      } = req.body;
  
      // Check if LOA already exists
      try {
        const existingLOA = await LOAModel.findByLoaNo(loaNo);
        if (existingLOA) {
          res.status(400).json({
            success: false,
            error: 'LOA with this number already exists'
          });
          return;
        }
      } catch (error) {
        console.error('Error checking existing LOA:', error);
        res.status(500).json({
          success: false,
          error: 'Error checking existing LOA'
        });
        return;
      }
  
      const loa = await LOAModel.recordLOA({
        loaNo,
        offerId,
        value: new Decimal(value),
        scope,
        issuingAuthority,
        referenceNumber,
        receivedDate,
        validityPeriod,
        projectCode,
        department,
        remarks
      }, req.user!.id);
  
      res.status(201).json({
        success: true,
        data: loa,
        message: 'LOA recorded successfully'
      });
    } catch (error) {
      console.error('Error recording LOA:', error);
      next(error);
    }
  }

  static async getLOADetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const loa = await LOAModel.findById(id);

      if (!loa) {
        res.status(404).json({
          success: false,
          error: 'LOA not found'
        });
        return;
      }

      res.json({
        success: true,
        data: loa
      });
    } catch (error) {
      next(error);
    }
  }

  static async recordAmendment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const amendmentData = req.body;

      const loa = await LOAModel.findById(id);
      if (!loa) {
        res.status(404).json({
          success: false,
          error: 'LOA not found'
        });
        return;
      }

      if (loa.status !== LOAStatus.ACTIVE) {
        res.status(400).json({
          success: false,
          error: 'Can only add amendments to active LOAs'
        });
        return;
      }

      const amendment = await LOAModel.recordAmendment(
        id,
        amendmentData,
        req.user!.id
      );

      res.status(201).json({
        success: true,
        data: amendment,
        message: 'Amendment recorded successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAmendments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const loa = await LOAModel.findById(id);

      if (!loa) {
        res.status(404).json({
          success: false,
          error: 'LOA not found'
        });
        return;
      }

      res.json({
        success: true,
        data: loa.amendments || []
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUtilization(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const utilization = await LOAModel.getUtilization(id);

      if (!utilization) {
        res.status(404).json({
          success: false,
          error: 'LOA not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          totalValue: utilization.totalValue.toString(),
          utilizedAmount: utilization.utilizedAmount.toString(),
          remainingAmount: utilization.remainingAmount.toString(),
          utilizationPercentage: utilization.utilizationPercentage.toString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async approveAmendment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, amendmentId } = req.params;

      const loa = await LOAModel.findById(id);
      if (!loa) {
        res.status(404).json({
          success: false,
          error: 'LOA not found'
        });
        return;
      }

      const amendment = loa.amendments?.find(a => a.id === amendmentId);
      if (!amendment || amendment.status !== AmendmentStatus.PENDING) {
        res.status(404).json({
          success: false,
          error: 'Amendment not found or already processed'
        });
        return;
      }

      const approvedAmendment = await LOAModel.approveAmendment(
        amendmentId,
        req.user!.id
      );

      res.json({
        success: true,
        data: approvedAmendment,
        message: 'Amendment approved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}