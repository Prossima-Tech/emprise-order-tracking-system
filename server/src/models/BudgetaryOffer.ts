import prisma from '../config/database';
import { 
  BudgetaryOffer, 
  BudgetaryOfferCreateInput,
  BudgetaryOfferUpdateInput,
  BudgetaryOfferStatus,
  WorkItem,
  EMDDetails,
  ApprovalLevel,
  RejectionRecord,
  BudgetaryOfferStatistics
} from '../types/budgetaryOffer';
import { Prisma } from '@prisma/client';

export class BudgetaryOfferModel {
  /**
   * Convert complex objects to Prisma JSON value
   */
  private static toPrismaJson<T>(data: T): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(data));
  }

  /**
   * Convert raw JSON data to typed data
   */
  private static parseJsonFields(offer: any): BudgetaryOffer {
    return {
      ...offer,
      workItems: JSON.parse(JSON.stringify(offer.workItems)) as WorkItem[],
      emdDetails: JSON.parse(JSON.stringify(offer.emdDetails)) as EMDDetails,
      approvalLevels: JSON.parse(JSON.stringify(offer.approvalLevels)) as ApprovalLevel[],
      rejectionHistory: offer.rejectionHistory ? 
        JSON.parse(JSON.stringify(offer.rejectionHistory)) as RejectionRecord[] : 
        undefined
    };
  }

  /**
   * Calculate total value of work items
   */
  private static calculateTotalValue(workItems: WorkItem[]): number {
    return workItems.reduce((total, item) => {
      const itemTotal = item.quantity * item.baseRate * (1 + item.taxRate / 100);
      return total + itemTotal;
    }, 0);
  }

  /**
   * Validate EMD amount against total project value
   */
  private static validateEMDAmount(workItems: WorkItem[], emdAmount: number): boolean {
    const totalValue = this.calculateTotalValue(workItems);
    return emdAmount <= totalValue * 0.05; // EMD should not exceed 5% of total value
  }

  /**
   * Create a new budgetary offer
   */
  static async create(data: BudgetaryOfferCreateInput & { createdById: string }): Promise<BudgetaryOffer> {
    // Calculate total amount for each work item
    const workItems = data.workItems.map(item => ({
      ...item,
      totalAmount: item.quantity * item.baseRate * (1 + item.taxRate / 100)
    }));

    // Validate EMD amount
    if (!this.validateEMDAmount(workItems, data.emdDetails.amount)) {
      throw new Error('EMD amount cannot exceed 5% of total project value');
    }

    const offer = await prisma.budgetaryOffer.create({
      data: {
        offerId: data.offerId,
        offerDate: data.offerDate,
        fromAuthority: data.fromAuthority,
        toAuthority: data.toAuthority,
        subject: data.subject,
        workItems: this.toPrismaJson(workItems),
        emdDetails: this.toPrismaJson(data.emdDetails),
        termsAndConditions: data.termsAndConditions.html,
        status: BudgetaryOfferStatus.DRAFT,
        approvalLevels: this.toPrismaJson([]),
        createdById: data.createdById
      },
      include: {
        createdBy: true
      }
    });

    return this.parseJsonFields(offer);
  }

  /**
   * Update an existing budgetary offer
   */
  static async update(
    id: string, 
    data: BudgetaryOfferUpdateInput
  ): Promise<BudgetaryOffer> {
    const currentOffer = await this.findById(id);
    if (!currentOffer) {
      throw new Error('Budgetary offer not found');
    }

    if (currentOffer.status !== BudgetaryOfferStatus.DRAFT) {
      throw new Error('Can only update offers in DRAFT status');
    }

    const updateData: Prisma.BudgetaryOfferUpdateInput = {};

    if (data.offerDate) updateData.offerDate = data.offerDate;
    if (data.fromAuthority) updateData.fromAuthority = data.fromAuthority;
    if (data.toAuthority) updateData.toAuthority = data.toAuthority;
    if (data.subject) updateData.subject = data.subject;
    if (data.termsAndConditions) updateData.termsAndConditions = data.termsAndConditions.html;

    if (data.workItems) {
      const workItems = data.workItems.map(item => ({
        ...item,
        totalAmount: item.quantity * item.baseRate * (1 + item.taxRate / 100)
      }));
      updateData.workItems = this.toPrismaJson(workItems);
    }

    if (data.emdDetails) {
      const workItems = data.workItems || currentOffer.workItems;
      if (!this.validateEMDAmount(workItems, data.emdDetails.amount)) {
        throw new Error('EMD amount cannot exceed 5% of total project value');
      }
      updateData.emdDetails = this.toPrismaJson(data.emdDetails);
    }

    const updatedOffer = await prisma.budgetaryOffer.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: true
      }
    });

    return this.parseJsonFields(updatedOffer);
  }

  /**
   * Update offer status and approval information
   */
  static async updateStatus(
    id: string,
    data: {
      status: BudgetaryOfferStatus;
      currentApprovalLevel?: number;
      approvalLevels?: ApprovalLevel[];
      rejectionRecord?: RejectionRecord;
    }
  ): Promise<BudgetaryOffer> {
    const updateData: Prisma.BudgetaryOfferUpdateInput = {
      status: data.status,
      currentApprovalLevel: data.currentApprovalLevel
    };

    if (data.approvalLevels) {
      updateData.approvalLevels = this.toPrismaJson(data.approvalLevels);
    }

    if (data.rejectionRecord) {
      const currentOffer = await this.findById(id);
      const rejectionHistory = [...(currentOffer?.rejectionHistory || []), data.rejectionRecord];
      updateData.rejectionHistory = this.toPrismaJson(rejectionHistory);
    }

    const updatedOffer = await prisma.budgetaryOffer.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: true
      }
    });

    return this.parseJsonFields(updatedOffer);
  }

  /**
   * Find budgetary offer by ID
   */
  static async findById(id: string): Promise<BudgetaryOffer | null> {
    const offer = await prisma.budgetaryOffer.findUnique({
      where: { id },
      include: {
        createdBy: true
      }
    });

    if (!offer) return null;

    return this.parseJsonFields(offer);
  }

  /**
   * Find all offers with filters and pagination
   */
  static async findAll(
    filters: {
      status?: BudgetaryOfferStatus;
      fromDate?: Date;
      toDate?: Date;
      createdById?: string;
      pendingApprovalFor?: string;
    },
    skip?: number,
    take?: number
  ): Promise<BudgetaryOffer[]> {
    const where: Prisma.BudgetaryOfferWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.fromDate || filters.toDate) {
      where.offerDate = {};
      if (filters.fromDate) where.offerDate.gte = filters.fromDate;
      if (filters.toDate) where.offerDate.lte = filters.toDate;
    }

    if (filters.createdById) {
      where.createdById = filters.createdById;
    }

    if (filters.pendingApprovalFor) {
      where.status = BudgetaryOfferStatus.PENDING_APPROVAL;
      where.approvalLevels = {
        path: ['$[*]', 'userId'],
        array_contains: filters.pendingApprovalFor
      };
    }

    const offers = await prisma.budgetaryOffer.findMany({
      where,
      include: {
        createdBy: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take
    });

    return offers.map(offer => this.parseJsonFields(offer));
  }

  /**
   * Count total records with filters
   */
  static async count(filters: {
    status?: BudgetaryOfferStatus;
    fromDate?: Date;
    toDate?: Date;
    createdById?: string;
    pendingApprovalFor?: string;
  }): Promise<number> {
    const where: Prisma.BudgetaryOfferWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.fromDate || filters.toDate) {
      where.offerDate = {};
      if (filters.fromDate) where.offerDate.gte = filters.fromDate;
      if (filters.toDate) where.offerDate.lte = filters.toDate;
    }

    if (filters.createdById) {
      where.createdById = filters.createdById;
    }

    if (filters.pendingApprovalFor) {
      where.status = BudgetaryOfferStatus.PENDING_APPROVAL;
      where.approvalLevels = {
        path: ['$[*].userId'],
        array_contains: filters.pendingApprovalFor
      };
    }

    return prisma.budgetaryOffer.count({ where });
  }

  /**
   * Get statistics for dashboard
   */
  static async getStatistics(dateRange?: {
    startDate: Date;
    endDate: Date;
  }): Promise<BudgetaryOfferStatistics> {
    const where: Prisma.BudgetaryOfferWhereInput = {};
    
    if (dateRange) {
      where.offerDate = {
        gte: dateRange.startDate,
        lte: dateRange.endDate
      };
    }

    const [offers, monthlyData] = await Promise.all([
      // Get all offers for basic statistics
      prisma.budgetaryOffer.findMany({
        where,
        select: {
          workItems: true,
          emdDetails: true,
          status: true,
          approvalLevels: true,
          createdAt: true
        }
      }),
      // Get monthly aggregates
      prisma.$queryRaw<{ month: Date; count: bigint; approved_count: bigint }[]>`
        SELECT 
          DATE_TRUNC('month', "offerDate") as month,
          COUNT(*) as count,
          COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved_count
        FROM "BudgetaryOffer"
        WHERE ${where}
        GROUP BY DATE_TRUNC('month', "offerDate")
        ORDER BY month DESC
        LIMIT 12
      `
    ]);

    const parsedOffers = offers.map(offer => this.parseJsonFields(offer));

    // Calculate total values
    const totalValue = parsedOffers.reduce((sum, offer) => 
      sum + this.calculateTotalValue(offer.workItems), 0);

    const totalEMDValue = parsedOffers.reduce((sum, offer) => 
      sum + offer.emdDetails.amount, 0);

    // Calculate status counts
    const byStatus = parsedOffers.reduce((acc, offer) => {
      acc[offer.status as BudgetaryOfferStatus] = (acc[offer.status as BudgetaryOfferStatus] || 0) + 1;
      return acc;
    }, {} as Record<BudgetaryOfferStatus, number>);

    // Calculate approval metrics
    const approvalTimes = parsedOffers
      .filter(offer => offer.status === BudgetaryOfferStatus.APPROVED)
      .map(offer => {
        const firstLevel = offer.approvalLevels[0];
        const lastLevel = offer.approvalLevels[offer.approvalLevels.length - 1];
        if (firstLevel?.timestamp && lastLevel?.timestamp) {
          return lastLevel.timestamp.getTime() - firstLevel.timestamp.getTime();
        }
        return 0;
      })
      .filter(time => time > 0);

    const averageApprovalTime = approvalTimes.length > 0
      ? approvalTimes.reduce((sum, time) => sum + time, 0) / approvalTimes.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    return {
      totalOffers: parsedOffers.length,
      totalValue,
      totalEMDValue,
      byStatus,
      monthlyTrends: monthlyData.map((row: any) => ({
        month: row.month,
        count: Number(row.count),
        value: Number(row.approved_count)
      })),
      approvalMetrics: {
        averageApprovalTime,
        pendingApprovals: parsedOffers.filter(o => 
          o.status === BudgetaryOfferStatus.PENDING_APPROVAL
        ).length
      }
    };
  }
}