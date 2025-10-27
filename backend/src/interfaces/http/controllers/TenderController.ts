import { Request, Response } from 'express';
import { TenderService } from '../../../application/services/TenderService';
import { AppError } from '../../../shared/errors/AppError';
import { TenderStatus } from '../../../domain/entities/constants';

export class TenderController {
  constructor(private service: TenderService) {}

  createTender = async (req: Request, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const tender = await this.service.createTender({
        ...req.body,
        documentFile: files?.documentFile?.[0],
        nitDocumentFile: files?.nitDocumentFile?.[0]
      });

      res.status(201).json({
        status: 'success',
        data: tender
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create tender');
    }
  };

  updateTender = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const updatedTender = await this.service.updateTender(id, {
        ...req.body,
        documentFile: files?.documentFile?.[0],
        nitDocumentFile: files?.nitDocumentFile?.[0]
      });

      res.json({
        status: 'success',
        data: updatedTender
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update tender');
    }
  };

  deleteTender = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.service.deleteTender(id);

      res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete tender');
    }
  };

  getTender = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const tender = await this.service.getTender(id);

      res.json({
        status: 'success',
        data: tender
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Tender not found', 404);
    }
  };

  getAllTenders = async (req: Request, res: Response) => {
    try {
      const { status, search } = req.query;

      const tenders = await this.service.getAllTenders({
        status: status as TenderStatus,
        searchTerm: search as string
      });

      res.json({
        status: 'success',
        data: tenders
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch tenders');
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedTender = await this.service.updateTenderStatus(id, status);

      res.json({
        status: 'success',
        data: updatedTender
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update tender status');
    }
  };
} 