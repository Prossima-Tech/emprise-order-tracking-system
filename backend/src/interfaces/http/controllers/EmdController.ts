// interfaces/http/controllers/EmdController.ts
import { Request, Response } from 'express';
import { EMDStatus } from '@prisma/client';
import { EmdService } from '../../../application/services/EmdService';
import { CreateEmdDto } from '../../../application/dtos/emd/CreateEmdDto';
import { UpdateEmdDto } from '../../../application/dtos/emd/UpdateEmdDto';

export class EmdController {
  constructor(private service: EmdService) {}

  /**
   * Create a new EMD
   * POST /api/emds
   */
  createEmd = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto: CreateEmdDto = {
        amount: parseFloat(req.body.amount),
        paymentMode: req.body.paymentMode || 'FDR',
        submissionDate: req.body.submissionDate,
        maturityDate: req.body.maturityDate,
        bankName: req.body.bankName || 'IDBI',
        documentFile: req.file,
        extractedData: req.body.extractedData ? JSON.parse(req.body.extractedData) : undefined,
        offerId: req.body.offerId,
        loaId: req.body.loaId,
        tenderId: req.body.tenderId,
        tags: req.body.tags,
      };

      const result = await this.service.createEmd(dto);

      if (!result.isSuccess) {
        res.status(400).json({
          status: 'error',
          message: result.error || 'Failed to create EMD',
          errors: result.data,
        });
        return;
      }

      res.status(201).json({
        status: 'success',
        message: 'EMD created successfully',
        data: result.data,
      });
    } catch (error) {
      console.error('Create EMD Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  };

  /**
   * Get all EMDs
   * GET /api/emds
   */
  getAllEmds = async (req: Request, res: Response): Promise<void> => {
    try {
      const params = {
        searchTerm: req.query.searchTerm as string,
        status: req.query.status as EMDStatus,
        offerId: req.query.offerId as string,
        loaId: req.query.loaId as string,
        tenderId: req.query.tenderId as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      };

      const result = await this.service.getAllEmds(params);

      if (!result.isSuccess) {
        res.status(400).json({
          status: 'error',
          message: result.error || 'Failed to fetch EMDs',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: result.data,
      });
    } catch (error) {
      console.error('Get All EMDs Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  };

  /**
   * Get EMD by ID
   * GET /api/emds/:id
   */
  getEmdById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.getEmdById(id);

      if (!result.isSuccess) {
        res.status(404).json({
          status: 'error',
          message: result.error || 'EMD not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: result.data,
      });
    } catch (error) {
      console.error('Get EMD By ID Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  };

  /**
   * Update an EMD
   * PUT /api/emds/:id
   */
  updateEmd = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const dto: UpdateEmdDto = {
        amount: req.body.amount ? parseFloat(req.body.amount) : undefined,
        paymentMode: req.body.paymentMode,
        submissionDate: req.body.submissionDate,
        maturityDate: req.body.maturityDate,
        bankName: req.body.bankName,
        documentFile: req.file,
        extractedData: req.body.extractedData ? JSON.parse(req.body.extractedData) : undefined,
        status: req.body.status as EMDStatus,
        offerId: req.body.offerId,
        loaId: req.body.loaId,
        tenderId: req.body.tenderId,
        tags: req.body.tags,
      };

      const result = await this.service.updateEmd(id, dto);

      if (!result.isSuccess) {
        res.status(400).json({
          status: 'error',
          message: result.error || 'Failed to update EMD',
          errors: result.data,
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        message: 'EMD updated successfully',
        data: result.data,
      });
    } catch (error) {
      console.error('Update EMD Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  };

  /**
   * Delete an EMD
   * DELETE /api/emds/:id
   */
  deleteEmd = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteEmd(id);

      if (!result.isSuccess) {
        res.status(400).json({
          status: 'error',
          message: result.error || 'Failed to delete EMD',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        message: 'EMD deleted successfully',
      });
    } catch (error) {
      console.error('Delete EMD Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  };

  /**
   * Update EMD status
   * PATCH /api/emds/:id/status
   */
  updateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(EMDStatus).includes(status)) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid status value',
        });
        return;
      }

      const result = await this.service.updateStatus(id, status);

      if (!result.isSuccess) {
        res.status(400).json({
          status: 'error',
          message: result.error || 'Failed to update EMD status',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        message: 'EMD status updated successfully',
        data: result.data,
      });
    } catch (error) {
      console.error('Update EMD Status Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  };

  /**
   * Get expiring EMDs
   * GET /api/emds/expiring/list
   */
  getExpiringEmds = async (req: Request, res: Response): Promise<void> => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const result = await this.service.getExpiringEmds(days);

      if (!result.isSuccess) {
        res.status(400).json({
          status: 'error',
          message: result.error || 'Failed to fetch expiring EMDs',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: result.data,
      });
    } catch (error) {
      console.error('Get Expiring EMDs Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  };

  /**
   * Extract data from document using AI
   * POST /api/emds/extract
   */
  extractData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { extractedText } = req.body;

      if (!extractedText) {
        res.status(400).json({
          status: 'error',
          message: 'extractedText is required',
        });
        return;
      }

      const result = await this.service.extractDataFromDocument({ extractedText });

      if (!result.isSuccess) {
        res.status(400).json({
          status: 'error',
          message: result.error || 'Failed to extract data',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: result.data,
      });
    } catch (error) {
      console.error('Extract Data Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  };
}
