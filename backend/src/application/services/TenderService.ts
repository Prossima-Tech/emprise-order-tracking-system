import { PrismaTenderRepository } from '../../infrastructure/persistence/repositories/PrismaTenderRepository';
import { S3Service } from '../../infrastructure/services/S3Service';
import { CreateTenderDto } from '../dtos/tender/CreateTenderDto';
import { UpdateTenderDto } from '../dtos/tender/UpdateTenderDto';
import { TenderResponseDto } from '../dtos/tender/TenderResponseDto';
import { TenderStatus } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError';
import { Tender } from '../../domain/entities/Tender';

interface ServiceResult<T> {
  isSuccess: boolean;
  data?: T;
  error?: string;
}

export class TenderService {
  constructor(
    private repository: PrismaTenderRepository,
    private s3Service: S3Service
  ) {}

  async createTender(dto: CreateTenderDto): Promise<TenderResponseDto> {
    try {
      // Check if tender number already exists
      const existingTender = await this.repository.findByTenderNumber(dto.tenderNumber);
      if (existingTender) {
        throw new AppError('Tender number already exists', 400);
      }

      let documentUrl: string | undefined;
      let nitDocumentUrl: string | undefined;

      // If document file is provided, upload to S3
      if (dto.documentFile) {
        try {
          const filename = `${dto.tenderNumber}-tender-${Date.now().toString()}`;
          const uploadResult = await this.s3Service.uploadFile(
            filename,
            dto.documentFile.buffer,
            dto.documentFile.mimetype
          );
          documentUrl = uploadResult;
        } catch (uploadError) {
          console.error('Error uploading tender document file to S3:', uploadError);
          throw new AppError('Failed to upload tender document file', 500);
        }
      }

      // If NIT document file is provided, upload to S3
      if (dto.nitDocumentFile) {
        try {
          const filename = `${dto.tenderNumber}-nit-${Date.now().toString()}`;
          const uploadResult = await this.s3Service.uploadFile(
            filename,
            dto.nitDocumentFile.buffer,
            dto.nitDocumentFile.mimetype
          );
          nitDocumentUrl = uploadResult;
        } catch (uploadError) {
          console.error('Error uploading NIT document file to S3:', uploadError);
          // Clean up tender document if already uploaded
          if (documentUrl) {
            try {
              await this.s3Service.deleteFile(documentUrl);
            } catch (deleteError) {
              console.error('Failed to delete tender document after NIT upload error:', deleteError);
            }
          }
          throw new AppError('Failed to upload NIT document file', 500);
        }
      }

      try {
        // Ensure proper type conversion for all fields
        const hasEMD = typeof dto.hasEMD === 'string' 
          ? (dto.hasEMD as string).toLowerCase() === 'true' 
          : !!dto.hasEMD;
        
        let emdAmount: number | undefined = undefined;
        if (hasEMD && dto.emdAmount !== undefined && dto.emdAmount !== null) {
          emdAmount = typeof dto.emdAmount === 'string'
            ? parseFloat(dto.emdAmount)
            : dto.emdAmount;
        }

        const tender = await this.repository.create({
          tenderNumber: dto.tenderNumber,
          dueDate: typeof dto.dueDate === 'string' ? new Date(dto.dueDate) : dto.dueDate,
          description: dto.description,
          hasEMD,
          emdAmount,
          status: dto.status || TenderStatus.ACTIVE,
          documentUrl,
          nitDocumentUrl,
          tags: dto.tags || []
        });

        return this.mapToResponseDto(tender);
      } catch (dbError) {
        console.error('Error creating tender in database:', dbError);
        // If we uploaded files but failed to create the tender, clean up the files
        if (documentUrl) {
          try {
            await this.s3Service.deleteFile(documentUrl);
          } catch (deleteError) {
            console.error('Failed to delete tender document after tender creation error:', deleteError);
          }
        }
        if (nitDocumentUrl) {
          try {
            await this.s3Service.deleteFile(nitDocumentUrl);
          } catch (deleteError) {
            console.error('Failed to delete NIT document after tender creation error:', deleteError);
          }
        }
        throw new AppError('Failed to create tender in database', 500);
      }
    } catch (error) {
      console.error('Tender creation failed:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create tender', 500);
    }
  }

  async updateTender(id: string, dto: UpdateTenderDto): Promise<TenderResponseDto> {
    try {
      const tender = await this.repository.findById(id);
      if (!tender) {
        throw new AppError('Tender not found', 404);
      }

      let documentUrl = tender.documentUrl;
      let nitDocumentUrl = tender.nitDocumentUrl;

      // If tender document file is provided, upload to S3
      if (dto.documentFile) {
        // Delete old document if exists
        if (tender.documentUrl) {
          await this.s3Service.deleteFile(tender.documentUrl);
        }

        const filename = `${tender.tenderNumber}-tender-${Date.now().toString()}`;
        const uploadResult = await this.s3Service.uploadFile(
          filename,
          dto.documentFile.buffer,
          dto.documentFile.mimetype
        );
        documentUrl = uploadResult;
      }

      // If NIT document file is provided, upload to S3
      if (dto.nitDocumentFile) {
        // Delete old NIT document if exists
        if (tender.nitDocumentUrl) {
          await this.s3Service.deleteFile(tender.nitDocumentUrl);
        }

        const filename = `${tender.tenderNumber}-nit-${Date.now().toString()}`;
        const uploadResult = await this.s3Service.uploadFile(
          filename,
          dto.nitDocumentFile.buffer,
          dto.nitDocumentFile.mimetype
        );
        nitDocumentUrl = uploadResult;
      }

      // If tenderNumber is changed, check if new tenderNumber is unique
      if (dto.tenderNumber && dto.tenderNumber !== tender.tenderNumber) {
        const existingTender = await this.repository.findByTenderNumber(dto.tenderNumber);
        if (existingTender) {
          throw new AppError('Tender number already exists', 400);
        }
      }

      // Ensure proper type conversion for all fields
      const hasEMD = dto.hasEMD !== undefined 
        ? (typeof dto.hasEMD === 'string' 
            ? (dto.hasEMD as string).toLowerCase() === 'true' 
            : !!dto.hasEMD)
        : tender.hasEMD;
      
      // Convert emdAmount properly
      let emdAmount: number | undefined = undefined;
      if (hasEMD) {
        if (dto.emdAmount !== undefined && dto.emdAmount !== null) {
          emdAmount = typeof dto.emdAmount === 'string'
            ? parseFloat(dto.emdAmount)
            : dto.emdAmount;
        } else if (tender.emdAmount !== undefined) {
          emdAmount = tender.emdAmount;
        }
      }

      const updatedTender = await this.repository.update(id, {
        tenderNumber: dto.tenderNumber,
        dueDate: dto.dueDate ? (typeof dto.dueDate === 'string' ? new Date(dto.dueDate) : dto.dueDate) : undefined,
        description: dto.description,
        hasEMD,
        emdAmount,
        status: dto.status,
        documentUrl,
        nitDocumentUrl,
        tags: dto.tags
      });

      return this.mapToResponseDto(updatedTender);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update tender', 500);
    }
  }

  async deleteTender(id: string): Promise<void> {
    try {
      const tender = await this.repository.findById(id);
      if (!tender) {
        throw new AppError('Tender not found', 404);
      }

      // Delete documents from S3 if exists
      if (tender.documentUrl) {
        await this.s3Service.deleteFile(tender.documentUrl);
      }
      if (tender.nitDocumentUrl) {
        await this.s3Service.deleteFile(tender.nitDocumentUrl);
      }

      await this.repository.delete(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete tender', 500);
    }
  }

  async getTender(id: string): Promise<TenderResponseDto> {
    try {
      const tender = await this.repository.findById(id);
      if (!tender) {
        throw new AppError('Tender not found', 404);
      }

      return this.mapToResponseDto(tender);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get tender', 500);
    }
  }

  async getAllTenders(options?: {
    status?: TenderStatus;
    searchTerm?: string;
  }): Promise<{ data: TenderResponseDto[]; total: number }> {
    try {
      const result = await this.repository.findAll(options);
      
      // Ensure we have a valid result with data array
      if (!result || !result.data) {
        return { data: [], total: 0 };
      }

      return {
        data: result.data.map((tender) => this.mapToResponseDto(tender)),
        total: result.total
      };
    } catch (error) {
      console.error('Error in getAllTenders:', error);
      // Return empty data instead of throwing error
      return { data: [], total: 0 };
    }
  }

  async updateTenderStatus(id: string, status: TenderStatus): Promise<TenderResponseDto> {
    try {
      const tender = await this.repository.findById(id);
      if (!tender) {
        throw new AppError('Tender not found', 404);
      }

      const updatedTender = await this.repository.update(id, { status });

      return this.mapToResponseDto(updatedTender);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update tender status', 500);
    }
  }

  private mapToResponseDto(tender: Tender): TenderResponseDto {
    return {
      id: tender.id,
      tenderNumber: tender.tenderNumber,
      dueDate: tender.dueDate,
      description: tender.description,
      hasEMD: tender.hasEMD,
      emdAmount: tender.emdAmount,
      status: tender.status,
      documentUrl: tender.documentUrl,
      nitDocumentUrl: tender.nitDocumentUrl,
      tags: tender.tags,
      createdAt: tender.createdAt,
      updatedAt: tender.updatedAt
    };
  }
} 