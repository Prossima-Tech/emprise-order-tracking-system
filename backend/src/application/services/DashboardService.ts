import { PrismaClient } from '@prisma/client';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export class DashboardService {
  constructor(private prisma: PrismaClient) {}

  async getDashboardStats() {
    const currentDate = new Date();
    const startOfCurrentMonth = startOfMonth(currentDate);
    const endOfCurrentMonth = endOfMonth(currentDate);
    const startOfPreviousMonth = startOfMonth(subMonths(currentDate, 1));
    const endOfPreviousMonth = endOfMonth(subMonths(currentDate, 1));

    // Get current month stats
    const [
      currentMonthOffers,
      currentMonthPOs,
      offerStatusCounts,
      totalOffers,
      totalPOs
    ] = await Promise.all([
      // Count current month offers
      this.prisma.budgetaryOffer.count({
        where: {
          createdAt: {
            gte: startOfCurrentMonth,
            lte: endOfCurrentMonth
          }
        }
      }),
      // Count current month POs
      this.prisma.purchaseOrder.count({
        where: {
          createdAt: {
            gte: startOfCurrentMonth,
            lte: endOfCurrentMonth
          }
        }
      }),
      // Get offer status distribution
      this.prisma.budgetaryOffer.groupBy({
        by: ['status'],
        _count: true
      }),
      // Get total offers (all time)
      this.prisma.budgetaryOffer.count(),
      // Get total POs (all time)
      this.prisma.purchaseOrder.count()
    ]);

    // Get previous month stats for trend calculation
    const [previousMonthOffers, previousMonthPOs] = await Promise.all([
      this.prisma.budgetaryOffer.count({
        where: {
          createdAt: {
            gte: startOfPreviousMonth,
            lte: endOfPreviousMonth
          }
        }
      }),
      this.prisma.purchaseOrder.count({
        where: {
          createdAt: {
            gte: startOfPreviousMonth,
            lte: endOfPreviousMonth
          }
        }
      })
    ]);

    // Calculate trends (percentage change)
    const offersTrend = previousMonthOffers === 0 ? 100 : 
      ((currentMonthOffers - previousMonthOffers) / previousMonthOffers) * 100;
    const ordersTrend = previousMonthPOs === 0 ? 100 : 
      ((currentMonthPOs - previousMonthPOs) / previousMonthPOs) * 100;

    // Get average processing time for POs (in days)
    const processingTimeResult = await this.prisma.$queryRaw<{ avgProcessingTime: number }[]>`
      SELECT AVG(EXTRACT(EPOCH FROM ("updatedAt" - "createdAt")) / 86400) as avgProcessingTime
      FROM "PurchaseOrder"
      WHERE status = 'APPROVED'
    `;
    
    const avgProcessingTime = processingTimeResult[0]?.avgProcessingTime || 0;

    return {
      totalOffers,
      totalOrders: totalPOs,
      offersTrend: Math.round(offersTrend),
      ordersTrend: Math.round(ordersTrend),
      processingTime: Math.round(avgProcessingTime * 10) / 10, // Round to 1 decimal place
      processingTimeTrend: -12, // Hardcoded for now, would need historical data to calculate
      offerStatus: offerStatusCounts.map(status => ({
        name: status.status,
        value: status._count,
        color: this.getStatusColor(status.status)
      }))
    };
  }

  async getRecentActivities() {
    const activities = await Promise.all([
      // Get recent offers with more details
      this.prisma.budgetaryOffer.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          offerId: true,
          subject: true,
          status: true,
          createdAt: true,
          createdBy: {
            select: {
              name: true
            }
          }
        }
      }),
      // Get recent POs with more details
      this.prisma.purchaseOrder.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          poNumber: true,
          status: true,
          createdAt: true,
          totalAmount: true,
          vendor: {
            select: {
              name: true
            }
          },
          site: {
            select: {
              name: true
            }
          },
          createdBy: {
            select: {
              name: true
            }
          }
        }
      })
    ]);
    
    return this.processActivities(activities);
  }

  async getProcurementTrends() {
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return {
        start: startOfMonth(date),
        end: endOfMonth(date),
        month: date.toLocaleString('default', { month: 'short' })
      };
    }).reverse();

    const trends = await Promise.all(
      last12Months.map(async ({ start, end, month }) => {
        const [offers, orders] = await Promise.all([
          this.prisma.budgetaryOffer.count({
            where: {
              createdAt: {
                gte: start,
                lte: end
              }
            }
          }),
          this.prisma.purchaseOrder.count({
            where: {
              createdAt: {
                gte: start,
                lte: end
              }
            }
          })
        ]);

        return {
          month,
          offers,
          orders
        };
      })
    );

    return trends;
  }

  private getStatusColor(status: string): string {
    const colors = {
      DRAFT: '#9CA3AF',
      PENDING_APPROVAL: '#FCD34D',
      APPROVED: '#34D399',
      REJECTED: '#EF4444'
    };
    return colors[status as keyof typeof colors] || '#9CA3AF';
  }

  private processActivities([offers, pos]: any[]) {
    const activities = [
      ...offers.map((offer: any) => ({
        id: offer.id,
        type: 'offer',
        title: `Budgetary Offer ${offer.offerId}`,
        description: offer.subject ? 
          `${offer.subject.substring(0, 40)}${offer.subject.length > 40 ? '...' : ''}` : 
          `Created by ${offer.createdBy?.name || 'Unknown'}`,
        timestamp: offer.createdAt,
        status: offer.status,
        createdBy: offer.createdBy?.name
      })),
      ...pos.map((po: any) => ({
        id: po.id,
        type: 'po',
        title: `Purchase Order ${po.poNumber}`,
        description: po.vendor ? 
          `${po.totalAmount ? this.formatCurrency(po.totalAmount) : ''} - ${po.vendor.name}${po.site ? ` - ${po.site.name}` : ''}` : 
          `Created by ${po.createdBy?.name || 'Unknown'}`,
        timestamp: po.createdAt,
        status: po.status,
        createdBy: po.createdBy?.name,
        amount: po.totalAmount
      }))
    ];

    // Sort by most recent first
    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
  
  // Format currency for display
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  }

  async getOffersByStatus() {
    // Get all possible statuses from the enum to ensure we include zeros
    const allStatuses = Object.values(await this.prisma.$queryRaw<{status: string}[]>`
      SELECT unnest(enum_range(NULL::"OfferStatus")) as status
    `).map(s => s.status);
    
    // Get counts for each status
    const statusCounts = await this.prisma.budgetaryOffer.groupBy({
      by: ['status'],
      _count: true
    });
    
    // Create a map of status to count
    const countMap = statusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count;
      return acc;
    }, {} as Record<string, number>);
    
    // Map all statuses including those with zero count
    return allStatuses.map(status => ({
      name: status,
      value: countMap[status] || 0,
      color: this.getStatusColor(status)
    }));
  }
}