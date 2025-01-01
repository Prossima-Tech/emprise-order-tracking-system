// src/controllers/poController.ts
import { Request, Response, NextFunction } from 'express';
import { PurchaseOrderModel } from '../models/PurchaseOrder';
import { LOAModel } from '../models/LOAManagement';
import { POStatus, POFilter } from '../types/po.types';
import { Decimal } from '@prisma/client/runtime/library';
import { NotificationService } from '../services/notificationService';

export class PurchaseOrderController {
  /**
   * Creates a new purchase order
   * @route POST /api/v1/purchase-orders
   */
  static async createPO(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { loaId, vendorId, value, deliveryDate, items } = req.body;

      // Verify LOA exists and is active
      const loa = await LOAModel.findById(loaId);
      if (!loa) {
        res.status(404).json({
          success: false,
          error: 'LOA not found'
        });
        return;
      }

      if (loa.status !== 'ACTIVE') {
        res.status(400).json({
          success: false,
          error: 'LOA is not active'
        });
        return;
      }

      // Check remaining LOA value
      const utilization = await LOAModel.getUtilization(loaId);
      const decimalValue = new Decimal(value);
      
      if (!utilization || decimalValue.greaterThan(utilization.remainingAmount)) {
        res.status(400).json({
          success: false,
          error: 'PO value exceeds remaining LOA value',
          data: {
            requestedValue: decimalValue.toString(),
            remainingValue: utilization?.remainingAmount.toString() || '0'
          }
        });
        return;
      }

      // Create PO
      const purchaseOrder = await PurchaseOrderModel.create({
        loaId,
        vendorId,
        value: decimalValue,
        deliveryDate,
        items: items.map((item: any) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: new Decimal(item.unitPrice),
          totalPrice: new Decimal(item.quantity * item.unitPrice),
          specifications: item.specifications || {}
        }))
      });

      // Send notification
      await NotificationService.notifyPOCreated(purchaseOrder);

      res.status(201).json({
        success: true,
        data: purchaseOrder,
        message: 'Purchase order created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates PO status
   * @route PATCH /api/v1/purchase-orders/:id/status
   */
  static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, remarks } = req.body;
      const userId = req.user!.id;

      const currentPO = await PurchaseOrderModel.findById(id);
      if (!currentPO) {
        res.status(404).json({
          success: false,
          error: 'Purchase order not found'
        });
        return;
      }

      // Validate status transition
      const validTransitions: Record<POStatus, POStatus[]> = {
        [POStatus.DRAFT]: [POStatus.ISSUED],
        [POStatus.ISSUED]: [POStatus.IN_PROGRESS, POStatus.CANCELLED],
        [POStatus.IN_PROGRESS]: [POStatus.COMPLETED, POStatus.CANCELLED],
        [POStatus.COMPLETED]: [],
        [POStatus.CANCELLED]: []
      };

      if (!validTransitions[currentPO.status as POStatus].includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status transition',
          data: {
            currentStatus: currentPO.status,
            requestedStatus: status,
            validTransitions: validTransitions[currentPO.status as POStatus]
          }
        });
        return;
      }

      const updatedPO = await PurchaseOrderModel.updateStatus(id, status, userId, remarks);
      await NotificationService.notifyPOStatusUpdate(updatedPO);

      res.json({
        success: true,
        data: updatedPO,
        message: 'Purchase order status updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets PO details
   * @route GET /api/v1/purchase-orders/:id
   */
  static async getPODetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const po = await PurchaseOrderModel.findById(id);

      if (!po) {
        res.status(404).json({
          success: false,
          error: 'Purchase order not found'
        });
        return;
      }

      const metrics = await PurchaseOrderModel.getPOMetrics(id);

      res.json({
        success: true,
        data: {
          ...po,
          metrics
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lists all POs with filters
   * @route GET /api/v1/purchase-orders
   */
  static async listPOs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        startDate, 
        endDate, 
        status, 
        vendorId, 
        loaId 
      } = req.query;

      const filter: POFilter = {};

      if (startDate && endDate) {
        filter.startDate = new Date(startDate as string);
        filter.endDate = new Date(endDate as string);
      }

      if (status) {
        filter.status = status as POStatus;
      }

      if (vendorId) {
        filter.vendorId = vendorId as string;
      }

      if (loaId) {
        filter.loaId = loaId as string;
      }

      const purchaseOrders = await PurchaseOrderModel.findAll(filter);

      res.json({
        success: true,
        data: purchaseOrders,
        count: purchaseOrders.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets PO statistics
   * @route GET /api/v1/purchase-orders/statistics
   */
  static async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { startDate, endDate, vendorId } = req.query;

        const filter: POFilter = {};
        
        if (startDate && endDate) {
            filter.startDate = new Date(startDate as string);
            filter.endDate = new Date(endDate as string);
        }

        if (vendorId) {
            filter.vendorId = vendorId as string;
        }

        const statistics = await PurchaseOrderModel.getStatistics(filter);

        // Always return a success response with the statistics
        res.json({
            success: true,
            data: {
                summary: {
                    total: statistics.total,
                    totalValue: statistics.totalValue.toFixed(2),
                    overdueCount: statistics.overdueCount
                },
                statusDistribution: statistics.byStatus,
                vendorAnalysis: statistics.byVendor,
                loaUtilization: statistics.byLOA,
                itemMetrics: statistics.itemStats,
                deliveryStatus: statistics.timelineStats
            }
        });
    } catch (error) {
        console.error('Controller error:', error);
        next(error);
    }
}

  /**
   * Updates PO details (only in DRAFT status)
   * @route PUT /api/v1/purchase-orders/:id
   */
  static async updatePO(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const currentPO = await PurchaseOrderModel.findById(id);
      if (!currentPO) {
        res.status(404).json({
          success: false,
          error: 'Purchase order not found'
        });
        return;
      }

      if (currentPO.status !== POStatus.DRAFT) {
        res.status(400).json({
          success: false,
          error: 'Can only update purchase orders in DRAFT status'
        });
        return;
      }

      if (updateData.value) {
        const utilization = await LOAModel.getUtilization(currentPO.loaId);
        const additionalValue = new Decimal(updateData.value).minus(currentPO.value);
        
        if (!utilization || additionalValue.greaterThan(utilization.remainingAmount)) {
          res.status(400).json({
            success: false,
            error: 'Updated PO value exceeds remaining LOA value',
            data: {
              requestedValue: updateData.value.toString(),
              currentValue: currentPO.value.toString(),
              remainingValue: utilization?.remainingAmount.toString() || '0'
            }
          });
          return;
        }
      }

      const updatedPO = await PurchaseOrderModel.update(id, updateData);

      res.json({
        success: true,
        data: updatedPO,
        message: 'Purchase order updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}