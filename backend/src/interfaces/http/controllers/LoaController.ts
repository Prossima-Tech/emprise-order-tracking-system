import { Request, Response, NextFunction } from 'express';
import { LoaService } from '../../../application/services/LOAService';
import { AppError } from '../../../shared/errors/AppError';

export class LoaController {
  constructor(private service: LoaService) {}

  createLoa = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse the delivery period if it's a string
      let deliveryPeriod;
      try {
        deliveryPeriod = req.body.deliveryPeriod ? JSON.parse(req.body.deliveryPeriod) : undefined;
      } catch (error) {
        throw new AppError('Invalid delivery period format');
      }

      // Parse tags if they're a string
      let tags;
      try {
        tags = req.body.tags ? JSON.parse(req.body.tags) : [];
      } catch (error) {
        throw new AppError('Invalid tags format');
      }

      // Parse loaValue as number with default value of 0
      const loaValue = req.body.loaValue ? Number(req.body.loaValue) : 0;

      // Parse EMD IDs if they're provided
      let emdId: string | undefined = req.body.emdId;

      if (!req.file) {
        throw new AppError('Document file is required');
      }

      const result = await this.service.createLoa({
        loaNumber: req.body.loaNumber,
        loaValue: loaValue,
        deliveryPeriod: deliveryPeriod,
        workDescription: req.body.workDescription,
        documentFile: req.file,
        tags: tags,
        emdId: emdId
      });

      if (!result.isSuccess) {
        const errorMessage = Array.isArray(result.error) 
          ? result.error.map(err => `${err.field}: ${err.message}`).join(', ')
          : result.error || 'Failed to create LOA';
        throw new AppError(errorMessage);
      }

      res.status(201).json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  updateLoa = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Parse the delivery period if it's a string
      let deliveryPeriod;
      try {
        deliveryPeriod = req.body.deliveryPeriod ? JSON.parse(req.body.deliveryPeriod) : undefined;
      } catch (error) {
        throw new AppError('Invalid delivery period format');
      }

      // Parse tags if they're a string
      let tags;
      try {
        tags = req.body.tags ? JSON.parse(req.body.tags) : undefined;
      } catch (error) {
        throw new AppError('Invalid tags format');
      }

      // Parse loaValue as number if present
      const loaValue = req.body.loaValue ? Number(req.body.loaValue) : undefined;

      // Parse EMD IDs if they're provided
      let emdId: string | undefined;
      try {
        emdId = req.body.emdId ? JSON.parse(req.body.emdId) : undefined;
      } catch (error) {
        throw new AppError('Invalid EMD IDs format');
      }

      const result = await this.service.updateLoa(id, {
        loaNumber: req.body.loaNumber,
        loaValue: loaValue,
        deliveryPeriod: deliveryPeriod,
        workDescription: req.body.workDescription,
        documentFile: req.file,
        tags: tags,
        emdId: emdId
      });

      if (!result.isSuccess) {
        const errorMessage = Array.isArray(result.error) 
          ? result.error.map(err => `${err.field}: ${err.message}`).join(', ')
          : result.error || 'Failed to update LOA';
        throw new AppError(errorMessage);
      }

      res.json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };
  
  deleteLoa = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteLoa(id);

      if (!result.isSuccess) {
        const errorMessage = Array.isArray(result.error) 
          ? result.error[0]?.message || 'Failed to delete LOA'
          : result.error || 'Failed to delete LOA';
        throw new AppError(errorMessage);
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  getLoa = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.service.getLoa(id);

      if (!result.isSuccess) {
        const errorMessage = Array.isArray(result.error) 
          ? result.error[0]?.message || 'LOA not found'
          : result.error || 'LOA not found';
        throw new AppError(errorMessage, 404);
      }

      res.json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  getAllLoas = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, search } = req.query;
      
      const result = await this.service.getAllLoas({
        searchTerm: search as string,
        ...(page ? { page: parseInt(page as string) } : {}),
        ...(limit ? { limit: parseInt(limit as string) } : {})
      });

      if (!result.isSuccess) {
        const errorMessage = Array.isArray(result.error) 
          ? result.error[0]?.message || 'Failed to fetch LOAs'
          : result.error || 'Failed to fetch LOAs';
        throw new AppError(errorMessage);
      }

      res.json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  createAmendment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { loaId } = req.params;
      const result = await this.service.createAmendment(loaId, {
        ...req.body,
        documentFile: req.file
      });

      if (!result.isSuccess) {
        const errorMessage = Array.isArray(result.error) 
          ? result.error[0]?.message || 'Failed to create amendment'
          : result.error || 'Failed to create amendment';
        throw new AppError(errorMessage);
      }

      res.status(201).json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  updateAmendment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.service.updateAmendment(id, {
        ...req.body,
        documentFile: req.file
      });

      if (!result.isSuccess) {
        const errorMessage = Array.isArray(result.error) 
          ? result.error[0]?.message || 'Failed to update amendment'
          : result.error || 'Failed to update amendment';
        throw new AppError(errorMessage);
      }

      res.json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  deleteAmendment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteAmendment(id);

      if (!result.isSuccess) {
        const errorMessage = Array.isArray(result.error) 
          ? result.error[0]?.message || 'Failed to delete amendment'
          : result.error || 'Failed to delete amendment';
        throw new AppError(errorMessage);
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}