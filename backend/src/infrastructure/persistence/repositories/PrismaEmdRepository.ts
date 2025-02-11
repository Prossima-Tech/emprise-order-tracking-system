// infrastructure/persistence/repositories/PrismaEmdRepository.ts
import { PrismaClient, Prisma, EMD as PrismaEMD, EMDStatus as PrismaEMDStatus } from '@prisma/client';
import { EMD, EMDStatus } from '../../../domain/entities/EMD';
import { BudgetaryOffer } from '../../../domain/entities/BudgetaryOffer';

type PrismaEMDWithRelations = Prisma.EMDGetPayload<{
  include: { 
    offer: true,
    loa: {
      include: {
        site: true
      }
    }
    }
}>;

export class PrismaEmdRepository {
  constructor(private prisma: PrismaClient) {}

  private mapToDomainEMD(prismaEMD: PrismaEMDWithRelations | null): EMD | null {
    if (!prismaEMD) return null;

    return {
      id: prismaEMD.id,
      amount: prismaEMD.amount,
      paymentMode: prismaEMD.paymentMode,
      submissionDate: prismaEMD.submissionDate,
      maturityDate: prismaEMD.maturityDate,
      bankName: prismaEMD.bankName,
      documentUrl: prismaEMD.documentUrl,
      extractedData: prismaEMD.extractedData,
      status: prismaEMD.status as EMDStatus,
      offer: prismaEMD.offer as unknown as BudgetaryOffer | undefined,
      offerId: prismaEMD.offerId || undefined,
      loa: prismaEMD.loa ? {
        id: prismaEMD.loa.id,
        loaNumber: prismaEMD.loa.loaNumber,
        loaValue: prismaEMD.loa.loaValue,
      } : undefined,
      tags: prismaEMD.tags,
      createdAt: prismaEMD.createdAt,
      updatedAt: prismaEMD.updatedAt
    };
  }

  async create(data: {
    amount: number;
    paymentMode: string;
    submissionDate: Date;
    maturityDate: Date;
    bankName: string;
    documentUrl: string;
    extractedData?: any;
    status: EMDStatus;
    offerId?: string;
    tags: string[];
  }): Promise<EMD> {
    const prismaEMD = await this.prisma.eMD.create({
      data: {
        amount: data.amount,
        paymentMode: data.paymentMode,
        submissionDate: data.submissionDate,
        maturityDate: data.maturityDate,
        bankName: data.bankName,
        documentUrl: data.documentUrl || "",
        extractedData: data.extractedData || null,
        status: data.status as unknown as PrismaEMDStatus,
        offerId: data.offerId || null,
        tags: data.tags
      },
      include: {
        offer: true,
        loa: {
          include: {
            site: true
          }
        }
      }
    });

    return this.mapToDomainEMD(prismaEMD)!;
  }

  async update(id: string, data: Partial<EMD>): Promise<EMD> {
    const prismaEMD = await this.prisma.eMD.update({
      where: { id },
      data: {
        amount: data.amount,
        paymentMode: data.paymentMode,
        submissionDate: data.submissionDate,
        maturityDate: data.maturityDate,
        bankName: data.bankName,
        documentUrl: data.documentUrl,
        extractedData: data.extractedData,
        status: data.status as unknown as PrismaEMDStatus,
        offerId: data.offerId || null,
        tags: data.tags
      },
      include: {
        offer: true,
        loa: {
          include: {
            site: true
          }
        }
      }
    });

    return this.mapToDomainEMD(prismaEMD)!;
  }

  async delete(id: string): Promise<EMD> {
    const prismaEMD = await this.prisma.eMD.delete({
      where: { id },
      include: {
        offer: true,
        loa: {
          include: {
            site: true
          }
        }
      }
    });

    return this.mapToDomainEMD(prismaEMD)!;
  }

  async findById(id: string): Promise<EMD | null> {
    const prismaEMD = await this.prisma.eMD.findUnique({
      where: { id },
      include: {
        offer: true,
        loa: {
          include: {
            site: true
          }
        }
      }
    });

    return this.mapToDomainEMD(prismaEMD);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    status?: EMDStatus;
    offerId?: string;
    searchTerm?: string;
  }): Promise<EMD[]> {
    const { skip, take, status, offerId, searchTerm } = params;

    const prismaEMDs = await this.prisma.eMD.findMany({
      skip,
      take,
      where: {
        AND: [
          status ? { status: status as unknown as PrismaEMDStatus } : {},
          offerId ? { offerId } : {},
          searchTerm ? {
            OR: [
              { bankName: { contains: searchTerm, mode: 'insensitive' } },
              { tags: { has: searchTerm } },
              { loa: { loaNumber: { contains: searchTerm, mode: 'insensitive' } } }
            ]
          } : {}
        ]
      },
      include: {
        offer: true,
        loa: {
          include: {
            site: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return prismaEMDs.map(emd => this.mapToDomainEMD(emd)!);
  }

  async count(params: {
    status?: EMDStatus;
    offerId?: string;
    searchTerm?: string;
  }): Promise<number> {
    const { status, offerId, searchTerm } = params;

    return this.prisma.eMD.count({
      where: {
        AND: [
          status ? { status: status as unknown as PrismaEMDStatus } : {},
          offerId ? { offerId } : {},
          searchTerm ? {
            OR: [
              { bankName: { contains: searchTerm, mode: 'insensitive' } },
              { tags: { has: searchTerm } }
            ]
          } : {}
        ]
      }
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<EMD[]> {
    const prismaEMDs = await this.prisma.eMD.findMany({
      where: {
        AND: [
          { maturityDate: { gte: startDate } },
          { maturityDate: { lte: endDate } }
        ]
      },
      include: {
        offer: true,
        loa: {
          include: {
            site: true
          }
        }
      },
      orderBy: {
        maturityDate: 'asc'
      }
    });

    return prismaEMDs.map(emd => this.mapToDomainEMD(emd)!);
  }

  async findExpiring(daysThreshold: number): Promise<EMD[]> {
    const today = new Date();
    const thresholdDate = new Date(today);
    thresholdDate.setDate(today.getDate() + daysThreshold);

    const prismaEMDs = await this.prisma.eMD.findMany({
      where: {
        AND: [
          { status: EMDStatus.ACTIVE as unknown as PrismaEMDStatus },
          { maturityDate: { lte: thresholdDate } }
        ]
      },
      include: {
        offer: true,
        loa: {
          include: {
            site: true
          }
        }
      },
      orderBy: {
        maturityDate: 'asc'
      }
    });

    return prismaEMDs.map(emd => this.mapToDomainEMD(emd)!);
  }

  async updateStatus(id: string, status: EMDStatus): Promise<EMD> {
    const prismaEMD = await this.prisma.eMD.update({
      where: { id },
      data: { status: status as unknown as PrismaEMDStatus },
      include: {
        offer: true,
        loa: {
          include: {
            site: true
          }
        }
      }
    });

    return this.mapToDomainEMD(prismaEMD)!;
  }
}