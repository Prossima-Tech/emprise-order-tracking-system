// infrastructure/persistence/repositories/PrismaEmdRepository.ts
import { PrismaClient, EMD, EMDStatus } from '@prisma/client';
import { CreateEmdDto } from '../../../application/dtos/emd/CreateEmdDto';
import { UpdateEmdDto } from '../../../application/dtos/emd/UpdateEmdDto';

export class PrismaEmdRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new EMD record
   */
  async create(data: {
    amount: number;
    paymentMode: string;
    submissionDate: Date;
    maturityDate: Date;
    bankName: string;
    documentUrl?: string;
    extractedData?: any;
    status?: EMDStatus;
    offerId?: string;
    loaId?: string;
    tenderId?: string;
    tags?: string[];
  }): Promise<EMD> {
    return this.prisma.eMD.create({
      data: {
        amount: data.amount,
        paymentMode: data.paymentMode || 'FDR',
        submissionDate: data.submissionDate,
        maturityDate: data.maturityDate,
        bankName: data.bankName || 'IDBI',
        documentUrl: data.documentUrl,
        extractedData: data.extractedData,
        status: data.status || EMDStatus.ACTIVE,
        offerId: data.offerId,
        loaId: data.loaId,
        tenderId: data.tenderId,
        tags: data.tags || [],
      },
      include: {
        offer: {
          select: {
            id: true,
            offerId: true,
            subject: true,
          },
        },
        loa: {
          select: {
            id: true,
            loaNumber: true,
            loaValue: true,
          },
        },
        tender: {
          select: {
            id: true,
            tenderNumber: true,
            description: true,
          },
        },
      },
    });
  }

  /**
   * Find EMD by ID
   */
  async findById(id: string): Promise<EMD | null> {
    return this.prisma.eMD.findUnique({
      where: { id },
      include: {
        offer: {
          select: {
            id: true,
            offerId: true,
            subject: true,
          },
        },
        loa: {
          select: {
            id: true,
            loaNumber: true,
            loaValue: true,
          },
        },
        tender: {
          select: {
            id: true,
            tenderNumber: true,
            description: true,
          },
        },
      },
    });
  }

  /**
   * Find all EMDs with optional filtering and pagination
   */
  async findAll(params?: {
    searchTerm?: string;
    status?: EMDStatus;
    offerId?: string;
    loaId?: string;
    tenderId?: string;
    skip?: number;
    take?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<EMD[]> {
    const where: any = {};

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.offerId) {
      where.offerId = params.offerId;
    }

    if (params?.loaId) {
      where.loaId = params.loaId;
    }

    if (params?.tenderId) {
      where.tenderId = params.tenderId;
    }

    if (params?.searchTerm) {
      where.OR = [
        { bankName: { contains: params.searchTerm, mode: 'insensitive' } },
        { paymentMode: { contains: params.searchTerm, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (params?.sortBy) {
      orderBy[params.sortBy] = params.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    return this.prisma.eMD.findMany({
      where,
      skip: params?.skip,
      take: params?.take,
      orderBy,
      include: {
        offer: {
          select: {
            id: true,
            offerId: true,
            subject: true,
          },
        },
        loa: {
          select: {
            id: true,
            loaNumber: true,
            loaValue: true,
          },
        },
        tender: {
          select: {
            id: true,
            tenderNumber: true,
            description: true,
          },
        },
      },
    });
  }

  /**
   * Count EMDs with optional filtering
   */
  async count(params?: {
    searchTerm?: string;
    status?: EMDStatus;
    offerId?: string;
    loaId?: string;
    tenderId?: string;
  }): Promise<number> {
    const where: any = {};

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.offerId) {
      where.offerId = params.offerId;
    }

    if (params?.loaId) {
      where.loaId = params.loaId;
    }

    if (params?.tenderId) {
      where.tenderId = params.tenderId;
    }

    if (params?.searchTerm) {
      where.OR = [
        { bankName: { contains: params.searchTerm, mode: 'insensitive' } },
        { paymentMode: { contains: params.searchTerm, mode: 'insensitive' } },
      ];
    }

    return this.prisma.eMD.count({ where });
  }

  /**
   * Update an EMD
   */
  async update(id: string, data: Partial<{
    amount: number;
    paymentMode: string;
    submissionDate: Date;
    maturityDate: Date;
    bankName: string;
    documentUrl: string;
    extractedData: any;
    status: EMDStatus;
    offerId: string | null;
    loaId: string | null;
    tenderId: string | null;
    tags: string[];
  }>): Promise<EMD> {
    return this.prisma.eMD.update({
      where: { id },
      data,
      include: {
        offer: {
          select: {
            id: true,
            offerId: true,
            subject: true,
          },
        },
        loa: {
          select: {
            id: true,
            loaNumber: true,
            loaValue: true,
          },
        },
        tender: {
          select: {
            id: true,
            tenderNumber: true,
            description: true,
          },
        },
      },
    });
  }

  /**
   * Delete an EMD
   */
  async delete(id: string): Promise<void> {
    await this.prisma.eMD.delete({
      where: { id },
    });
  }

  /**
   * Update EMD status
   */
  async updateStatus(id: string, status: EMDStatus): Promise<EMD> {
    return this.prisma.eMD.update({
      where: { id },
      data: { status },
      include: {
        offer: {
          select: {
            id: true,
            offerId: true,
            subject: true,
          },
        },
        loa: {
          select: {
            id: true,
            loaNumber: true,
            loaValue: true,
          },
        },
        tender: {
          select: {
            id: true,
            tenderNumber: true,
            description: true,
          },
        },
      },
    });
  }

  /**
   * Find EMDs by Offer ID
   */
  async findByOfferId(offerId: string): Promise<EMD[]> {
    return this.prisma.eMD.findMany({
      where: { offerId },
      include: {
        offer: {
          select: {
            id: true,
            offerId: true,
            subject: true,
          },
        },
      },
    });
  }

  /**
   * Find EMDs by LOA ID
   */
  async findByLoaId(loaId: string): Promise<EMD[]> {
    return this.prisma.eMD.findMany({
      where: { loaId },
      include: {
        loa: {
          select: {
            id: true,
            loaNumber: true,
            loaValue: true,
          },
        },
      },
    });
  }

  /**
   * Find EMDs by Tender ID
   */
  async findByTenderId(tenderId: string): Promise<EMD[]> {
    return this.prisma.eMD.findMany({
      where: { tenderId },
      include: {
        tender: {
          select: {
            id: true,
            tenderNumber: true,
            description: true,
          },
        },
      },
    });
  }

  /**
   * Find expiring EMDs (within specified days)
   */
  async findExpiring(days: number = 30): Promise<EMD[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return this.prisma.eMD.findMany({
      where: {
        status: EMDStatus.ACTIVE,
        maturityDate: {
          gte: today,
          lte: futureDate,
        },
      },
      orderBy: {
        maturityDate: 'asc',
      },
      include: {
        offer: {
          select: {
            id: true,
            offerId: true,
            subject: true,
          },
        },
        loa: {
          select: {
            id: true,
            loaNumber: true,
            loaValue: true,
          },
        },
        tender: {
          select: {
            id: true,
            tenderNumber: true,
            description: true,
          },
        },
      },
    });
  }

  /**
   * Find expired EMDs
   */
  async findExpired(): Promise<EMD[]> {
    const today = new Date();

    return this.prisma.eMD.findMany({
      where: {
        status: EMDStatus.ACTIVE,
        maturityDate: {
          lt: today,
        },
      },
      orderBy: {
        maturityDate: 'desc',
      },
      include: {
        offer: {
          select: {
            id: true,
            offerId: true,
            subject: true,
          },
        },
        loa: {
          select: {
            id: true,
            loaNumber: true,
            loaValue: true,
          },
        },
        tender: {
          select: {
            id: true,
            tenderNumber: true,
            description: true,
          },
        },
      },
    });
  }

  /**
   * Auto-update expired EMDs
   */
  async updateExpiredStatuses(): Promise<number> {
    const today = new Date();

    const result = await this.prisma.eMD.updateMany({
      where: {
        status: EMDStatus.ACTIVE,
        maturityDate: {
          lt: today,
        },
      },
      data: {
        status: EMDStatus.EXPIRED,
      },
    });

    return result.count;
  }
}
