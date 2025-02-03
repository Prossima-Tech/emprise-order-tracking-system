import { Request, Response } from 'express';
import { ItemService } from '../../../application/services/ItemService';
import { AppError } from '../../../shared/errors/AppError';

export class ItemController {
  constructor(private service: ItemService) {}

  createItem = async (req: Request, res: Response) => {
    try {
      const item = await this.service.createItem(req.body);

      res.status(201).json({
        status: 'success',
        data: item
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create item');
    }
  };

  updateItem = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updatedItem = await this.service.updateItem(id, req.body);

      res.json({
        status: 'success',
        data: updatedItem
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update item');
    }
  };

  deleteItem = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.service.deleteItem(id);

      res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete item');
    }
  };

  getItem = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const item = await this.service.getItem(id);

      res.json({
        status: 'success',
        data: item
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Item not found', 404);
    }
  };

  getAllItems = async (req: Request, res: Response) => {
    try {
      const { page, limit, search } = req.query;

      const items = await this.service.getAllItems({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        searchTerm: search as string
      });

      res.json({
        status: 'success',
        data: items
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch items');
    }
  };

  getPriceHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { vendorId } = req.query;

      if (!vendorId || typeof vendorId !== 'string') {
        res.status(400).json({
          message: 'Vendor ID is required as a query parameter'
        });
        return;
      }

      const priceHistory = await this.service.getPriceHistory(id, vendorId);
      res.json(priceHistory);
    } catch (error) {
      console.error('Error in getPriceHistory controller:', error);
      res.status(500).json({
        message: 'Failed to fetch price history'
      });
    }
  };
}