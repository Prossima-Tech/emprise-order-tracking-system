// interfaces/http/controllers/EmdController.ts
import { Request, Response } from 'express';
import { EmdService } from '../../../application/services/EMDService';
import { EMDStatus } from '../../../domain/entities/EMD';

export class EmdController {
  constructor(private service: EmdService) {}

  createEMD = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.createEMD({
        ...req.body,
        documentFile: req.file
      });

      if (!result.isSuccess) {
        res.status(400).json({
          status: 'error',
          message: result.error || 'Failed to create EMD'
        });
        return;
      }

      res.status(201).json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  };

  updateEMD = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.updateEMD(id, {
        ...req.body,
        documentFile: req.file
      });

      if (!result.isSuccess) {
        res.status(400).json({
          status: 'error',
          message: result.error || 'Failed to update EMD'
        });
        return;
      }

      res.json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  };

  deleteEMD = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const result = await this.service.deleteEMD(id);
      if (!result.isSuccess) {
        res.status(400).json({
          status: 'error',
          message: result.error || 'Failed to delete EMD'
        });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  };

  getEMD = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getEMD(id);

      if (!result.isSuccess) {
        res.status(404).json({
          status: 'error',
          message: result.error || 'EMD not found'
        });
        return;
      }

      res.json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  };

  getAllEMDs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page, limit, status, offerId, search } = req.query;
      
      const result = await this.service.getAllEMDs({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as EMDStatus,
        offerId: offerId as string,
        searchTerm: search as string
      });

      if (!result.isSuccess) {
        res.status(400).json({
          status: 'error',
          message: result.error || 'Failed to fetch EMDs'
        });
        return;
      }

      res.json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const result = await this.service.updateStatus(id, status);

      if (!result.isSuccess) {
        res.status(400).json({
          status: 'error',
          message: result.error || 'Failed to update EMD status'
        });
        return;
      }

      res.json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  };

  getExpiringEMDs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { days } = req.query;
      const daysThreshold = days ? parseInt(days as string) : 30;

      const result = await this.service.getExpiringEMDs(daysThreshold);

      if (!result.isSuccess) {
        res.status(400).json({
          status: 'error',
          message: result.error || 'Failed to fetch expiring EMDs'
        });
        return;
      }

      res.json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  };
}