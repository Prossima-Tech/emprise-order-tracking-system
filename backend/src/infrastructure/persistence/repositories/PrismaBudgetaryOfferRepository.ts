// infrastructure/persistence/repositories/PrismaBudgetaryOfferRepository.ts
import { PrismaClient } from '@prisma/client';
import { BudgetaryOffer } from '../../../domain/entities/BudgetaryOffer';
import { EmailLog, EmailStatus } from '../../../domain/entities/EmailLog';

export class PrismaBudgetaryOfferRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: BudgetaryOffer) {
    return this.prisma.budgetaryOffer.create({
      data: {
        offerId: data.offerId,
        offerDate: data.offerDate,
        toAuthority: data.toAuthority,
        subject: data.subject,
        workItems: JSON.parse(JSON.stringify(data.workItems)),
        termsConditions: data.termsConditions,
        railwayZone: data.railwayZone,
        status: data.status,
        tags: data.tags || [],
        documentUrl: data.documentUrl,
        documentHash: data.documentHash,
        approvalHistory: data.approvalHistory ? JSON.parse(JSON.stringify(data.approvalHistory)) : [],
        createdBy: { connect: { id: data.createdById } },
        approver: data.approverId ? { connect: { id: data.approverId } } : undefined
      },
      include: {
        createdBy: true,
        approver: true,
        emailLogs: true
      }
    });
  }

  async update(id: string, data: Partial<BudgetaryOffer>) {
    const prismaData: any = {
      ...data,
      workItems: data.workItems ? JSON.parse(JSON.stringify(data.workItems)) : undefined,
      approver: data.approverId ? { connect: { id: data.approverId } } : undefined,
      approvalHistory: data.approvalHistory ? JSON.parse(JSON.stringify(data.approvalHistory)) : undefined
    };

    // Remove fields that shouldn't be directly updated
    delete prismaData.approverId;
    delete prismaData.id;
    delete prismaData.emailLogs;
    delete prismaData.createdById;

    return this.prisma.budgetaryOffer.update({
      where: { id },
      data: prismaData,
      include: {
        createdBy: true,
        approver: true,
        emailLogs: true
      }
    });
  }

  async findById(id: string) {
    const offer = await this.prisma.budgetaryOffer.findUnique({
      where: { id },
      include: {
        createdBy: true,
        approver: true,
        emailLogs: true
      }
    });

    if (!offer) return null;

    return {
      ...offer,
      approvalHistory: offer.approvalHistory || [],
      emailLogs: offer.emailLogs.map(log => ({
        id: log.id,
        budgetaryOfferId: log.budgetaryOfferId,
        to: log.to,
        cc: log.cc,
        bcc: log.bcc,
        subject: log.subject,
        content: log.content,
        messageId: log.messageId,
        status: log.status as EmailStatus,
        error: log.error,
        sentAt: log.sentAt
      }))
    };
  }

  async findByOfferId(offerId: string) {
    return this.prisma.budgetaryOffer.findUnique({
      where: { offerId },
      include: {
        createdBy: true,
        approver: true,
        emailLogs: true
      }
    });
  }

  async delete(id: string) {
    return this.prisma.budgetaryOffer.delete({
      where: { id }
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    status?: string;
    createdById?: string;
    approverId?: string;
  }) {
    const { skip = 0, take = 10, status, createdById, approverId } = params;
    
    return this.prisma.budgetaryOffer.findMany({
      skip,
      take,
      where: {
        status: status as any,
        createdById,
        approverId
      },
      include: {
        createdBy: true,
        approver: true,
        emailLogs: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async count(params: {
    status?: string;
    createdById?: string;
    approverId?: string;
  }) {
    const { status, createdById, approverId } = params;
    
    return this.prisma.budgetaryOffer.count({
      where: {
        status: status as any,
        createdById,
        approverId
      }
    });
  }

  async logEmail(data: EmailLog) {
    return this.prisma.emailLog.create({
      data: {
        budgetaryOfferId: data.budgetaryOfferId,
        to: data.to,
        cc: data.cc || [],
        bcc: data.bcc || [],
        subject: data.subject,
        content: data.content,
        messageId: data.messageId,
        status: data.status,
        error: data.error
      }
    });
  }

  async getEmailLogs(budgetaryOfferId: string, params: {
    skip?: number;
    take?: number;
    startDate?: Date;
    endDate?: Date;
    status?: EmailStatus;
  }): Promise<EmailLog[]> {
    const { skip = 0, take = 10, startDate, endDate, status } = params;

    const logs = await this.prisma.emailLog.findMany({
      where: {
        budgetaryOfferId,
        ...(startDate && { sentAt: { gte: startDate } }),
        ...(endDate && { sentAt: { lte: endDate } }),
        ...(status && { status })
      },
      skip,
      take,
      orderBy: {
        sentAt: 'desc'
      }
    });

    return logs.map(log => ({
      id: log.id,
      budgetaryOfferId: log.budgetaryOfferId,
      to: log.to,
      cc: log.cc,
      bcc: log.bcc,
      subject: log.subject,
      content: log.content,
      messageId: log.messageId ?? undefined,
      status: log.status as EmailStatus,
      error: log.error ?? undefined,
      sentAt: log.sentAt
    }));
  }

  async countEmailLogs(budgetaryOfferId: string, params: {
    startDate?: Date;
    endDate?: Date;
    status?: EmailStatus;
  }): Promise<number> {
    const { startDate, endDate, status } = params;

    return this.prisma.emailLog.count({
      where: {
        budgetaryOfferId,
        ...(startDate && { sentAt: { gte: startDate } }),
        ...(endDate && { sentAt: { lte: endDate } }),
        ...(status && { status })
      }
    });
  }

  async findPendingApprovals(approverId: string, params: {
    skip?: number;
    take?: number;
  }) {
    const { skip = 0, take = 10 } = params;

    return this.prisma.budgetaryOffer.findMany({
      where: {
        status: 'PENDING_APPROVAL',
        approverId
      },
      include: {
        createdBy: true,
        approver: true,
        emailLogs: true
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async countPendingApprovals(approverId: string): Promise<number> {
    return this.prisma.budgetaryOffer.count({
      where: {
        status: 'PENDING_APPROVAL',
        approverId
      }
    });
  }

  async getApprovalHistory(id: string) {
    const offer = await this.prisma.budgetaryOffer.findUnique({
      where: { id },
      select: {
        approvalHistory: true
      }
    });

    return offer?.approvalHistory || [];
  }
}