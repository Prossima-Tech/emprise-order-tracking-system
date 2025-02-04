// infrastructure/persistence/repositories/PrismaLoaRepository.ts
import { PrismaClient, Prisma, LOA as PrismaLOA, Amendment as PrismaAmendment } from '@prisma/client';
import { DeliveryPeriod } from '../../../application/dtos/loa/CreateLoaDto';
import { LOA, Amendment } from '../../../domain/entities/LOA';

export class PrismaLoaRepository {
  constructor(private prisma: PrismaClient) {}

  private mapPrismaLoaToLoa(prismaLoa: PrismaLOA & {
    amendments: PrismaAmendment[];
    purchaseOrders: any[]; // Replace 'any' with your PO type
    emd?: any; // Add EMD to the mapping
  }): LOA {
    // Don't parse the deliveryPeriod as it's already an object
    return {
      id: prismaLoa.id,
      loaNumber: prismaLoa.loaNumber,
      loaValue: prismaLoa.loaValue,
      deliveryPeriod: prismaLoa.deliveryPeriod ? {
        start: new Date((prismaLoa.deliveryPeriod as any).start),
        end: new Date((prismaLoa.deliveryPeriod as any).end)
      } : { start: new Date(), end: new Date() },
      workDescription: prismaLoa.workDescription,
      documentUrl: prismaLoa.documentUrl,
      tags: prismaLoa.tags,
      amendments: prismaLoa.amendments.map(amendment => ({
        id: amendment.id,
        amendmentNumber: amendment.amendmentNumber,
        documentUrl: amendment.documentUrl,
        tags: amendment.tags,
        createdAt: amendment.createdAt,
        updatedAt: amendment.updatedAt,
        loaId: amendment.loaId
      })),
      purchaseOrders: prismaLoa.purchaseOrders,
      emd: prismaLoa.emd ,
      createdAt: prismaLoa.createdAt,
      updatedAt: prismaLoa.updatedAt
    };
  }

  private mapPrismaAmendmentToAmendment(prismaAmendment: PrismaAmendment & {
    loa: PrismaLOA & {
      amendments: PrismaAmendment[];
      purchaseOrders: any[]; // Replace 'any' with your PO type
    };
  }): Amendment {
    return {
      id: prismaAmendment.id,
      amendmentNumber: prismaAmendment.amendmentNumber,
      documentUrl: prismaAmendment.documentUrl,
      tags: prismaAmendment.tags,
      loaId: prismaAmendment.loaId,
      loa: this.mapPrismaLoaToLoa(prismaAmendment.loa),
      createdAt: prismaAmendment.createdAt,
      updatedAt: prismaAmendment.updatedAt
    };
  }

  async create(data: {
    loaNumber: string;
    loaValue: number;
    deliveryPeriod: DeliveryPeriod;
    workDescription: string;
    documentUrl: string;
    tags: string[];
    emdId?: string; // Single EMD ID
  }): Promise<LOA> {
    try {
      const prismaLoa = await this.prisma.lOA.create({
        data: {
          loaNumber: data.loaNumber,
          loaValue: data.loaValue,
          deliveryPeriod: {
            start: new Date(data.deliveryPeriod.start),
            end: new Date(data.deliveryPeriod.end)
          },
          workDescription: data.workDescription,
          documentUrl: data.documentUrl,
          tags: data.tags,
          emd: data.emdId ? {
            connect: { id: data.emdId }
          } : undefined
        },
        include: {
          amendments: true,
          purchaseOrders: true,
          emd: true // Include single EMD in the response
        }
      });

      return this.mapPrismaLoaToLoa(prismaLoa);
    } catch (error) {
      console.error('PrismaLoaRepository create error:', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<Omit<LOA, 'id' | 'amendments' | 'purchaseOrders'>>): Promise<LOA> {
    const updateData: Prisma.LOAUpdateInput = {
      loaNumber: data.loaNumber,
      loaValue: data.loaValue,
      workDescription: data.workDescription,
      documentUrl: data.documentUrl,
      tags: data.tags ? { set: data.tags } : undefined,
      deliveryPeriod: data.deliveryPeriod ? {
        start: new Date(data.deliveryPeriod.start),
        end: new Date(data.deliveryPeriod.end)
      } : undefined,
      emd: (data as any).emdId ? {
        connect: { id: (data as any).emdId }
      } : undefined
    };

    const prismaLoa = await this.prisma.lOA.update({
      where: { id },
      data: updateData,
      include: {
        amendments: true,
        purchaseOrders: true,
        emd: true // Include single EMD in the response
      }
    });

    return this.mapPrismaLoaToLoa(prismaLoa);
  }

  async delete(id: string): Promise<LOA> {
    const prismaLoa = await this.prisma.lOA.delete({
      where: { id },
      include: {
        amendments: true,
        purchaseOrders: true
      }
    });

    return this.mapPrismaLoaToLoa(prismaLoa);
  }

  async findById(id: string): Promise<LOA | null> {
    const prismaLoa = await this.prisma.lOA.findUnique({
      where: { id },
      include: {
        amendments: true,
        purchaseOrders: true,
        emd: true // Include single EMD
      }
    });

    return prismaLoa ? this.mapPrismaLoaToLoa(prismaLoa) : null;
  }

  async findByLoaNumber(loaNumber: string): Promise<LOA | null> {
    const prismaLoa = await this.prisma.lOA.findUnique({
      where: { loaNumber },
      include: {
        amendments: true,
        purchaseOrders: true,
        emd: true // Include single EMD
      }
    });

    return prismaLoa ? this.mapPrismaLoaToLoa(prismaLoa) : null;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    searchTerm?: string;
  }): Promise<LOA[]> {
    const prismaLoas = await this.prisma.lOA.findMany({
      skip: params.skip,
      take: params.take,
      where: params.searchTerm ? {
        OR: [
          { loaNumber: { contains: params.searchTerm, mode: 'insensitive' } },
          { workDescription: { contains: params.searchTerm, mode: 'insensitive' } },
          { tags: { has: params.searchTerm } }
        ]
      } : undefined,
      include: {
        amendments: true,
        purchaseOrders: true,
        emd: true // Include single EMD
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return prismaLoas.map(this.mapPrismaLoaToLoa.bind(this));
  }

  async count(params: { searchTerm?: string }): Promise<number> {
    return this.prisma.lOA.count({
      where: params.searchTerm ? {
        OR: [
          { loaNumber: { contains: params.searchTerm, mode: 'insensitive' } },
          { workDescription: { contains: params.searchTerm, mode: 'insensitive' } },
          { tags: { has: params.searchTerm } }
        ]
      } : undefined
    });
  }

  async createAmendment(data: {
    amendmentNumber: string;
    documentUrl: string;
    loaId: string;
    tags: string[];
  }): Promise<Amendment> {
    const prismaAmendment = await this.prisma.amendment.create({
      data,
      include: {
        loa: {
          include: {
            amendments: true,
            purchaseOrders: true
          }
        }
      }
    });

    return this.mapPrismaAmendmentToAmendment(prismaAmendment);
  }

  async updateAmendment(id: string, data: Partial<Omit<Amendment, 'id' | 'loa'>>): Promise<Amendment> {
    const updateData: Prisma.AmendmentUpdateInput = {
      amendmentNumber: data.amendmentNumber,
      documentUrl: data.documentUrl,
      tags: data.tags ? { set: data.tags } : undefined
    };

    const prismaAmendment = await this.prisma.amendment.update({
      where: { id },
      data: updateData,
      include: {
        loa: {
          include: {
            amendments: true,
            purchaseOrders: true
          }
        }
      }
    });

    return this.mapPrismaAmendmentToAmendment(prismaAmendment);
  }

  async deleteAmendment(id: string): Promise<Amendment> {
    const prismaAmendment = await this.prisma.amendment.delete({
      where: { id },
      include: {
        loa: {
          include: {
            amendments: true,
            purchaseOrders: true
          }
        }
      }
    });

    return this.mapPrismaAmendmentToAmendment(prismaAmendment);
  }

  async findAmendmentById(id: string): Promise<Amendment | null> {
    const prismaAmendment = await this.prisma.amendment.findUnique({
      where: { id },
      include: {
        loa: {
          include: {
            amendments: true,
            purchaseOrders: true
          }
        }
      }
    });

    return prismaAmendment ? this.mapPrismaAmendmentToAmendment(prismaAmendment) : null;
  }

  // Replace findEMDsByIds with findEMDById
  async findEMDById(emdId: string): Promise<any | null> {
    return this.prisma.eMD.findUnique({
      where: {
        id: emdId
      }
    });
  }
}