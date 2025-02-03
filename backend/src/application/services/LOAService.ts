// application/services/LoaService.ts
import { promises as fs } from 'fs';
import { PrismaLoaRepository } from '../../infrastructure/persistence/repositories/PrismaLoaRepository';
import { S3Service } from '../../infrastructure/services/S3Service';
import { CreateLoaDto } from '../dtos/loa/CreateLoaDto';
import { UpdateLoaDto } from '../dtos/loa/UpdateLoaDto';
import { CreateAmendmentDto } from '../dtos/loa/CreateAmendmentDto';
import { UpdateAmendmentDto } from '../dtos/loa/UpdateAmendmentDto';
import { Result, ResultUtils } from '../../shared/types/common.types';
import { LoaValidator } from '../validators/loa.validator';
import { AppError } from '../../shared/errors/AppError';
import path from 'path';

export class LoaService {
    private validator: LoaValidator;

    constructor(
        private repository: PrismaLoaRepository,
        private storageService: S3Service
    ) {
        this.validator = new LoaValidator();
    }

    private async processDocument(file: Express.Multer.File): Promise<string> {
        try {
          // Generate unique filename
          const fileExtension = path.extname(file.originalname);
          const fileName = `loas/${crypto.randomUUID()}${fileExtension}`;
    
          // Read file buffer
          const fileBuffer = await fs.readFile(file.path);
    
          // Upload to S3
          const documentUrl = await this.storageService.uploadFile(
            fileName,
            fileBuffer,
            file.mimetype
          );
    

          return documentUrl;
        } catch (error) {
          console.error('Error processing document:', error);
          throw new Error('Failed to process document');
        }
      }

    async createLoa(dto: CreateLoaDto): Promise<Result<any>> {
        try {
            // Validate input
            const validationResult = this.validator.validate(dto);
            if (!validationResult.isSuccess) {
                return ResultUtils.fail('Validation processing failed');
            }

            if (validationResult.data && validationResult.data.length > 0) {
                return ResultUtils.fail('Validation failed', validationResult.data);
            }

            // Check if LOA number already exists
            const existingLoa = await this.repository.findByLoaNumber(dto.loaNumber);
            if (existingLoa) {
                return ResultUtils.fail('LOA number already exists');
            }

            let documentUrl = '';
            if (dto.documentFile) {
                documentUrl = await this.processDocument(dto.documentFile);
            }

            let tags: string[] = [];
            if (dto.tags) {
                tags = typeof dto.tags === 'string' 
                    ? JSON.parse(dto.tags) 
                    : dto.tags;
            }

            const loa = await this.repository.create({
                loaNumber: dto.loaNumber,
                loaValue: dto.loaValue,
                deliveryPeriod: {
                    start: new Date(dto.deliveryPeriod.start).toISOString(),
                    end: new Date(dto.deliveryPeriod.end).toISOString()
                },
                workDescription: dto.workDescription,
                documentUrl: documentUrl || 'pending',
                tags
            });

            return ResultUtils.ok(loa);
        } catch (error) {
            console.error('LOA Creation Error:', error);
            throw new AppError('Failed to create LOA record');
        }
    }

    async updateLoa(id: string, dto: UpdateLoaDto): Promise<Result<any>> {
        try {
            const existingLoa = await this.repository.findById(id);
            if (!existingLoa) {
                return ResultUtils.fail('LOA not found');
            }

            // If updating LOA number, check for uniqueness
            if (dto.loaNumber && dto.loaNumber !== existingLoa.loaNumber) {
                const duplicateLoa = await this.repository.findByLoaNumber(dto.loaNumber);
                if (duplicateLoa) {
                    return ResultUtils.fail('LOA number already exists');
                }
            }

            let documentUrl = existingLoa.documentUrl;
            if (dto.documentFile) {
                documentUrl = await this.processDocument(dto.documentFile);
            }

            let tags = existingLoa.tags;
            if (dto.tags) {
                tags = typeof dto.tags === 'string' 
                    ? JSON.parse(dto.tags) 
                    : dto.tags;
            }

            const updatedLoa = await this.repository.update(id, {
                ...dto,
                documentUrl,
                tags,
                deliveryPeriod: dto.deliveryPeriod ? {
                    start: new Date(dto.deliveryPeriod.start),
                    end: new Date(dto.deliveryPeriod.end)
                } : undefined
            });

            return ResultUtils.ok(updatedLoa);
        } catch (error) {
            console.error('LOA Update Error:', error);
            throw new AppError('Failed to update LOA record');
        }
    }

    async deleteLoa(id: string): Promise<Result<void>> {
        try {
            const idValidation = this.validator.validateId(id);
            if (!idValidation.isSuccess) {
                return ResultUtils.fail('Invalid ID format');
            }
    
            const loa = await this.repository.findById(id);
            if (!loa) {
                return ResultUtils.fail('LOA not found');
            }
    
            // Check if LOA has any purchase orders
            if (loa.purchaseOrders && loa.purchaseOrders.length > 0) {
                return ResultUtils.fail('Cannot delete LOA with associated purchase orders');
            }
    
            // First delete all amendments associated with this LOA
            if (loa.amendments && loa.amendments.length > 0) {
                for (const amendment of loa.amendments) {
                    // Delete amendment document if exists
                    // if (amendment.documentUrl) {
                    //     await this.storageService.deleteDocument(amendment.documentUrl);
                    // }
                    await this.repository.deleteAmendment(amendment.id);
                }
            }
    
            // Delete LOA document if exists
            // if (loa.documentUrl) {
            //     await this.storageService.deleteDocument(loa.documentUrl);
            // }
    
            // Finally delete the LOA
            await this.repository.delete(id);
            return ResultUtils.ok(undefined);
        } catch (error) {
            console.error('LOA Deletion Error:', error);
            throw new AppError('Failed to delete LOA record');
        }
    }

    async getLoa(id: string): Promise<Result<any>> {
        try {
            const idValidation = this.validator.validateId(id);
            if (!idValidation.isSuccess) {
                return ResultUtils.fail('Invalid ID format');
            }

            const loa = await this.repository.findById(id);
            if (!loa) {
                return ResultUtils.fail('LOA not found');
            }

            return ResultUtils.ok(loa);
        } catch (error) {
            console.error('LOA Fetch Error:', error);
            throw new AppError('Failed to fetch LOA record');
        }
    }

    async getAllLoas(params: {
        searchTerm?: string;
    }): Promise<Result<{ loas: any[]; total: number }>> {
        try {
            const [loas, total] = await Promise.all([
                this.repository.findAll({
                    searchTerm: params.searchTerm
                }),
                this.repository.count({
                    searchTerm: params.searchTerm
                })
            ]);

            return ResultUtils.ok({
                loas,
                total
            });
        } catch (error) {
            console.error('LOAs Fetch Error:', error);
            throw new AppError('Failed to fetch LOA records');
        }
    }

    async createAmendment(loaId: string, dto: CreateAmendmentDto): Promise<Result<any>> {
        try {
            const validationResult = this.validator.validateAmendment(dto);
            if (!validationResult.isSuccess) {
                return ResultUtils.fail('Validation processing failed');
            }

            const loa = await this.repository.findById(loaId);
            if (!loa) {
                return ResultUtils.fail('LOA not found');
            }

            let documentUrl = '';
            if (dto.documentFile) {
                const fileName = `amendments/${loaId}/${crypto.randomUUID()}${path.extname(dto.documentFile.originalname)}`;
                documentUrl = await this.storageService.uploadFile(
                    fileName,
                    dto.documentFile.buffer,
                    dto.documentFile.mimetype
                );
            }

            let tags: string[] = [];
            if (dto.tags) {
                tags = typeof dto.tags === 'string' 
                    ? JSON.parse(dto.tags) 
                    : dto.tags;
            }

            const amendment = await this.repository.createAmendment({
                amendmentNumber: dto.amendmentNumber,
                documentUrl: documentUrl || 'pending',
                loaId,
                tags
            });

            return ResultUtils.ok(amendment);
        } catch (error) {
            console.error('Amendment Creation Error:', error);
            throw new AppError('Failed to create amendment record');
        }
    }

    async updateAmendment(id: string, dto: UpdateAmendmentDto): Promise<Result<any>> {
        try {
            const existingAmendment = await this.repository.findAmendmentById(id);
            if (!existingAmendment) {
                return ResultUtils.fail('Amendment not found');
            }
    
            let documentUrl = existingAmendment.documentUrl;
            if (dto.documentFile) {
                const fileName = `amendments/${existingAmendment.loaId}/${crypto.randomUUID()}${path.extname(dto.documentFile.originalname)}`;
                documentUrl = await this.storageService.uploadFile(
                    fileName,
                    dto.documentFile.buffer,
                    dto.documentFile.mimetype
                );
            }
    
            let tags = existingAmendment.tags;
            if (dto.tags) {
                tags = typeof dto.tags === 'string' 
                    ? JSON.parse(dto.tags) 
                    : dto.tags;
            }
    
            const updatedAmendment = await this.repository.updateAmendment(id, {
                amendmentNumber: dto.amendmentNumber || existingAmendment.amendmentNumber,
                documentUrl,
                tags
            });
    
            return ResultUtils.ok(updatedAmendment);
        } catch (error) {
            console.error('Amendment Update Error:', error);
            throw new AppError('Failed to update amendment record');
        }
    }

    async deleteAmendment(id: string): Promise<Result<void>> {
        try {
            const amendment = await this.repository.findAmendmentById(id);
            if (!amendment) {
                return ResultUtils.fail('Amendment not found');
            }

            // if (amendment.documentUrl) {
            //     await this.storageService.deleteDocument(amendment.documentUrl);
            // }

            await this.repository.deleteAmendment(id);
            return ResultUtils.ok(undefined);
        } catch (error) {
            console.error('Amendment Deletion Error:', error);
            throw new AppError('Failed to delete amendment record');
        }
    }
}