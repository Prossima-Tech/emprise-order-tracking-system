// application/services/LoaService.ts
import { promises as fs } from 'fs';
import { PrismaLoaRepository } from '../../infrastructure/persistence/repositories/PrismaLoaRepository';
import { S3Service } from '../../infrastructure/services/S3Service';
import { CreateLoaDto } from '../dtos/loa/CreateLoaDto';
import { UpdateLoaDto } from '../dtos/loa/UpdateLoaDto';
import { CreateAmendmentDto } from '../dtos/loa/CreateAmendmentDto';
import { UpdateAmendmentDto } from '../dtos/loa/UpdateAmendmentDto';
import { UpdateStatusDto } from '../dtos/loa/UpdateStatusDto';
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
            // Step 1: Validate the input data
            const validationResult = this.validator.validate(dto);
            if (!validationResult.isSuccess) {
                return ResultUtils.fail('Validation processing failed');
            }
            
            if (validationResult.data && validationResult.data.length > 0) {
                return ResultUtils.fail('Validation failed', validationResult.data);
            }

            // Step 2: Check for existing LOA with the same number
            const existingLoa = await this.repository.findByLoaNumber(dto.loaNumber);
            if (existingLoa) {
                return ResultUtils.fail('LOA number already exists');
            }

            // Step 3: Process and normalize tags
            let tags: string[] = [];
            if (dto.tags) {
                if (Array.isArray(dto.tags)) {
                  tags = dto.tags;
                } else if (typeof dto.tags === 'string') {
                  try {
                    const parsedTags = JSON.parse(dto.tags);
                    if (Array.isArray(parsedTags)) {
                      tags = parsedTags;
                    }
                  } catch (error) {
                    console.warn('Failed to parse tags string, using empty array:', error);
                  }
                }
              }

            // Step 4: Process document files
            const documentUrls = await this.processDocumentFiles(dto);
            if (!documentUrls.success) {
                return ResultUtils.fail(documentUrls.errorMessage || 'Failed to process document files');
            }

            // Step 5: Create LOA record with optional invoice
            const loa = await this.repository.create({
                loaNumber: dto.loaNumber,
                loaValue: dto.loaValue,
                deliveryPeriod: {
                    start: new Date(dto.deliveryPeriod.start).toISOString(),
                    end: new Date(dto.deliveryPeriod.end).toISOString()
                },
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                orderReceivedDate: dto.orderReceivedDate ? new Date(dto.orderReceivedDate) : undefined,
                siteId: dto.siteId,
                workDescription: dto.workDescription,
                documentUrl: documentUrls.documentUrl || 'pending',
                tags,
                remarks2: dto.remarks2,
                hasEmd: dto.hasEmd || false,
                emdAmount: dto.emdAmount,
                hasSecurityDeposit: dto.hasSecurityDeposit || false,
                securityDepositAmount: dto.securityDepositAmount,
                securityDepositDocumentUrl: documentUrls.securityDepositDocumentUrl,
                hasPerformanceGuarantee: dto.hasPerformanceGuarantee || false,
                performanceGuaranteeAmount: dto.performanceGuaranteeAmount,
                performanceGuaranteeDocumentUrl: documentUrls.performanceGuaranteeDocumentUrl
            });

            // Step 6: Create Invoice record if billing data exists
            const hasBillingData = dto.invoiceNumber ||
                                   dto.invoiceAmount ||
                                   dto.totalReceivables ||
                                   dto.actualAmountReceived ||
                                   dto.amountDeducted ||
                                   dto.amountPending ||
                                   dto.deductionReason ||
                                   dto.billLinks ||
                                   dto.remarks;

            if (hasBillingData) {
                await this.repository.createInvoice({
                    loaId: loa.id,
                    invoiceNumber: dto.invoiceNumber,
                    invoiceAmount: dto.invoiceAmount,
                    totalReceivables: dto.totalReceivables,
                    actualAmountReceived: dto.actualAmountReceived,
                    amountDeducted: dto.amountDeducted,
                    amountPending: dto.amountPending,
                    deductionReason: dto.deductionReason,
                    billLinks: dto.billLinks,
                    invoicePdfUrl: documentUrls.invoicePdfUrl,
                    remarks: dto.remarks,
                });
            }

            return ResultUtils.ok(loa);
        } catch (error) {
            console.error('LOA Creation Error:', error);
            return ResultUtils.fail('Failed to create LOA record');
        }
    }

    /**
     * Helper method to process all document files for an LOA
     */
    private async processDocumentFiles(dto: CreateLoaDto): Promise<{
        success: boolean;
        documentUrl?: string;
        securityDepositDocumentUrl?: string;
        performanceGuaranteeDocumentUrl?: string;
        invoicePdfUrl?: string;
        errorMessage?: string;
    }> {
        try {
            // Initialize empty URLs
            let documentUrl = '';
            let securityDepositDocumentUrl = '';
            let performanceGuaranteeDocumentUrl = '';
            let invoicePdfUrl = '';

            // Process main LOA document
            if (dto.documentFile) {
                try {
                    documentUrl = await this.processDocument(dto.documentFile);
                } catch (error) {
                    console.error('Error processing LOA document file:', error);
                    return {
                        success: false,
                        errorMessage: 'Failed to process LOA document file'
                    };
                }
            }

            // Process security deposit document (if applicable)
            if (dto.securityDepositFile && dto.hasSecurityDeposit) {
                try {
                    securityDepositDocumentUrl = await this.processDocument(dto.securityDepositFile);
                } catch (error) {
                    console.error('Error processing security deposit file:', error);
                    return {
                        success: false,
                        errorMessage: 'Failed to process security deposit file'
                    };
                }
            }

            // Process performance guarantee document (if applicable)
            if (dto.performanceGuaranteeFile && dto.hasPerformanceGuarantee) {
                try {
                    performanceGuaranteeDocumentUrl = await this.processDocument(dto.performanceGuaranteeFile);
                } catch (error) {
                    console.error('Error processing performance guarantee file:', error);
                    return {
                        success: false,
                        errorMessage: 'Failed to process performance guarantee file'
                    };
                }
            }

            // Process invoice PDF (if applicable)
            if (dto.invoicePdfFile) {
                try {
                    invoicePdfUrl = await this.processDocument(dto.invoicePdfFile);
                } catch (error) {
                    console.error('Error processing invoice PDF file:', error);
                    return {
                        success: false,
                        errorMessage: 'Failed to process invoice PDF file'
                    };
                }
            }

            return {
                success: true,
                documentUrl,
                securityDepositDocumentUrl,
                performanceGuaranteeDocumentUrl,
                invoicePdfUrl
            };
        } catch (error) {
            console.error('Document processing error:', error);
            return {
                success: false,
                errorMessage: 'Unexpected error while processing documents'
            };
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

            // Process files
            let documentUrl = existingLoa.documentUrl;
            let securityDepositDocumentUrl = existingLoa.securityDepositDocumentUrl;
            let performanceGuaranteeDocumentUrl = existingLoa.performanceGuaranteeDocumentUrl;
            let invoicePdfUrl: string | undefined;

            if (dto.documentFile) {
                try {
                    documentUrl = await this.processDocument(dto.documentFile);
                } catch (error) {
                    console.error('Error processing document file:', error);
                    return ResultUtils.fail('Failed to process document file');
                }
            }

            if (dto.securityDepositFile && dto.hasSecurityDeposit) {
                try {
                    securityDepositDocumentUrl = await this.processDocument(dto.securityDepositFile);
                } catch (error) {
                    console.error('Error processing security deposit file:', error);
                    return ResultUtils.fail('Failed to process security deposit file');
                }
            }

            if (dto.performanceGuaranteeFile && dto.hasPerformanceGuarantee) {
                try {
                    performanceGuaranteeDocumentUrl = await this.processDocument(dto.performanceGuaranteeFile);
                } catch (error) {
                    console.error('Error processing performance guarantee file:', error);
                    return ResultUtils.fail('Failed to process performance guarantee file');
                }
            }

            if (dto.invoicePdfFile) {
                try {
                    invoicePdfUrl = await this.processDocument(dto.invoicePdfFile);
                } catch (error) {
                    console.error('Error processing invoice PDF file:', error);
                    return ResultUtils.fail('Failed to process invoice PDF file');
                }
            }

            // Handle tags
            let tags = existingLoa.tags;
            if (dto.tags) {
                if (typeof dto.tags === 'string') {
                    try {
                        tags = JSON.parse(dto.tags);
                    } catch (error) {
                        console.error('Error parsing tags:', error);
                    }
                } else {
                    tags = dto.tags;
                }
            }

            // Prepare delivery period data if provided
            const deliveryPeriod = dto.deliveryPeriod ? {
                start: new Date(dto.deliveryPeriod.start),
                end: new Date(dto.deliveryPeriod.end)
            } : undefined;

            // Prepare update data
            const updateData: any = {
                loaNumber: dto.loaNumber,
                loaValue: dto.loaValue,
                workDescription: dto.workDescription,
                documentUrl,
                tags,
                deliveryPeriod,
                hasEmd: dto.hasEmd,
                emdAmount: dto.emdAmount,
                hasSecurityDeposit: dto.hasSecurityDeposit,
                securityDepositAmount: dto.securityDepositAmount,
                securityDepositDocumentUrl,
                hasPerformanceGuarantee: dto.hasPerformanceGuarantee,
                performanceGuaranteeAmount: dto.performanceGuaranteeAmount,
                performanceGuaranteeDocumentUrl
            };

            // Update the LOA
            const updatedLoa = await this.repository.update(id, updateData);

            // Handle invoice update/creation
            const hasBillingData = dto.invoiceNumber ||
                                   dto.invoiceAmount ||
                                   dto.totalReceivables ||
                                   dto.actualAmountReceived ||
                                   dto.amountDeducted ||
                                   dto.amountPending ||
                                   dto.deductionReason ||
                                   dto.billLinks ||
                                   dto.remarks;

            if (hasBillingData) {
                // Check if invoice already exists for this LOA
                const existingInvoice = await this.repository.findInvoiceByLoaId(id);

                if (existingInvoice) {
                    // Update existing invoice
                    await this.repository.updateInvoice(existingInvoice.id, {
                        invoiceNumber: dto.invoiceNumber,
                        invoiceAmount: dto.invoiceAmount,
                        totalReceivables: dto.totalReceivables,
                        actualAmountReceived: dto.actualAmountReceived,
                        amountDeducted: dto.amountDeducted,
                        amountPending: dto.amountPending,
                        deductionReason: dto.deductionReason,
                        billLinks: dto.billLinks,
                        invoicePdfUrl: invoicePdfUrl || existingInvoice.invoicePdfUrl,
                        remarks: dto.remarks,
                    });
                } else {
                    // Create new invoice
                    await this.repository.createInvoice({
                        loaId: id,
                        invoiceNumber: dto.invoiceNumber,
                        invoiceAmount: dto.invoiceAmount,
                        totalReceivables: dto.totalReceivables,
                        actualAmountReceived: dto.actualAmountReceived,
                        amountDeducted: dto.amountDeducted,
                        amountPending: dto.amountPending,
                        deductionReason: dto.deductionReason,
                        billLinks: dto.billLinks,
                        invoicePdfUrl,
                        remarks: dto.remarks,
                    });
                }
            }

            return ResultUtils.ok(updatedLoa);
        } catch (error) {
            console.error('LOA Update Error:', error);
            return ResultUtils.fail('Failed to update LOA record');
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
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<Result<{ loas: any[]; total: number; page: number; limit: number; totalPages: number }>> {
        try {
            // Default pagination values
            const page = params.page || 1;
            const limit = params.limit || 10;
            const skip = (page - 1) * limit;

            const [loas, total] = await Promise.all([
                this.repository.findAll({
                    searchTerm: params.searchTerm,
                    skip,
                    take: limit,
                    sortBy: params.sortBy,
                    sortOrder: params.sortOrder
                }),
                this.repository.count({
                    searchTerm: params.searchTerm
                })
            ]);

            const totalPages = Math.ceil(total / limit);

            return ResultUtils.ok({
                loas,
                total,
                page,
                limit,
                totalPages
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

    async updateStatus(id: string, dto: UpdateStatusDto): Promise<Result<any>> {
        try {
            console.log(`Starting status update for LOA ${id} to status ${dto.status}`);
            
            // Step 1: Validate the input data
            const validationResult = this.validator.validateStatusUpdate(dto);
            if (!validationResult.isSuccess) {
                console.log('Validation processing failed');
                return ResultUtils.fail('Validation processing failed');
            }
            
            if (validationResult.data && validationResult.data.length > 0) {
                console.log('Validation errors:', validationResult.data);
                return ResultUtils.fail('Validation failed', validationResult.data);
            }

            // Step 2: Validate the LOA ID
            const idValidation = this.validator.validateId(id);
            if (!idValidation.isSuccess || (idValidation.data && idValidation.data.length > 0)) {
                console.log('Invalid LOA ID format');
                return ResultUtils.fail('Invalid LOA ID format');
            }

            // Step 3: Check if LOA exists
            const existingLoa = await this.repository.findById(id);
            if (!existingLoa) {
                console.log('LOA not found');
                return ResultUtils.fail('LOA not found');
            }
            
            console.log(`Found LOA: ${existingLoa.loaNumber} with current status: ${existingLoa.status || 'undefined'}`);

            // Step 4: Update the status
            console.log(`Updating LOA status to: ${dto.status}`);
            const updatedLoa = await this.repository.update(id, {
                status: dto.status
            });
            
            console.log(`Status updated successfully. New status: ${updatedLoa.status || 'undefined'}`);

            return ResultUtils.ok(updatedLoa);
        } catch (error) {
            console.error('LOA Status Update Error:', error);
            return ResultUtils.fail('Failed to update LOA status');
        }
    }
}