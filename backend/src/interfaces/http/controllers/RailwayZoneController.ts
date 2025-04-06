// interface/http/controllers/RailwayZoneController.ts
import { Request, Response } from 'express';
import { RailwayZoneService } from '../../../application/services/RailwayZoneService';
import { AppError } from '../../../shared/errors/AppError';

export class RailwayZoneController {
  constructor(private service: RailwayZoneService) {}

  getAllZones = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = this.service.getAllZones();
      
      res.json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch railway zones');
    }
  };

  getZone = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = this.service.getZoneById(id);
      
      if (!result.isSuccess) {
        res.status(404).json({
          status: 'error',
          message: result.error
        });
        return;
      }

      res.json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch railway zone');
    }
  };

  addZone = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = this.service.addZone(req.body);
      
      if (!result.isSuccess) {
        res.status(400).json({
          status: 'error',
          message: result.error
        });
        return;
      }

      res.status(201).json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to add railway zone');
    }
  };

  updateZone = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = this.service.updateZone(id, req.body);
      
      if (!result.isSuccess) {
        res.status(404).json({
          status: 'error',
          message: result.error
        });
        return;
      }

      res.json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update railway zone');
    }
  };

  deleteZone = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = this.service.deleteZone(id);
      
      if (!result.isSuccess) {
        res.status(404).json({
          status: 'error',
          message: result.error
        });
        return;
      }

      res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete railway zone');
    }
  };
} 