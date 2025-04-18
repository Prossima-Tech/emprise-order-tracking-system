// interface/http/controllers/SiteController.ts
import { Request, Response, NextFunction } from 'express';
import { SiteService } from '../../../application/services/SiteService';
import { AppError } from '../../../shared/errors/AppError';
import { POStatus } from '@prisma/client';
export class SiteController {
  constructor(private service: SiteService) {}

  createSite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('Create site request body:', req.body);
      const result = await this.service.createSite(req.body);

      if (!result.isSuccess) {
        console.log('Site creation failed:', result.error, result.data);
        res.status(400).json({
          status: 'fail',
          message: result.error,
          errors: result.data
        });
        return;
      }

      res.status(201).json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      console.error('Site creation error:', error);
      if (error instanceof AppError) {
        next(error);
        return;
      }
      next(new AppError('Failed to create site'));
    }
  };

  updateSite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.updateSite(id, req.body);

      if (!result.isSuccess) {
        res.status(400).json({
          status: 'fail',
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
        next(error);
        return;
      }
      next(new AppError('Failed to update site'));
    }
  };

  deleteSite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteSite(id);

      if (!result.isSuccess) {
        res.status(400).json({
          status: 'fail',
          message: result.error
        });
        return;
      }

      res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
        return;
      }
      next(new AppError('Failed to delete site'));
    }
  };

  getSite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getSite(id);

      if (!result.isSuccess) {
        res.status(404).json({
          status: 'fail',
          message: result.error || 'Site not found'
        });
        return;
      }

      res.json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
        return;
      }
      next(new AppError('Site not found', 404));
    }
  };

  getAllSites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, zoneId, search } = req.query;

      const result = await this.service.getAllSites({
        status: status as string,
        zoneId: zoneId as string,
        searchTerm: search as string
      });

      if (!result.isSuccess) {
        res.status(400).json({
          status: 'fail',
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
        next(error);
        return;
      }
      next(new AppError('Failed to fetch sites'));
    }
  };

  getSiteDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getSiteDetails(id);

      if (!result.isSuccess) {
        res.status(404).json({
          status: 'fail',
          message: result.error || 'Site not found'
        });
        return;
      }

      res.json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
        return;
      }
      next(new AppError('Failed to fetch site details'));
    }
  };

  getSiteLoas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, startDate, endDate } = req.query;

      const result = await this.service.getSiteLoas(id, {
        status: status as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      });

      if (!result.isSuccess) {
        res.status(400).json({
          status: 'fail',
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
        next(error);
        return;
      }
      next(new AppError('Failed to fetch site LOAs'));
    }
  };

  getSitePurchaseOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, startDate, endDate } = req.query;

      const result = await this.service.getSitePurchaseOrders(id, {
        status: status as POStatus,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      });

      if (!result.isSuccess) {
        res.status(400).json({
          status: 'fail',
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
        next(error);
        return;
      }
      next(new AppError('Failed to fetch site purchase orders'));
    }
  };

  getSiteCountsByZone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getSiteCountsByZone();

      if (!result.isSuccess) {
        res.status(400).json({
          status: 'fail',
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
        next(error);
        return;
      }
      next(new AppError('Failed to fetch site counts by zone'));
    }
  };
}