// application/services/EmdService.ts
import { promises as fs } from 'fs';
import path from 'path';
import { EMDStatus } from '@prisma/client';
import { PrismaEmdRepository } from '../../infrastructure/persistence/repositories/PrismaEmdRepository';
import { S3Service } from '../../infrastructure/services/S3Service';
import { OCRService } from '../../infrastructure/services/OCRService';
import { CreateEmdDto } from '../dtos/emd/CreateEmdDto';
import { UpdateEmdDto } from '../dtos/emd/UpdateEmdDto';
import { Result, ResultUtils } from '../../shared/types/common.types';
import { EmdCalculations } from '../../domain/entities/utils/EmdCalculations';

export class EmdService {
  constructor(
    private repository: PrismaEmdRepository,
    private storageService: S3Service,
    private ocrService: OCRService,
    private openRouterApiKey?: string
  ) {}

  /**
   * Process document file - upload to S3
   */
  private async processDocument(file: Express.Multer.File): Promise<string> {
    try {
      const fileExtension = path.extname(file.originalname);
      const fileName = `emds/${crypto.randomUUID()}${fileExtension}`;

      const fileBuffer = await fs.readFile(file.path);
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

  /**
   * Extract data from document using AI (OpenRouter + Mistral)
   */
  async extractDataFromDocument(data: {
    extractedText: string;
  }): Promise<Result<any>> {
    try {
      if (!this.openRouterApiKey) {
        return ResultUtils.fail('OpenRouter API key not configured');
      }

      // Prepare prompt for AI
      const prompt = `Extract these fields as JSON ONLY from the text:
      {
        "amount": number,
        "maturityDate": "DD-MM-YYYY",
        "submissionDate": "DD-MM-YYYY"
      }
      Return ONLY valid JSON without any formatting or explanations and if you encounter two amounts then provide the amount which has higher value. Text: ${data.extractedText}`;

      // Call OpenRouter API with Mistral
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.BACKEND_URL || 'http://localhost:3000',
          'X-Title': 'Emprise EMD Extractor'
        },
        body: JSON.stringify({
          model: "mistralai/mistral-small-24b-instruct-2501",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', errorText);
        return ResultUtils.fail(`AI extraction failed: ${errorText}`);
      }

      const responseData = await response.json();
      const llmResponse = responseData.choices[0].message.content;

      // Parse and validate response
      let parsedData: any;
      try {
        const sanitizedResponse = llmResponse
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        parsedData = JSON.parse(sanitizedResponse);
      } catch (e) {
        console.error('Failed to parse AI response:', llmResponse);
        return ResultUtils.fail('Failed to parse AI response');
      }

      return ResultUtils.ok({
        amount: parsedData.amount,
        maturityDate: parsedData.maturityDate,
        submissionDate: parsedData.submissionDate,
        bankName: 'IDBI' // Default bank name
      });
    } catch (error) {
      console.error('AI extraction error:', error);
      return ResultUtils.fail('AI extraction failed');
    }
  }

  /**
   * Extract data from file (PDF or image) - Complete OCR + AI pipeline
   */
  async extractDataFromFile(file: Express.Multer.File): Promise<Result<any>> {
    try {
      // Step 1: Extract text using OCR (handles both PDF and images)
      const extractedText = await this.ocrService.extractTextFromFile(file.path);
      console.log('Extracted text from file:', extractedText);

      // Step 2: Use AI to extract structured data
      const aiResult = await this.extractDataFromDocument({ extractedText });

      // Clean up temp file
      try {
        await fs.unlink(file.path);
      } catch (unlinkError) {
        console.warn('Failed to delete temp file:', unlinkError);
      }

      return aiResult;
    } catch (error) {
      console.error('File extraction error:', error);
      return ResultUtils.fail(
        error instanceof Error
          ? error.message
          : 'Failed to extract data from file'
      );
    }
  }

  /**
   * Create a new EMD
   */
  async createEmd(dto: CreateEmdDto): Promise<Result<any>> {
    try {
      // Process and upload document if provided
      let documentUrl: string | undefined;
      if (dto.documentFile) {
        documentUrl = await this.processDocument(dto.documentFile);
      }

      // Process tags
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
            console.warn('Failed to parse tags string:', error);
          }
        }
      }

      // Create EMD record
      const emd = await this.repository.create({
        amount: dto.amount,
        paymentMode: dto.paymentMode || 'FDR',
        submissionDate: new Date(dto.submissionDate),
        maturityDate: new Date(dto.maturityDate),
        bankName: dto.bankName || 'IDBI',
        documentUrl,
        extractedData: dto.extractedData,
        status: EMDStatus.ACTIVE,
        offerId: dto.offerId,
        loaId: dto.loaId,
        tenderId: dto.tenderId,
        tags,
      });

      // Calculate and add computed fields
      const emdWithComputed = this.addComputedFields(emd);

      return ResultUtils.ok(emdWithComputed);
    } catch (error) {
      console.error('EMD Creation Error:', error);
      return ResultUtils.fail('Failed to create EMD record');
    }
  }

  /**
   * Get EMD by ID
   */
  async getEmdById(id: string): Promise<Result<any>> {
    try {
      const emd = await this.repository.findById(id);
      if (!emd) {
        return ResultUtils.fail('EMD not found');
      }

      const emdWithComputed = this.addComputedFields(emd);
      return ResultUtils.ok(emdWithComputed);
    } catch (error) {
      console.error('EMD Fetch Error:', error);
      return ResultUtils.fail('Failed to fetch EMD record');
    }
  }

  /**
   * Get all EMDs with pagination and filtering
   */
  async getAllEmds(params: {
    searchTerm?: string;
    status?: EMDStatus;
    offerId?: string;
    loaId?: string;
    tenderId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<Result<{ data: any[]; total: number; page: number; limit: number; totalPages: number }>> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 10;
      const skip = (page - 1) * limit;

      const [emds, total] = await Promise.all([
        this.repository.findAll({
          ...params,
          skip,
          take: limit,
        }),
        this.repository.count({
          searchTerm: params.searchTerm,
          status: params.status,
          offerId: params.offerId,
          loaId: params.loaId,
          tenderId: params.tenderId,
        }),
      ]);

      const emdsWithComputed = emds.map(emd => this.addComputedFields(emd));
      const totalPages = Math.ceil(total / limit);

      return ResultUtils.ok({
        data: emdsWithComputed,
        total,
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      console.error('EMDs Fetch Error:', error);
      return ResultUtils.fail('Failed to fetch EMD records');
    }
  }

  /**
   * Update an EMD
   */
  async updateEmd(id: string, dto: UpdateEmdDto): Promise<Result<any>> {
    try {
      const existingEmd = await this.repository.findById(id);
      if (!existingEmd) {
        return ResultUtils.fail('EMD not found');
      }

      // Process document if provided
      let documentUrl = existingEmd.documentUrl;
      if (dto.documentFile) {
        documentUrl = await this.processDocument(dto.documentFile);
      }

      // Process tags
      let tags = existingEmd.tags;
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

      // Prepare update data
      const updateData: any = {};
      if (dto.amount !== undefined) updateData.amount = dto.amount;
      if (dto.paymentMode) updateData.paymentMode = dto.paymentMode;
      if (dto.submissionDate) updateData.submissionDate = new Date(dto.submissionDate);
      if (dto.maturityDate) updateData.maturityDate = new Date(dto.maturityDate);
      if (dto.bankName) updateData.bankName = dto.bankName;
      if (documentUrl) updateData.documentUrl = documentUrl;
      if (dto.extractedData) updateData.extractedData = dto.extractedData;
      if (dto.status) updateData.status = dto.status;
      if (dto.offerId !== undefined) updateData.offerId = dto.offerId;
      if (dto.loaId !== undefined) updateData.loaId = dto.loaId;
      if (dto.tenderId !== undefined) updateData.tenderId = dto.tenderId;
      if (tags) updateData.tags = tags;

      const updatedEmd = await this.repository.update(id, updateData);
      const emdWithComputed = this.addComputedFields(updatedEmd);

      return ResultUtils.ok(emdWithComputed);
    } catch (error) {
      console.error('EMD Update Error:', error);
      return ResultUtils.fail('Failed to update EMD record');
    }
  }

  /**
   * Delete an EMD
   */
  async deleteEmd(id: string): Promise<Result<void>> {
    try {
      const emd = await this.repository.findById(id);
      if (!emd) {
        return ResultUtils.fail('EMD not found');
      }

      await this.repository.delete(id);
      return ResultUtils.ok(undefined);
    } catch (error) {
      console.error('EMD Deletion Error:', error);
      return ResultUtils.fail('Failed to delete EMD record');
    }
  }

  /**
   * Update EMD status
   */
  async updateStatus(id: string, status: EMDStatus): Promise<Result<any>> {
    try {
      const existingEmd = await this.repository.findById(id);
      if (!existingEmd) {
        return ResultUtils.fail('EMD not found');
      }

      const updatedEmd = await this.repository.updateStatus(id, status);
      const emdWithComputed = this.addComputedFields(updatedEmd);

      return ResultUtils.ok(emdWithComputed);
    } catch (error) {
      console.error('EMD Status Update Error:', error);
      return ResultUtils.fail('Failed to update EMD status');
    }
  }

  /**
   * Get expiring EMDs
   */
  async getExpiringEmds(days: number = 30): Promise<Result<any[]>> {
    try {
      const emds = await this.repository.findExpiring(days);
      const emdsWithComputed = emds.map(emd => this.addComputedFields(emd));
      return ResultUtils.ok(emdsWithComputed);
    } catch (error) {
      console.error('Expiring EMDs Fetch Error:', error);
      return ResultUtils.fail('Failed to fetch expiring EMDs');
    }
  }

  /**
   * Auto-update expired EMDs
   */
  async autoUpdateExpiredStatuses(): Promise<Result<number>> {
    try {
      const count = await this.repository.updateExpiredStatuses();
      return ResultUtils.ok(count);
    } catch (error) {
      console.error('Auto-update Expired EMDs Error:', error);
      return ResultUtils.fail('Failed to auto-update expired EMDs');
    }
  }

  /**
   * Add computed fields to EMD
   */
  private addComputedFields(emd: any): any {
    const maturityDate = new Date(emd.maturityDate);
    const daysUntilExpiry = EmdCalculations.getDaysUntilExpiry(maturityDate);
    const isExpired = EmdCalculations.isExpired(maturityDate);

    return {
      ...emd,
      daysUntilExpiry,
      isExpired,
    };
  }
}
