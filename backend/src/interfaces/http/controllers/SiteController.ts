// interface/http/controllers/SiteController.ts
import { Request, Response } from 'express';
import { SiteService } from '../../../application/services/SiteService';
import { AppError } from '../../../shared/errors/AppError';
import { POStatus } from '@prisma/client';
export class SiteController {
  constructor(private service: SiteService) {}

  createSite = async (req: Request, res: Response) => {
    try {
      const site = await this.service.createSite(req.body);

      res.status(201).json({
        status: 'success',
        data: site
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create site');
    }
  };

  updateSite = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const site = await this.service.updateSite(id, req.body);

      res.json({
        status: 'success',
        data: site
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update site');
    }
  };

  deleteSite = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.service.deleteSite(id);

      res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete site');
    }
  };

  getSite = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const site = await this.service.getSite(id);

      res.json({
        status: 'success',
        data: site
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Site not found', 404);
    }
  };

  getAllSites = async (req: Request, res: Response) => {
    try {
      const { status, zoneId, search } = req.query;

      const sites = await this.service.getAllSites({
        status: status as string,
        zoneId: zoneId as string,
        searchTerm: search as string
      });

      res.json({
        status: 'success',
        data: sites
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch sites');
    }
  };

  getSiteDetails = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const site = await this.service.getSiteDetails(id);

      res.json({
        status: 'success',
        data: site
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch site details');
    }
  };

  getSiteLoas = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, startDate, endDate } = req.query;

      const loas = await this.service.getSiteLoas(id, {
        status: status as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      });

      res.json({
        status: 'success',
        data: loas
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch site LOAs');
    }
  };

  getSitePurchaseOrders = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, startDate, endDate } = req.query;

      const pos = await this.service.getSitePurchaseOrders(id, {
        status: status as POStatus,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      });

      res.json({
        status: 'success',
        data: pos
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch site purchase orders');
    }
  };


}