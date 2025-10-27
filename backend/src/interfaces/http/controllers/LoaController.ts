import { Request, Response, NextFunction } from 'express';
import { LoaService } from '../../../application/services/LOAService';
import { BulkImportService } from '../../../application/services/BulkImportService';
import { AppError } from '../../../shared/errors/AppError';

export class LoaController {
  constructor(
    private service: LoaService,
    private bulkImportService: BulkImportService
  ) {}

  createLoa = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse delivery period from string to JSON if needed
      let deliveryPeriod;
      try {
        deliveryPeriod = typeof req.body.deliveryPeriod === 'string'
          ? JSON.parse(req.body.deliveryPeriod)
          : req.body.deliveryPeriod;
      } catch (error) {
        console.error('Error parsing delivery period:', error);
        res.status(400).json({ message: 'Invalid delivery period format' });
        return;
      }

      // Parse tags from string to JSON if needed
      let tags: string[] = [];
      if (req.body.tags) {
        try {
          tags = typeof req.body.tags === 'string'
            ? JSON.parse(req.body.tags)
            : req.body.tags;
        } catch (error) {
          console.error('Error parsing tags:', error);
        }
      }

      // Parse loaValue as number with default value of 0
      const loaValue = req.body.loaValue ? Number(req.body.loaValue) : 0;

      // Process the uploaded files
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Access the document file
      const documentFile = files?.documentFile?.[0];
      const securityDepositFile = files?.securityDepositFile?.[0];
      const performanceGuaranteeFile = files?.performanceGuaranteeFile?.[0];

      // Parse boolean values
      const hasEmd = req.body.hasEmd === 'true' || req.body.hasEmd === true;
      const hasSecurityDeposit = req.body.hasSecurityDeposit === 'true' || req.body.hasSecurityDeposit === true;
      const hasPerformanceGuarantee = req.body.hasPerformanceGuarantee === 'true' || req.body.hasPerformanceGuarantee === true;

      // Parse amount values
      const emdAmount = req.body.emdAmount ? Number(req.body.emdAmount) : undefined;
      const securityDepositAmount = req.body.securityDepositAmount ? Number(req.body.securityDepositAmount) : undefined;
      const performanceGuaranteeAmount = req.body.performanceGuaranteeAmount ? Number(req.body.performanceGuaranteeAmount) : undefined;

      // Parse invoice/billing amount values
      const invoiceAmount = req.body.invoiceAmount ? Number(req.body.invoiceAmount) : undefined;
      const totalReceivables = req.body.totalReceivables ? Number(req.body.totalReceivables) : undefined;
      const actualAmountReceived = req.body.actualAmountReceived ? Number(req.body.actualAmountReceived) : undefined;
      const amountDeducted = req.body.amountDeducted ? Number(req.body.amountDeducted) : undefined;
      const amountPending = req.body.amountPending ? Number(req.body.amountPending) : undefined;

      const result = await this.service.createLoa({
        loaNumber: req.body.loaNumber,
        loaValue: loaValue,
        deliveryPeriod: deliveryPeriod,
        workDescription: req.body.workDescription,
        siteId: req.body.siteId,
        tags,
        documentFile,
        // New fields
        hasEmd,
        emdAmount,
        hasSecurityDeposit,
        securityDepositAmount,
        securityDepositFile,
        hasPerformanceGuarantee,
        performanceGuaranteeAmount,
        performanceGuaranteeFile,
        // Billing/Invoice fields
        invoiceNumber: req.body.invoiceNumber,
        invoiceAmount,
        totalReceivables,
        actualAmountReceived,
        amountDeducted,
        amountPending,
        deductionReason: req.body.deductionReason,
        billLinks: req.body.billLinks,
        remarks: req.body.remarks,
      });

      if (!result.isSuccess) {
        const statusCode = result.error && Array.isArray(result.error)
          ? 400 // Validation error
          : 500; // Server error

        res.status(statusCode).json({
          message: Array.isArray(result.error)
            ? result.error[0]?.message || 'Validation failed'
            : result.error || 'Failed to create LOA'
        });
        return;
      }

      res.status(201).json(result.data);
    } catch (error) {
      next(error);
    }
  };

  updateLoa = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ message: 'LOA ID is required' });
        return;
      }

      // Parse delivery period from string to JSON if needed
      let deliveryPeriod = undefined;

      if (req.body.deliveryPeriod) {
        try {
          deliveryPeriod = typeof req.body.deliveryPeriod === 'string'
            ? JSON.parse(req.body.deliveryPeriod)
            : req.body.deliveryPeriod;
        } catch (error) {
          console.error('Error parsing delivery period:', error);
          res.status(400).json({ message: 'Invalid delivery period format' });
          return;
        }
      }

      // Parse tags from string to JSON if needed
      let tags: string[] | undefined = undefined;
      if (req.body.tags) {
        try {
          tags = typeof req.body.tags === 'string'
            ? JSON.parse(req.body.tags)
            : req.body.tags;
        } catch (error) {
          console.error('Error parsing tags:', error);
        }
      }

      // Parse loaValue as number if present
      const loaValue = req.body.loaValue ? Number(req.body.loaValue) : undefined;

      // Process the uploaded files
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Access the document file
      const documentFile = files?.documentFile?.[0];
      const securityDepositFile = files?.securityDepositFile?.[0];
      const performanceGuaranteeFile = files?.performanceGuaranteeFile?.[0];

      // Parse boolean values if present
      const hasEmd = req.body.hasEmd !== undefined ? 
        (req.body.hasEmd === 'true' || req.body.hasEmd === true) : 
        undefined;
      const hasSecurityDeposit = req.body.hasSecurityDeposit !== undefined ? 
        (req.body.hasSecurityDeposit === 'true' || req.body.hasSecurityDeposit === true) : 
        undefined;
      const hasPerformanceGuarantee = req.body.hasPerformanceGuarantee !== undefined ? 
        (req.body.hasPerformanceGuarantee === 'true' || req.body.hasPerformanceGuarantee === true) : 
        undefined;

      // Parse amount values if present
      const emdAmount = req.body.emdAmount ? Number(req.body.emdAmount) : undefined;
      const securityDepositAmount = req.body.securityDepositAmount ? Number(req.body.securityDepositAmount) : undefined;
      const performanceGuaranteeAmount = req.body.performanceGuaranteeAmount ? Number(req.body.performanceGuaranteeAmount) : undefined;

      // Parse invoice/billing amount values
      const invoiceAmount = req.body.invoiceAmount ? Number(req.body.invoiceAmount) : undefined;
      const totalReceivables = req.body.totalReceivables ? Number(req.body.totalReceivables) : undefined;
      const actualAmountReceived = req.body.actualAmountReceived ? Number(req.body.actualAmountReceived) : undefined;
      const amountDeducted = req.body.amountDeducted ? Number(req.body.amountDeducted) : undefined;
      const amountPending = req.body.amountPending ? Number(req.body.amountPending) : undefined;

      const result = await this.service.updateLoa(id, {
        loaNumber: req.body.loaNumber,
        loaValue: loaValue,
        deliveryPeriod,
        workDescription: req.body.workDescription,
        siteId: req.body.siteId,
        tags,
        documentFile,
        // New fields
        hasEmd,
        emdAmount,
        hasSecurityDeposit,
        securityDepositAmount,
        securityDepositFile,
        hasPerformanceGuarantee,
        performanceGuaranteeAmount,
        performanceGuaranteeFile,
        // Billing/Invoice fields
        invoiceNumber: req.body.invoiceNumber,
        invoiceAmount,
        totalReceivables,
        actualAmountReceived,
        amountDeducted,
        amountPending,
        deductionReason: req.body.deductionReason,
        billLinks: req.body.billLinks,
        remarks: req.body.remarks,
      });

      if (!result.isSuccess) {
        const statusCode = result.error && Array.isArray(result.error)
          ? 400 // Validation error
          : 500; // Server error

        res.status(statusCode).json({
          message: Array.isArray(result.error)
            ? result.error[0]?.message || 'Validation failed'
            : result.error || 'Failed to update LOA'
        });
        return;
      }

      res.status(200).json(result.data);
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
      const { page, limit, search, sortBy, sortOrder } = req.query;

      const result = await this.service.getAllLoas({
        searchTerm: search as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
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

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ message: 'LOA ID is required' });
        return;
      }

      const { status, reason } = req.body;

      if (!status) {
        res.status(400).json({ message: 'Status is required' });
        return;
      }

      console.log(`Updating LOA ${id} status to ${status}`);

      const result = await this.service.updateStatus(id, { status, reason });

      if (!result.isSuccess) {
        const statusCode = result.error && Array.isArray(result.error)
          ? 400 // Validation error
          : 500; // Server error

        res.status(statusCode).json({
          message: Array.isArray(result.error)
            ? result.error[0]?.message || 'Validation failed'
            : result.error || 'Failed to update LOA status'
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  bulkImport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        res.status(400).json({
          status: 'error',
          message: 'Excel file is required'
        });
        return;
      }

      // Validate file type
      const allowedMimeTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
      ];

      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        res.status(400).json({
          status: 'error',
          message: 'Only Excel files (.xlsx, .xls) are allowed'
        });
        return;
      }

      console.log(`Processing bulk import from file: ${req.file.originalname}`);

      // Process the bulk import
      const result = await this.bulkImportService.bulkImport(req.file);

      if (!result.isSuccess) {
        res.status(500).json({
          status: 'error',
          message: result.error || 'Failed to process bulk import'
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: result.data
      });
    } catch (error) {
      console.error('Bulk import error:', error);
      next(error);
    }
  };
}