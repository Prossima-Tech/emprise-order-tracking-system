import { PrismaClient } from '@prisma/client';
import { Tender } from '../../../domain/entities/Tender';
import { TenderStatus } from '../../../domain/entities/constants';

export class PrismaTenderRepository {
  constructor(private prisma: PrismaClient) {}

  private toDomainEntity(prismaTender: any): Tender {
    return {
      id: prismaTender.id,
      tenderNumber: prismaTender.tenderNumber,
      dueDate: prismaTender.dueDate,
      description: prismaTender.description,
      hasEMD: prismaTender.hasEMD,
      emdAmount: prismaTender.emdAmount,
      status: prismaTender.status as TenderStatus,
      documentUrl: prismaTender.documentUrl,
      tags: prismaTender.tags || [],
      createdAt: prismaTender.createdAt,
      updatedAt: prismaTender.updatedAt
    };
  }

  async create(tender: Omit<Tender, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tender> {
    // Parse tags if they are a string
    let tags = tender.tags || [];
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (error) {
        console.error('Error parsing tags string:', error);
        tags = [];
      }
    }

    const created = await this.prisma.tender.create({
      data: {
        tenderNumber: tender.tenderNumber,
        dueDate: tender.dueDate,
        description: tender.description,
        hasEMD: tender.hasEMD,
        emdAmount: tender.emdAmount,
        status: tender.status as any,
        documentUrl: tender.documentUrl,
        tags: tags
      }
    });

    return this.toDomainEntity(created);
  }

  async update(id: string, tender: Partial<Tender>): Promise<Tender> {
    // Parse tags if they are a string
    let tags = tender.tags;
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (error) {
        console.error('Error parsing tags string:', error);
        tags = [];
      }
    }

    const updated = await this.prisma.tender.update({
      where: { id },
      data: {
        tenderNumber: tender.tenderNumber,
        dueDate: tender.dueDate,
        description: tender.description,
        hasEMD: tender.hasEMD,
        emdAmount: tender.emdAmount,
        status: tender.status as any,
        documentUrl: tender.documentUrl,
        tags: tags
      }
    });

    return this.toDomainEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tender.delete({
      where: { id }
    });
  }

  async findById(id: string): Promise<Tender | null> {
    const tender = await this.prisma.tender.findUnique({
      where: { id }
    });

    return tender ? this.toDomainEntity(tender) : null;
  }

  async findByTenderNumber(tenderNumber: string): Promise<Tender | null> {
    const tender = await this.prisma.tender.findUnique({
      where: { tenderNumber }
    });

    return tender ? this.toDomainEntity(tender) : null;
  }

  async findAll(options?: {
    status?: TenderStatus;
    searchTerm?: string;
  }): Promise<{ data: Tender[]; total: number }> {
    try {
      const { status, searchTerm } = options || {};

      const whereClause: any = {};

      if (status) {
        whereClause.status = status;
      }

      if (searchTerm) {
        whereClause.OR = [
          { tenderNumber: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } }
        ];
      }

      const [tenders, total] = await Promise.all([
        this.prisma.tender.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' }
        }),
        this.prisma.tender.count({ where: whereClause })
      ]);

      // Handle case of empty array
      if (!tenders || !Array.isArray(tenders)) {
        return { data: [], total: 0 };
      }

      return {
        data: tenders.map((tender) => this.toDomainEntity(tender)),
        total
      };
    } catch (error) {
      console.error('Error in repository findAll:', error);
      // Return empty array to avoid errors
      return { data: [], total: 0 };
    }
  }
} 