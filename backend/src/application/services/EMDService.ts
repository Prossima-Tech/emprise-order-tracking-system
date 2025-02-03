// application/services/EMDService.ts
import { EMD, EMDStatus } from '../../domain/entities/EMD';
import { PrismaEmdRepository } from '../../infrastructure/persistence/repositories/PrismaEmdRepository';
import { S3Service } from '../../infrastructure/services/S3Service';
import { OCRService } from '../../infrastructure/services/OCRService';
import { CreateEmdDto } from '../dtos/emd/CreateEmdDto';
import { UpdateEmdDto } from '../dtos/emd/UpdateEmdDto';
import { EmdResponseDto } from '../dtos/emd/EmdResponseDto';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs/promises';

interface ServiceResult<T> {
  isSuccess: boolean;
  data?: T;
  error?: string;
}

export class EmdService {
  constructor(
    private repository: PrismaEmdRepository,
    private s3Service: S3Service,
    private ocrService: OCRService
  ) {}

  private async processDocument(file: Express.Multer.File): Promise<{
    documentUrl: string;
    extractedData?: any;
  }> {
    try {
      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const fileName = `emds/${crypto.randomUUID()}${fileExtension}`;

      // Read file buffer
      const fileBuffer = await fs.readFile(file.path);

      // Upload to S3
      const documentUrl = await this.s3Service.uploadFile(
        fileName,
        fileBuffer,
        file.mimetype
      );

      // Extract data if it's an image
      let extractedData;
      if (file.mimetype.startsWith('image/')) {
        extractedData = await this.ocrService.extractDataFromImage(file.path);
      }

      // Clean up temporary file
      await fs.unlink(file.path);

      return { documentUrl, extractedData };
    } catch (error) {
      console.error('Error processing document:', error);
      throw new Error('Failed to process document');
    }
  }

  async createEMD(dto: CreateEmdDto): Promise<ServiceResult<EmdResponseDto>> {
    try {
      let documentUrl = '';
      let extractedData;

      if (dto.documentFile) {
        const processedDoc = await this.processDocument(dto.documentFile);
        documentUrl = processedDoc.documentUrl;
        extractedData = processedDoc.extractedData;
      }

      // Convert amount to number explicitly
      const amount = typeof dto.amount === 'string' ? parseFloat(dto.amount) : dto.amount;

      // Validate amount
      if (isNaN(amount) || amount <= 0) {
        return {
          isSuccess: false,
          error: 'Invalid amount provided'
        };
      }

      let tags: string[] = [];
      if (dto.tags) {
        tags = typeof dto.tags === 'string' 
          ? JSON.parse(dto.tags) 
          : dto.tags;
      }

      const emd = await this.repository.create({
        amount,
        paymentMode: dto.paymentMode || 'FDR',
        submissionDate: new Date(dto.submissionDate),
        maturityDate: new Date(dto.maturityDate),
        bankName: dto.bankName || 'IDBI',
        documentUrl,
        extractedData,
        status: EMDStatus.ACTIVE,
        offerId: dto.offerId,
        tags
      });

      return {
        isSuccess: true,
        data: this.mapToResponseDto(emd)
      };
    } catch (error) {
      console.error('Error creating EMD:', error);
      return {
        isSuccess: false,
        error: 'Failed to create EMD'
      };
    }
  }

  async updateEMD(id: string, dto: UpdateEmdDto): Promise<ServiceResult<EmdResponseDto>> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        return {
          isSuccess: false,
          error: 'EMD not found'
        };
      }

      let documentUrl = existing.documentUrl;
      let extractedData = existing.extractedData;

      if (dto.documentFile) {
        const processedDoc = await this.processDocument(dto.documentFile);
        documentUrl = processedDoc.documentUrl;
        extractedData = processedDoc.extractedData;
      }

      const updated = await this.repository.update(id, {
        ...existing,
        amount: dto.amount ?? existing.amount,
        submissionDate: dto.submissionDate ? new Date(dto.submissionDate) : existing.submissionDate,
        maturityDate: dto.maturityDate ? new Date(dto.maturityDate) : existing.maturityDate,
        bankName: dto.bankName ?? existing.bankName,
        documentUrl,
        extractedData,
        status: (dto.status ?? existing.status) as EMDStatus,
        offerId: dto.offerId ?? existing.offerId,
        tags: dto.tags ?? existing.tags
      });

      return {
        isSuccess: true,
        data: this.mapToResponseDto(updated)
      };
    } catch (error) {
      console.error('Error updating EMD:', error);
      return {
        isSuccess: false,
        error: 'Failed to update EMD'
      };
    }
  }

  async deleteEMD(id: string): Promise<ServiceResult<void>> {
    try {
      await this.repository.delete(id);
      return { isSuccess: true };
    } catch (error) {
      console.error('Error deleting EMD:', error);
      return {
        isSuccess: false,
        error: 'Failed to delete EMD'
      };
    }
  }

  async getEMD(id: string): Promise<ServiceResult<EmdResponseDto>> {
    try {
      const emd = await this.repository.findById(id);
      if (!emd) {
        return {
          isSuccess: false,
          error: 'EMD not found'
        };
      }

      return {
        isSuccess: true,
        data: this.mapToResponseDto(emd)
      };
    } catch (error) {
      console.error('Error fetching EMD:', error);
      return {
        isSuccess: false,
        error: 'Failed to fetch EMD'
      };
    }
  }

  async getAllEMDs(params: {
    status?: EMDStatus;
    offerId?: string;
    searchTerm?: string;
  }): Promise<ServiceResult<{ data: EmdResponseDto[]; total: number }>> {
    try {
      const [emds, total] = await Promise.all([
        this.repository.findAll({
          status: params.status,
          offerId: params.offerId,
          searchTerm: params.searchTerm
        }),
        this.repository.count({
          status: params.status,
          offerId: params.offerId,
          searchTerm: params.searchTerm
        })
      ]);

      return {
        isSuccess: true,
        data: {
          data: emds.map(this.mapToResponseDto),
          total
        }
      };
    } catch (error) {
      console.error('Error fetching EMDs:', error);
      return {
        isSuccess: false,
        error: 'Failed to fetch EMDs'
      };
    }
  }

  async updateStatus(id: string, status: EMDStatus): Promise<ServiceResult<EmdResponseDto>> {
    try {
      const updated = await this.repository.updateStatus(id, status);
      return {
        isSuccess: true,
        data: this.mapToResponseDto(updated)
      };
    } catch (error) {
      console.error('Error updating EMD status:', error);
      return {
        isSuccess: false,
        error: 'Failed to update EMD status'
      };
    }
  }

  async getExpiringEMDs(daysThreshold: number): Promise<ServiceResult<EmdResponseDto[]>> {
    try {
      const emds = await this.repository.findExpiring(daysThreshold);
      return {
        isSuccess: true,
        data: emds.map(this.mapToResponseDto)
      };
    } catch (error) {
      console.error('Error fetching expiring EMDs:', error);
      return {
        isSuccess: false,
        error: 'Failed to fetch expiring EMDs'
      };
    }
  }

  private mapToResponseDto(emd: EMD): EmdResponseDto {
    return {
      id: emd.id,
      amount: emd.amount,
      paymentMode: emd.paymentMode,
      submissionDate: emd.submissionDate,
      maturityDate: emd.maturityDate,
      bankName: emd.bankName,
      documentUrl: emd.documentUrl,
      extractedData: emd.extractedData,
      status: emd.status,
      offer: emd.offer ? {
        id: emd.offer.id!,
        offerId: emd.offer.offerId,
        subject: emd.offer.subject
      } : undefined,
      offerId: emd.offerId,
      tags: emd.tags,
      createdAt: emd.createdAt,
      updatedAt: emd.updatedAt
    };
  }
}