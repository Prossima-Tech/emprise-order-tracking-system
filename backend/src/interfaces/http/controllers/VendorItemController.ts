import { Request, Response } from 'express';
import { VendorItemService } from '../../../application/services/VendorItemService';
import { AppError } from '../../../shared/errors/AppError';

export class VendorItemController {
  constructor(private service: VendorItemService) {}

  assignItemToVendor = async (req: Request, res: Response) => {
    try {
      const { vendorId } = req.params;
      const { itemId, unitPrice } = req.body;

      const vendorItem = await this.service.assignItemToVendor({
        vendorId,
        itemId,
        unitPrice
      });

      res.status(201).json({
        status: 'success',
        data: vendorItem
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to assign item to vendor');
    }
  };

  getVendorItems = async (req: Request, res: Response) => {
    try {
      const { vendorId } = req.params;
      const { page, limit } = req.query;

      const vendorItems = await this.service.getVendorItems(vendorId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      });

      res.json({
        status: 'success',
        data: vendorItems
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch vendor items');
    }
  };

  getItemVendors = async (req: Request, res: Response) => {
    try {
      const { itemId } = req.params;
      const { page, limit } = req.query;

      const itemVendors = await this.service.getItemVendors(itemId);
      
      res.json({
        status: 'success',
        data: itemVendors
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch item vendors');
    }
  };

  updateVendorItemPrice = async (req: Request, res: Response) => {
    try {
      const { vendorId, itemId } = req.params;
      const { unitPrice } = req.body;

      const updatedVendorItem = await this.service.updateVendorItemPrice(
        vendorId,
        itemId,
        unitPrice
      );

      res.json({
        status: 'success',
        data: updatedVendorItem
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update price');
    }
  };

  removeItemFromVendor = async (req: Request, res: Response) => {
    try {
      const { vendorId, itemId } = req.params;

      await this.service.removeItemFromVendor(vendorId, itemId);

      res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to remove item from vendor');
    }
  };
}