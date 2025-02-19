import { PrismaBudgetaryOfferRepository } from '../../infrastructure/persistence/repositories/PrismaBudgetaryOfferRepository';
import { CreateBudgetaryOfferDto } from '../dtos/budgetaryOffer/CreateBudgetaryOfferDto';
import { UpdateBudgetaryOfferDto } from '../dtos/budgetaryOffer/UpdateBudgetaryOfferDto';
import { Result, ResultUtils } from '../../shared/types/common.types';
import { BudgetaryOffer, ApprovalAction, WorkItem } from '../../domain/entities/BudgetaryOffer';
import { BudgetaryOfferValidator } from '../validators/budgetaryOffer.validator';
import { BudgetaryOfferData, PDFService } from '../../infrastructure/services/PDFService';
import { DocumentVerifierService } from '../../infrastructure/services/DocumentVerificationService';
import { EmailService } from '../../infrastructure/services/EmailService';
import { EmailLog, EmailStatus } from '../../domain/entities/EmailLog';
import { TokenService } from '../../infrastructure/services/TokenService';
import { UserRole } from '../../domain/entities/User';

interface DocumentData {
  id: string;
  offerId: string;
  offerDate: Date;
  toAuthority: string;
  subject: string;
  workItems: WorkItem[];
  termsConditions: string;
  status: string;
  createdBy: {
    name: string;
    department: string;
    role: UserRole;
  };
  tags: string[];
}

export class BudgetaryOfferService {
  constructor(
    private repository: PrismaBudgetaryOfferRepository,
    private validator: BudgetaryOfferValidator,
    private pdfService: PDFService,
    private documentVerifier: DocumentVerifierService,
    private emailService: EmailService,
    private tokenService: TokenService
  ) { }

  private convertToBudgetaryOffer(data: any): BudgetaryOffer {
    return {
      id: data.id,
      offerId: data.offerId,
      offerDate: new Date(data.offerDate),
      toAuthority: data.toAuthority,
      subject: data.subject,
      workItems: Array.isArray(data.workItems)
        ? data.workItems.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unitOfMeasurement: item.unitOfMeasurement,
          baseRate: item.baseRate,
          taxRate: item.taxRate
        }))
        : [],
      termsConditions: data.termsConditions,
      status: data.status,
      railwayZone: data.railwayZone,
      createdById: data.createdById,
      approverId: data.approverId,
      tags: data.tags,
      documentUrl: data.documentUrl,
      documentHash: data.documentHash,
      approvalComments: data.approvalComments,
      approvalHistory: Array.isArray(data.approvalHistory) ? data.approvalHistory : [],
      emailLogs: data.emailLogs

    };
  }

  async sendOfferByEmail(params: {
    offerId: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    content: string;
  }): Promise<Result<{ success: boolean; messageId?: string }>> {
    try {
      const offer = await this.repository.findById(params.offerId);
      if (!offer) {
        return ResultUtils.fail('Budgetary offer not found');
      }

      if (!offer.createdBy) {
        return ResultUtils.fail('Creator details not found');
      }

      // Prepare document data
      const documentData = {
        id: offer.id,
        offerId: offer.offerId,
        offerDate: offer.offerDate,
        toAuthority: offer.toAuthority,
        subject: offer.subject,
        workItems: typeof offer.workItems === 'string'
          ? JSON.parse(offer.workItems)
          : offer.workItems,
        termsConditions: offer.termsConditions,
        status: offer.status,
        railwayZone: offer.railwayZone || '',
        createdBy: {
          name: offer.createdBy.name,
          department: offer.createdBy.department || 'N/A',
          role: offer.createdBy.role
        },
        tags: offer.tags || []
      };

      // Send email with fresh PDF
      const emailResult = await this.emailService.sendBudgetaryOfferEmail({
        to: params.to,
        cc: params.cc,
        bcc: params.bcc,
        subject: params.subject,
        html: params.content,
        offerData: documentData as BudgetaryOfferData
      });

      if (!emailResult.success) {
        return ResultUtils.fail(emailResult.error || 'Failed to send email');
      }

      // Log email attempt
      await this.repository.logEmail({
        budgetaryOfferId: params.offerId,
        to: params.to,
        cc: params.cc || [],
        bcc: params.bcc || [],
        subject: params.subject,
        content: params.content,
        messageId: emailResult.messageId,
        status: EmailStatus.SENT
      });

      return ResultUtils.ok({
        success: true,
        messageId: emailResult.messageId
      });
    } catch (error) {
      console.error('Email sending error:', error);
      return ResultUtils.fail('Failed to process email: ' +
        (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getEmailLogs(
    offerId: string,
    params?: {
      page?: number;
      limit?: number;
      startDate?: Date;
      endDate?: Date;
      status?: EmailStatus;
    }
  ): Promise<Result<{
    logs: EmailLog[];
    total: number;
    pages: number;
  }>> {
    try {
      // First check if offer exists
      const offer = await this.repository.findById(offerId);
      if (!offer) {
        return ResultUtils.fail('Budgetary offer not found');
      }

      // Get logs with pagination
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const skip = (page - 1) * limit;

      const logs = await this.repository.getEmailLogs(offerId, {
        skip,
        take: limit,
        startDate: params?.startDate,
        endDate: params?.endDate,
        status: params?.status
      });

      const total = await this.repository.countEmailLogs(offerId, {
        startDate: params?.startDate,
        endDate: params?.endDate,
        status: params?.status
      });

      return ResultUtils.ok({
        logs,
        total,
        pages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error('Error fetching email logs:', error);
      return ResultUtils.fail('Failed to fetch email logs: ' +
        (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async approveOffer(id: string, userId: string, comments?: string): Promise<Result<BudgetaryOffer>> {
    try {
      const offerResult = await this.repository.findById(id);
      if (!offerResult) {
        return ResultUtils.fail('Budgetary offer not found');
      }

      if (offerResult.status !== 'PENDING_APPROVAL') {
        return ResultUtils.fail('Only PENDING_APPROVAL offers can be approved');
      }

      if (offerResult.approverId && offerResult.approverId !== userId) {
        return ResultUtils.fail('Only the assigned approver can approve this offer');
      }

      const approvalAction = {
        actionType: 'APPROVE',
        userId,
        timestamp: new Date().toISOString(),
        comments,
        previousStatus: offerResult.status,
        newStatus: 'APPROVED'
      };

      const now = new Date();
      const currentHistory = (offerResult.approvalHistory || []) as any[];

      const updatedOffer = await this.repository.update(id, {
        status: 'APPROVED',
        approverId: userId,
        approvalComments: comments,
        approvalDate: now,
        approvalHistory: [...currentHistory, approvalAction] as any
      });

      // Generate PDF after approval
      const pdfResult = await this.generatePDF(id);
      if (!pdfResult.isSuccess || !pdfResult.data) {
        return ResultUtils.fail('Failed to generate approved document');
      }

      // Update offer with the generated PDF URL and hash
      await this.repository.update(id, {
        documentUrl: pdfResult.data.url,
        documentHash: pdfResult.data.hash
      });

      return ResultUtils.ok(this.convertToBudgetaryOffer(updatedOffer));
    } catch (error) {
      return ResultUtils.fail('Failed to approve offer: ' +
        (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async rejectOffer(id: string, userId: string, comments?: string): Promise<Result<BudgetaryOffer>> {
    try {
      const offerResult = await this.repository.findById(id);
      if (!offerResult) {
        return ResultUtils.fail('Budgetary offer not found');
      }

      if (offerResult.status !== 'PENDING_APPROVAL') {
        return ResultUtils.fail('Only PENDING_APPROVAL offers can be rejected');
      }

      // Check if the user is the assigned approver
      if (offerResult.approverId && offerResult.approverId !== userId) {
        return ResultUtils.fail('Only the assigned approver can reject this offer');
      }

      const approvalAction = {
        actionType: 'REJECT',
        userId,
        timestamp: new Date().toISOString(), // Convert Date to string for JSON compatibility
        comments,
        previousStatus: offerResult.status,
        newStatus: 'REJECTED'
      };

      const now = new Date();

      const currentHistory = (offerResult.approvalHistory || []) as any[];

      const updatedOffer = await this.repository.update(id, {
        status: 'REJECTED',
        approverId: userId,
        approvalComments: comments,
        approvalDate: now,
        approvalHistory: [...currentHistory, approvalAction] as any // Cast to any to avoid type conflict
      });

      return ResultUtils.ok(this.convertToBudgetaryOffer(updatedOffer));
    } catch (error) {
      return ResultUtils.fail('Failed to reject offer: ' +
        (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async createOffer(dto: CreateBudgetaryOfferDto, userId: string): Promise<Result<BudgetaryOffer>> {
    const validation = this.validator.validate(dto);

    if (validation.isSuccess && validation.data && validation.data.length > 0) {
      return ResultUtils.fail('Validation failed: ' +
        validation.data.map(err => `${err.field}: ${err.message}`).join(', '));
    }

    // console.log('Creating offer with data:', dto);
    try {
      const offerId = `BO/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

      const offer = await this.repository.create({
        offerId,
        offerDate: new Date(dto.offerDate),
        toAuthority: dto.toAuthority,
        subject: dto.subject,
        workItems: dto.workItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitOfMeasurement: item.unitOfMeasurement,
          baseRate: item.baseRate,
          taxRate: item.taxRate || 0
        })),
        railwayZone: dto.railwayZone,
        termsConditions: dto.termsConditions,
        status: 'DRAFT',
        tags: dto.tags,
        createdById: userId,
        approverId: dto.approverId,
        documentUrl: '',
        documentHash: '',
        approvalHistory: [] // Initialize empty approval history
      });

      return ResultUtils.ok(this.convertToBudgetaryOffer(offer));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return ResultUtils.fail('Failed to create budgetary offer: ' + errorMessage);
    }
  }

  async updateOffer(id: string, dto: UpdateBudgetaryOfferDto, userId: string): Promise<Result<BudgetaryOffer>> {
    try {
      const existingOffer = await this.repository.findById(id);
      if (!existingOffer) {
        return ResultUtils.fail('Budgetary offer not found');
      }

      // Check if user has permission to update
      if (existingOffer.createdById !== userId && existingOffer.approverId !== userId) {
        return ResultUtils.fail('You do not have permission to update this offer');
      }

      const updatedOffer = await this.repository.update(id, {
        ...dto,
        offerDate: dto.offerDate ? new Date(dto.offerDate) : undefined,
        workItems: dto.workItems?.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitOfMeasurement: item.unit,
          baseRate: item.rate,
          taxRate: 0 // Set appropriate default or get from DTO
        }))
      });

      return ResultUtils.ok(this.convertToBudgetaryOffer(updatedOffer));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return ResultUtils.fail('Failed to update budgetary offer: ' + errorMessage);
    }
  }

  async deleteOffer(id: string, userId: string): Promise<Result<void>> {
    try {
      const existingOffer = await this.repository.findById(id);
      if (!existingOffer) {
        return ResultUtils.fail('Budgetary offer not found');
      }

      // Check if user has permission to delete
      if (existingOffer.createdById !== userId) {
        return ResultUtils.fail('You do not have permission to delete this offer');
      }

      await this.repository.delete(id);
      return ResultUtils.ok(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return ResultUtils.fail('Failed to delete budgetary offer: ' + errorMessage);
    }
  }

  async getOffer(id: string): Promise<Result<BudgetaryOffer>> {
    try {
      const offer = await this.repository.findById(id);
      if (!offer) {
        return ResultUtils.fail('Budgetary offer not found');
      }

      return ResultUtils.ok(this.convertToBudgetaryOffer(offer));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return ResultUtils.fail('Failed to fetch budgetary offer: ' + errorMessage);
    }
  }

  async getOffers(params: {
    status?: string;
    createdById?: string;
    approverId?: string;
  }): Promise<Result<{ offers: BudgetaryOffer[]; total: number }>> {
    try {
      const [rawOffers, total] = await Promise.all([
        this.repository.findAll({
          status: params.status,
          createdById: params.createdById,
          approverId: params.approverId
        }),
        this.repository.count({
          status: params.status,
          createdById: params.createdById,
          approverId: params.approverId
        })
      ]);

      return ResultUtils.ok({
        offers: rawOffers.map((offer: any) => this.convertToBudgetaryOffer(offer)),
        total
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return ResultUtils.fail('Failed to fetch budgetary offers: ' + errorMessage);
    }
  }

  async generatePDF(id: string): Promise<Result<{ url: string; hash: string }>> {
    try {
      const offer = await this.repository.findById(id);
      if (!offer) {
        return ResultUtils.fail('Budgetary offer not found');
      }

      if (!offer.createdBy) {
        return ResultUtils.fail('Creator details not found');
      }

      const documentData = {
        id: offer.id,
        offerId: offer.offerId,
        offerDate: offer.offerDate,
        toAuthority: offer.toAuthority,
        subject: offer.subject,
        workItems: typeof offer.workItems === 'string'
          ? JSON.parse(offer.workItems)
          : offer.workItems,
        termsConditions: offer.termsConditions,
        status: offer.status,
        railwayZone: offer.railwayZone || '',
        createdBy: {
          name: offer.createdBy.name,
          department: offer.createdBy.department || 'N/A',
          role: offer.createdBy.role
        },
        tags: offer.tags || []
      };

      const { url, hash } = await this.pdfService.generateAndUploadBudgetaryOffer(documentData);

      // Update offer with document URL and hash, but preserve existing workItems
      const updatedOffer = await this.repository.update(id, {
        documentUrl: url,
        documentHash: hash,
        workItems: typeof offer.workItems === 'string'
          ? JSON.parse(offer.workItems)
          : (Array.isArray(offer.workItems) ? offer.workItems : [])
      });

      if (!updatedOffer) {
        return ResultUtils.fail('Failed to update offer with document details');
      }

      return ResultUtils.ok({ url, hash });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return ResultUtils.fail('Failed to generate PDF: ' + errorMessage);
    }
  }

  async verifyDocument(id: string): Promise<Result<{
    isValid: boolean;
    currentHash?: string;
    error?: string;
  }>> {
    try {
      const offer = await this.repository.findById(id);
      if (!offer) {
        return ResultUtils.fail('Budgetary offer not found');
      }

      if (!offer.documentUrl || !offer.documentHash) {
        return ResultUtils.fail('Document or hash not found');
      }

      const verificationResult = await this.documentVerifier.verifyDocument(
        offer.documentUrl,
        offer.documentHash
      );

      return ResultUtils.ok(verificationResult);
    } catch (error) {
      console.error('Document verification error:', error);
      return ResultUtils.fail('Failed to verify document: ' +
        (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async handleEmailApproval(token: string, comments: string): Promise<Result<BudgetaryOffer>> {
    console.log('Starting handleEmailApproval with token:', token);

    const tokenData = this.tokenService.verifyApprovalToken(token);
    console.log('Verified token data:', tokenData);

    if (!tokenData) {
      console.log('Token verification failed');
      return ResultUtils.fail('Invalid or expired approval link');
    }

    if (tokenData.action !== 'approve') {
      console.log('Invalid action type:', tokenData.action);
      return ResultUtils.fail('Invalid action type');
    }

    console.log('Proceeding to approve offer with:', {
      offerId: tokenData.poId,
      userId: tokenData.userId
    });

    const approvalResult = await this.approveOffer(tokenData.poId, tokenData.userId, comments);
    console.log('Approval result:', approvalResult);

    return approvalResult;
  }

  async handleEmailRejection(token: string, reason: string): Promise<Result<BudgetaryOffer>> {
    console.log('Starting handleEmailRejection with token:', token);

    const tokenData = this.tokenService.verifyApprovalToken(token);
    console.log('Verified token data:', tokenData);

    if (!tokenData) {
      console.log('Token verification failed');
      return ResultUtils.fail('Invalid or expired rejection link');
    }

    if (tokenData.action !== 'reject') {
      console.log('Invalid action type:', tokenData.action);
      return ResultUtils.fail('Invalid action type');
    }

    console.log('Proceeding to reject offer with:', {
      offerId: tokenData.poId,
      userId: tokenData.userId,
      reason
    });

    const rejectionResult = await this.rejectOffer(tokenData.poId, tokenData.userId, reason);
    console.log('Rejection result:', rejectionResult);

    return rejectionResult;
  }

  async submitForApproval(id: string, userId: string): Promise<Result<BudgetaryOffer>> {
    try {
      const offerResult = await this.repository.findById(id);
      if (!offerResult) {
        return ResultUtils.fail('Budgetary offer not found');
      }

      if (offerResult.createdById !== userId) {
        return ResultUtils.fail('Only the creator can submit the offer for approval');
      }

      if (offerResult.status !== 'DRAFT') {
        return ResultUtils.fail('Only DRAFT offers can be submitted for approval');
      }

      // Generate approval tokens
      const approveToken = this.tokenService.generateApprovalToken(
        id,
        offerResult.approverId!,
        'MANAGER',
        offerResult.approver?.email || '',
        'approve'
      );

      const rejectToken = this.tokenService.generateApprovalToken(
        id,
        offerResult.approverId!,
        'MANAGER',
        offerResult.approver?.email || '',
        'reject'
      );

      // Create approval URLs
      const baseUrl = process.env.BASE_URL || 'https://client.prossimatech.com';
      const approveUrl = `${baseUrl}/api/budgetary-offers/email-approve/${approveToken}`;
      const rejectUrl = `${baseUrl}/api/budgetary-offers/email-reject/${rejectToken}`;

      const approvalAction = {
        actionType: 'SUBMIT',
        userId,
        timestamp: new Date().toISOString(),
        previousStatus: 'DRAFT',
        newStatus: 'PENDING_APPROVAL'
      };

      const currentHistory = (offerResult.approvalHistory || []) as any[];

      const updatedOffer = await this.repository.update(id, {
        status: 'PENDING_APPROVAL',
        approvalHistory: [...currentHistory, approvalAction] as any
      });

      // Send email notification to approver
      if (offerResult.approver?.email) {
        try {
          const documentData: BudgetaryOfferData = {
            id: updatedOffer.id,
            offerId: updatedOffer.offerId,
            offerDate: updatedOffer.offerDate,
            toAuthority: updatedOffer.toAuthority,
            subject: updatedOffer.subject,
            workItems: typeof updatedOffer.workItems === 'string'
              ? JSON.parse(updatedOffer.workItems)
              : updatedOffer.workItems,
            termsConditions: updatedOffer.termsConditions,
            status: updatedOffer.status,
            createdBy: {
              name: offerResult.createdBy?.name || 'Unknown',
              department: offerResult.createdBy?.department || 'N/A',
              role: (offerResult.createdBy?.role as UserRole) || UserRole.STAFF
            },
            tags: updatedOffer.tags || [],
            railwayZone: updatedOffer.railwayZone || ''
          };

          await this.emailService.sendBudgetaryOfferApproveEmail({
            to: [offerResult.approver.email],
            subject: `Budgetary Offer ${updatedOffer.offerId} - Approval Required`,
            html: '',
            offerData: documentData,
            type: 'SUBMIT',
            approveUrl,
            rejectUrl
          });
        } catch (emailError) {
          console.error('Failed to send approval notification email:', emailError);
        }
      }

      return ResultUtils.ok(this.convertToBudgetaryOffer(updatedOffer));
    } catch (error) {
      return ResultUtils.fail('Failed to submit offer for approval: ' +
        (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // async findByTags(tags: string[]): Promise<Result<BudgetaryOffer[]>> {
  //   try {
  //     const offers = await this.repository.findByTags(tags);
  //     return ResultUtils.ok(offers.map((offer: any) => this.convertToBudgetaryOffer(offer)));
  //   } catch (error) {
  //     const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  //     return ResultUtils.fail('Failed to fetch offers by tags: ' + errorMessage);
  //   }
  // }


}