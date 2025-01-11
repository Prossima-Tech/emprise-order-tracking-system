// src/models/BudgetaryOffer.ts
import prisma from '../config/database';
import { 
  BudgetaryOfferStatus,
  WorkItem,
  EMDDetails
} from '../types';
import { Prisma } from '@prisma/client';

interface FilterQuery {
  status?: BudgetaryOfferStatus;
  createdAt?: {
    gte: Date;
    lte: Date;
  };
}

type BudgetaryOfferWithJson = Prisma.BudgetaryOfferGetPayload<{
  include: {
    createdBy: {
      select: {
        name: true;
        email: true;
      }
    };
    emdTrackings: true;
  };
}> & {
  workItems: WorkItem[];
  emdDetails: EMDDetails;
};

export class BudgetaryOfferModel {
  /**
   * Convert data to Prisma JSON value
   */
  private static toPrismaJson<T>(data: T): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(data)) as Prisma.InputJsonValue;
  }

  /**
   * Convert raw JSON data to typed data
   */
  private static parseJsonFields(offer: any): BudgetaryOfferWithJson {
    return {
      ...offer,
      workItems: JSON.parse(JSON.stringify(offer.workItems)) as WorkItem[],
      emdDetails: JSON.parse(JSON.stringify(offer.emdDetails)) as EMDDetails
    };
  }

  /**
   * Create a new budgetary offer
   */
  static async create(data: {
    fromAuthority: string;
    toAuthority: string;
    subject: string;
    workItems: WorkItem[];
    emdDetails: EMDDetails;
    termsAndConditions: string;
    createdById: string;
  }) {
    // Validate EMD amount
    if (!this.validateEMDAmount(data.workItems, data.emdDetails.amount)) {
      throw new Error('EMD amount cannot exceed 5% of total project value');
    }

    const offer = await prisma.budgetaryOffer.create({
      data: {
        fromAuthority: data.fromAuthority,
        toAuthority: data.toAuthority,
        subject: data.subject,
        workItems: this.toPrismaJson(data.workItems),
        emdDetails: this.toPrismaJson(data.emdDetails),
        termsAndConditions: data.termsAndConditions,
        status: BudgetaryOfferStatus.DRAFT,
        createdById: data.createdById
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        emdTrackings: true
      }
    });

    // Create initial EMD tracking record
    await prisma.eMDTracking.create({
      data: {
        offerId: offer.id,
        amount: new Prisma.Decimal(data.emdDetails.amount),
        status: 'ACTIVE',
        dueDate: new Date(Date.now() + (data.emdDetails.validityPeriod || 180) * 24 * 60 * 60 * 1000),
        paymentMode: data.emdDetails.paymentMode,
        remarks: data.emdDetails.remarks || null
      }
    });

    return this.parseJsonFields(offer);
  }

  /**
   * Find budgetary offer by ID
   */
  static async findById(id: string) {
    const offer = await prisma.budgetaryOffer.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        emdTrackings: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!offer) return null;

    return this.parseJsonFields(offer);
  }

  /**
   * Find all budgetary offers with filters
   */
  static async findAll(filters: FilterQuery = {}, skip?: number, limit?: number) {
    const where: Prisma.BudgetaryOfferWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.createdAt) {
      where.createdAt = {
        gte: filters.createdAt.gte,
        lte: filters.createdAt.lte
      };
    }

    const offers = await prisma.budgetaryOffer.findMany({
      where,
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        emdTrackings: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    return offers.map(offer => this.parseJsonFields(offer));
  }

  /**
   * Count total records with filters
   */
  static async count(filters: FilterQuery = {}): Promise<number> {
    const where: Prisma.BudgetaryOfferWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.createdAt) {
      where.createdAt = {
        gte: filters.createdAt.gte,
        lte: filters.createdAt.lte
      };
    }

    return prisma.budgetaryOffer.count({ where });
  }

  /**
   * Update budgetary offer status
   */
  static async updateStatus(id: string, status: BudgetaryOfferStatus) {
    const updatedOffer = await prisma.budgetaryOffer.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        emdTrackings: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    return this.parseJsonFields(updatedOffer);
  }

  /**
   * Update budgetary offer
   */
  static async update(id: string, data: {
    fromAuthority?: string;
    toAuthority?: string;
    subject?: string;
    workItems?: WorkItem[];
    emdDetails?: EMDDetails;
    termsAndConditions?: string;
  }) {
    const currentOffer = await this.findById(id);
    if (!currentOffer) {
      throw new Error('Budgetary offer not found');
    }

    const updateData: Prisma.BudgetaryOfferUpdateInput = {};

    if (data.fromAuthority) updateData.fromAuthority = data.fromAuthority;
    if (data.toAuthority) updateData.toAuthority = data.toAuthority;
    if (data.subject) updateData.subject = data.subject;
    if (data.workItems) updateData.workItems = this.toPrismaJson(data.workItems);
    if (data.termsAndConditions) updateData.termsAndConditions = data.termsAndConditions;

    if (data.emdDetails) {
      const workItems = data.workItems || currentOffer.workItems;
      
      if (!this.validateEMDAmount(workItems, data.emdDetails.amount)) {
        throw new Error('EMD amount cannot exceed 5% of total project value');
      }

      updateData.emdDetails = this.toPrismaJson(data.emdDetails);

      // Create new EMD tracking record
      await prisma.eMDTracking.create({
        data: {
          offerId: id,
          amount: new Prisma.Decimal(data.emdDetails.amount),
          status: 'ACTIVE',
          dueDate: new Date(Date.now() + (data.emdDetails.validityPeriod || 180) * 24 * 60 * 60 * 1000),
          paymentMode: data.emdDetails.paymentMode,
          remarks: data.emdDetails.remarks || null
        }
      });
    }

    const updatedOffer = await prisma.budgetaryOffer.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        emdTrackings: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    return this.parseJsonFields(updatedOffer);
  }

  /**
   * Get statistics
   */
  static async getStatistics(dateRange?: { startDate: Date; endDate: Date }) {
    const where: Prisma.BudgetaryOfferWhereInput = {};
    
    if (dateRange) {
      where.createdAt = {
        gte: dateRange.startDate,
        lte: dateRange.endDate
      };
    }

    const offers = await prisma.budgetaryOffer.findMany({
      where,
      include: {
        emdTrackings: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    const parsedOffers = offers.map(offer => this.parseJsonFields(offer));

    const statistics = {
      total: parsedOffers.length,
      totalWorkItems: 0,
      totalValue: 0,
      totalEMDValue: 0,
      byStatus: {
        [BudgetaryOfferStatus.DRAFT]: 0,
        [BudgetaryOfferStatus.SUBMITTED]: 0,
        [BudgetaryOfferStatus.APPROVED]: 0,
        [BudgetaryOfferStatus.REJECTED]: 0
      },
      emdByPaymentMode: {
        BG: 0,
        DD: 0,
        ONLINE: 0,
        CASH: 0
      },
      averageEMDPercentage: 0
    };

    parsedOffers.forEach(offer => {
      statistics.totalWorkItems += offer.workItems.length;
      
      const { totalValue } = this.calculateWorkItemsValue(offer.workItems);
      statistics.totalValue += totalValue;
      statistics.totalEMDValue += Number(offer.emdDetails.amount);
      
      if (offer.emdDetails.paymentMode in statistics.emdByPaymentMode) {
        statistics.emdByPaymentMode[offer.emdDetails.paymentMode as keyof typeof statistics.emdByPaymentMode]++;
      }
      
      statistics.byStatus[offer.status as BudgetaryOfferStatus]++;
    });

    if (parsedOffers.length > 0) {
      statistics.averageEMDPercentage = (statistics.totalEMDValue / statistics.totalValue) * 100;
    }

    return statistics;
  }

  /**
   * Calculate total value of work items
   */
  static calculateWorkItemsValue(workItems: WorkItem[]): {
    totalValue: number;
    suggestedEMD: number;
    maxEMD: number;
    breakdown: Array<{
      description: string;
      basicValue: number;
      taxValue: number;
      totalValue: number;
    }>;
  } {
    const breakdown = workItems.map(item => {
      const basicValue = item.basicRate;
      const taxValue = basicValue * (item.taxRate / 100);
      const totalValue = basicValue + taxValue;

      return {
        description: item.description,
        basicValue,
        taxValue,
        totalValue
      };
    });

    const totalValue = breakdown.reduce((sum, item) => sum + item.totalValue, 0);
    const suggestedEMD = totalValue * 0.02; // 2% of total value
    const maxEMD = totalValue * 0.05; // 5% of total value

    return {
      totalValue,
      suggestedEMD,
      maxEMD,
      breakdown
    };
  }

  /**
   * Validate EMD amount against work items total value
   */
  static validateEMDAmount(workItems: WorkItem[], emdAmount: number): boolean {
    const { totalValue } = this.calculateWorkItemsValue(workItems);
    return emdAmount <= totalValue * 0.05; // EMD should not exceed 5% of total value
  }
}