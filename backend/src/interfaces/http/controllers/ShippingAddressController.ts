import { Request, Response } from 'express';
import { ShippingAddressService } from '../../../application/services/ShippingAddressService';
import { AppError } from '../../../shared/errors/AppError';

export class ShippingAddressController {
  constructor(private service: ShippingAddressService) {}

  createShippingAddress = async (req: Request, res: Response) => {
    try {
      const address = await this.service.createShippingAddress(req.body);

      res.status(201).json({
        status: 'success',
        data: address
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create shipping address');
    }
  };

  getAllShippingAddresses = async (req: Request, res: Response) => {
    try {
      const addresses = await this.service.getAllShippingAddresses();

      res.json({
        status: 'success',
        data: addresses
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch shipping addresses');
    }
  };

  getShippingAddress = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const address = await this.service.getShippingAddress(id);

      res.json({
        status: 'success',
        data: address
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Shipping address not found', 404);
    }
  };

  updateShippingAddress = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updatedAddress = await this.service.updateShippingAddress(id, req.body);

      res.json({
        status: 'success',
        data: updatedAddress
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update shipping address');
    }
  };

  deleteShippingAddress = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.service.deleteShippingAddress(id);

      res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete shipping address');
    }
  };
}
