// interface/http/controllers/CustomerController.ts
import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../../../application/services/CustomerService';
import { AppError } from '../../../shared/errors/AppError';

export class CustomerController {
  constructor(private service: CustomerService) {}

  getAllCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getAllCustomers();

      if (result.isSuccess) {
        res.status(200).json({
          status: 'success',
          data: result.data
        });
        return;
      }

      throw new AppError('Failed to fetch customers');
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  }

  getCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getCustomerById(id);

      if (result.isSuccess) {
        if (!result.data) {
          res.status(404).json({
            status: 'fail',
            message: 'Customer not found'
          });
          return;
        }

        res.status(200).json({
          status: 'success',
          data: result.data
        });
        return;
      }

      throw new AppError('Failed to fetch customer');
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  }

  addCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.addCustomer(req.body);

      if (result.isSuccess) {
        res.status(201).json({
          status: 'success',
          data: result.data
        });
        return;
      }

      res.status(400).json({
        status: 'fail',
        message: result.error
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to add customer'
      });
    }
  }

  updateCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.updateCustomer(id, req.body);

      if (result.isSuccess) {
        res.status(200).json({
          status: 'success',
          data: result.data
        });
        return;
      }

      res.status(400).json({
        status: 'fail',
        message: result.error
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to update customer'
      });
    }
  }

  deleteCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteCustomer(id);

      if (result.isSuccess) {
        res.status(204).send();
        return;
      }

      res.status(400).json({
        status: 'fail',
        message: result.error
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete customer'
      });
    }
  }
} 