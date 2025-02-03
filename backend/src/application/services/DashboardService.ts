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
      activeEMDs,
      activeEMDsValue,
      offerStatusCounts,
      emdMaturity
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
      // Count active EMDs
      this.prisma.eMD.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      // Get sum of active EMDs value
      this.prisma.eMD.aggregate({
        where: {
          status: 'ACTIVE'
        },
        _sum: {
          amount: true
        }
      }),
      // Get offer status distribution
      this.prisma.budgetaryOffer.groupBy({
        by: ['status'],
        _count: true
      }),
      // Get EMD maturity timeline
      this.prisma.eMD.groupBy({
        by: ['maturityDate'],
        _count: true,
        where: {
          status: 'ACTIVE'
        }
      })
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

    // console.log("activeEMDsValue", activeEMDsValue);
    // Calculate trends (percentage change)
    const offersTrend = previousMonthOffers === 0 ? 100 : 
      ((currentMonthOffers - previousMonthOffers) / previousMonthOffers) * 100;
    const ordersTrend = previousMonthPOs === 0 ? 100 : 
      ((currentMonthPOs - previousMonthPOs) / previousMonthPOs) * 100;

    return {
      totalOffers: currentMonthOffers,
      totalOrders: currentMonthPOs,
      activeEmds: activeEMDs,
      activeEmdsValue: activeEMDsValue._sum.amount || 0,
      offersTrend: Math.round(offersTrend),
      ordersTrend: Math.round(ordersTrend),
      offerStatus: offerStatusCounts.map(status => ({
        name: status.status,
        value: status._count,
        color: this.getStatusColor(status.status)
      })),
      emdMaturity: this.processEMDMaturity(emdMaturity)
    };
  }

  async getRecentActivities() {
    const activities = await Promise.all([
      // Get recent offers
      this.prisma.budgetaryOffer.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          offerId: true,
          status: true,
          createdAt: true,

        }
      }),
      // Get recent POs
      this.prisma.purchaseOrder.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          poNumber: true,
          status: true,
          createdAt: true
        }
      }),
      // Get recent EMDs
      this.prisma.eMD.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          createdAt: true,
          amount: true
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

  private processEMDMaturity(maturityData: any[]) {
    const ranges = [
      { label: '0-30 days', max: 30 },
      { label: '31-60 days', max: 60 },
      { label: '61-90 days', max: 90 }
    ];

    return ranges.map(range => ({
      range: range.label,
      count: maturityData.filter(d => {
        const daysToMaturity = Math.ceil(
          (new Date(d.maturityDate).getTime() - new Date().getTime()) / 
          (1000 * 60 * 60 * 24)
        );
        return daysToMaturity <= range.max && daysToMaturity > (range.max - 30);
      }).length
    }));
  }

  private processActivities([offers, pos, emds]: any[]) {
    const activities = [
      ...offers.map((offer: any) => ({
        id: offer.id,
        type: 'offer',
        title: `Budgetary Offer ${offer.offerNumber}`,
        description: `Status: ${offer.status}`,
        timestamp: offer.createdAt,
        status: offer.status
      })),
      ...pos.map((po: any) => ({
        id: po.id,
        type: 'po',
        title: `Purchase Order ${po.poNumber}`,
        description: `Status: ${po.status}`,
        timestamp: po.createdAt,
        status: po.status
      })),
      ...emds.map((emd: any) => ({
        id: emd.id,
        type: 'emd',
        title: `EMD ${emd.emdNumber}`,
        description: `Status: ${emd.status}`,
        timestamp: emd.createdAt,
        status: emd.status
      }))
    ];

    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 10);
  }
}