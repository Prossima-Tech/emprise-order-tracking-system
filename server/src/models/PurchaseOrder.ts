// src/models/PurchaseOrder.ts
import { PrismaClient } from '@prisma/client';
import { 
  PurchaseOrder, 
  POStatus, 
  POCreateInput, 
  POMetrics,
  POFilter,
  PrismaQueryResult 
} from '../types/po.types';
import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../config/database';

export class PurchaseOrderModel {
  private static isDecimal(value: any): value is Decimal {
    return value && typeof value === 'object' && 'toNumber' in value;
  }

  private static convertDecimalValues(po: any): PurchaseOrder {
    return {
      ...po,
      value: this.isDecimal(po.value) ? po.value.toNumber() : po.value,
      items: po.items?.map((item: any) => ({
        ...item,
        unitPrice: this.isDecimal(item.unitPrice) ? item.unitPrice.toNumber() : item.unitPrice,
        totalPrice: this.isDecimal(item.totalPrice) ? item.totalPrice.toNumber() : item.totalPrice,
      }))
    };
  }

  static async generatePONumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.purchaseOrder.count({
      where: {
        createdAt: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1)
        }
      }
    });
    return `PO-${year}-${(count + 1).toString().padStart(4, '0')}`;
  }


  private static convertToPurchaseOrder(result: PrismaQueryResult | null): PurchaseOrder | null {
    if (!result) return null;

    return {
      ...result,
      items: result.items || [],
      status: result.status as POStatus
    };
  }
  

  static async create(data: POCreateInput): Promise<PurchaseOrder> {
    const poNumber = await this.generatePONumber();

    const result = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        loaId: data.loaId,
        vendorId: data.vendorId,
        value: new Decimal(data.value.toString()),
        deliveryDate: new Date(data.deliveryDate),
        status: POStatus.DRAFT,
        items: {
          create: data.items.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: new Decimal(item.unitPrice.toString()),
            totalPrice: new Decimal(item.totalPrice.toString()),
            specifications: item.specifications,
            status: 'PENDING'
          }))
        }
      },
      include: {
        loa: true,
        vendor: true,
        items: {
          include: {
            item: true
          }
        }
      }
    });

    return this.convertToPurchaseOrder(result as PrismaQueryResult)!;
  }


  // src/models/PurchaseOrder.ts
  static async findById(id: string): Promise<PurchaseOrder | null> {
    const result = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        loa: true,
        vendor: true,
        items: {
          include: {
            item: true
          }
        },
        invoices: true,
        statusHistory: {
          include: {
            createdBy: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    return this.convertToPurchaseOrder(result as PrismaQueryResult);
  }

  static async findAll(filter: POFilter = {}) {
    const where: any = {};

    if (filter.startDate && filter.endDate) {
      where.createdAt = {
        gte: filter.startDate,
        lte: filter.endDate
      };
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.vendorId) {
      where.vendorId = filter.vendorId;
    }

    if (filter.loaId) {
      where.loaId = filter.loaId;
    }

    const result = await prisma.purchaseOrder.findMany({
      where,
      include: {
        loa: true,
        vendor: true,
        items: {
          include: {
            item: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return result.map(po => this.convertDecimalValues(po));
  }

  static async updateStatus(
    id: string, 
    status: POStatus, 
    userId: string, 
    remarks?: string
  ): Promise<PurchaseOrder> {
    const currentPO = await this.findById(id);
    if (!currentPO) throw new Error('Purchase order not found');

    const result = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status,
        statusHistory: {
          create: {
            fromStatus: currentPO.status,
            toStatus: status,
            remarks,
            createdById: userId
          }
        },
        updatedAt: new Date()
      },
      include: {
        vendor: true,
        items: {
          include: {
            item: true
          }
        }
      }
    });

    return this.convertDecimalValues(result);
  }
  
  static async update(id: string, data: Partial<POCreateInput>): Promise<PurchaseOrder> {
    try {
        // Calculate new total value if items are provided
        let newValue = undefined;
        if (data.items) {
            newValue = data.items.reduce(
                (sum, item) => sum + (item.quantity * Number(item.unitPrice)), 
                0
            );
        }

        return await prisma.$transaction(async (tx) => {
            // Update main PO record
            const updatedPO = await tx.purchaseOrder.update({
                where: { id },
                data: {
                    ...(newValue && { value: new Decimal(newValue.toString()) }),
                    ...(data.deliveryDate && { deliveryDate: new Date(data.deliveryDate) }),
                    updatedAt: new Date()
                }
            });

            // Update items if provided
            if (data.items) {
                // Delete existing items
                await tx.purchaseOrderItem.deleteMany({
                    where: { poId: id }
                });

                // Create new items
                for (const item of data.items) {
                    await tx.purchaseOrderItem.create({
                        data: {
                            poId: id,
                            itemId: item.itemId,
                            quantity: item.quantity,
                            unitPrice: new Decimal(item.unitPrice.toString()),
                            totalPrice: new Decimal((item.quantity * Number(item.unitPrice)).toString()),
                            specifications: item.specifications || {},
                            status: 'PENDING'
                        }
                    });
                }
            }

            // Fetch updated PO with all relations
            const result = await tx.purchaseOrder.findUnique({
                where: { id },
                include: {
                    loa: true,
                    vendor: true,
                    items: {
                        include: {
                            item: true
                        }
                    }
                }
            });

            if (!result) {
                throw new Error('Purchase order not found after update');
            }

            // Use existing conversion method
            return this.convertDecimalValues(result);
        });
    } catch (error) {
        console.error('Error updating purchase order:', error);
        throw error;
    }
}
  // static async update(id: string, data: Partial<POCreateInput>): Promise<PurchaseOrder> {
  //   const result = await prisma.purchaseOrder.update({
  //     where: { id },
  //     data: {
  //       ...(data.value && { value: new Decimal(data.value.toString()) }),
  //       ...(data.deliveryDate && { deliveryDate: new Date(data.deliveryDate) }),
  //       updatedAt: new Date()
  //     },
  //     include: {
  //       loa: true,
  //       vendor: true,
  //       items: {
  //         include: {
  //           item: true
  //         }
  //       }
  //     }
  //   });

  //   return this.convertDecimalValues(result);
  // }

  static async getPOMetrics(id: string): Promise<POMetrics> {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        invoices: true,
        items: true
      }
    });

    if (!po) throw new Error('Purchase order not found');

    const totalInvoiced = po.invoices.reduce(
      (sum, inv) => sum + Number(inv.amount), 
      0
    );

    const totalPaid = po.invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + Number(inv.amount), 0);

    const today = new Date();
    const deliveryDate = new Date(po.deliveryDate);
    const daysRemaining = Math.ceil(
      (deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    const deliveryProgress = Math.round((totalPaid / Number(po.value)) * 100);

    return {
      totalInvoiced,
      totalPaid,
      deliveryProgress,
      isOverdue: daysRemaining < 0,
      daysRemaining
    };
  }

  static async getStatistics(filter: POFilter = {}) {
    try {
        console.log('Filter:', filter); // Debug log

        // Build the where clause based on filters
        const where: any = {};

        if (filter.startDate && filter.endDate) {
            where.createdAt = {
                gte: filter.startDate,
                lte: filter.endDate
            };
        }

        if (filter.vendorId) {
            where.vendorId = filter.vendorId;
        }

        console.log('Where clause:', where); // Debug log

        // Get all POs with the filter
        const purchaseOrders = await prisma.purchaseOrder.findMany({
            where,
            include: {
                items: {
                    include: {
                        item: true
                    }
                },
                loa: true,
                vendor: true
            }
        });

        console.log('Found POs:', purchaseOrders.length); // Debug log
        console.log('POs:', JSON.stringify(purchaseOrders, null, 2)); // Debug log

        // If no POs found, return empty statistics
        if (purchaseOrders.length === 0) {
            return {
                total: 0,
                totalValue: 0,
                byStatus: {
                    DRAFT: 0,
                    ISSUED: 0,
                    IN_PROGRESS: 0,
                    COMPLETED: 0,
                    CANCELLED: 0
                },
                byVendor: {},
                byLOA: {},
                itemStats: {
                    totalItems: 0,
                    totalQuantity: 0,
                    byCategory: {}
                },
                overdueCount: 0,
                timelineStats: {
                    upcoming: 0,
                    overdue: 0,
                    completed: 0
                }
            };
        }

        // Calculate statistics
        const today = new Date();
        
        const statistics = {
            total: purchaseOrders.length,
            totalValue: purchaseOrders.reduce(
                (sum, po) => sum + Number(po.value), 
                0
            ),
            byStatus: {
                DRAFT: 0,
                ISSUED: 0,
                IN_PROGRESS: 0,
                COMPLETED: 0,
                CANCELLED: 0
            },
            byVendor: {} as Record<string, {
                count: number,
                value: number,
                vendorName: string
            }>,
            byLOA: {} as Record<string, {
                count: number,
                value: number,
                loaNo: string
            }>,
            itemStats: {
                totalItems: 0,
                totalQuantity: 0,
                byCategory: {} as Record<string, number>
            },
            overdueCount: purchaseOrders.filter(po => {
                const status = po.status;
                return status !== 'COMPLETED' && 
                       status !== 'CANCELLED' && 
                       new Date(po.deliveryDate) < today;
            }).length,
            timelineStats: {
                upcoming: 0,
                overdue: 0,
                completed: 0
            }
        };

        // Process each PO for detailed statistics
        purchaseOrders.forEach(po => {
            // Status count
            statistics.byStatus[po.status as keyof typeof statistics.byStatus]++;

            // Vendor statistics
            if (!statistics.byVendor[po.vendorId]) {
                statistics.byVendor[po.vendorId] = {
                    count: 0,
                    value: 0,
                    vendorName: po.vendor.name
                };
            }
            statistics.byVendor[po.vendorId].count++;
            statistics.byVendor[po.vendorId].value += Number(po.value);

            // LOA statistics
            if (!statistics.byLOA[po.loaId]) {
                statistics.byLOA[po.loaId] = {
                    count: 0,
                    value: 0,
                    loaNo: po.loa.loaNo
                };
            }
            statistics.byLOA[po.loaId].count++;
            statistics.byLOA[po.loaId].value += Number(po.value);

            // Item statistics
            po.items.forEach(item => {
                statistics.itemStats.totalItems++;
                statistics.itemStats.totalQuantity += item.quantity;
                
                if (item.item?.category) {
                    const category = item.item.category;
                    statistics.itemStats.byCategory[category] = 
                        (statistics.itemStats.byCategory[category] || 0) + item.quantity;
                }
            });

            // Timeline statistics
            if (po.status === 'COMPLETED') {
                statistics.timelineStats.completed++;
            } else if (new Date(po.deliveryDate) < today) {
                statistics.timelineStats.overdue++;
            } else {
                statistics.timelineStats.upcoming++;
            }
        });

        console.log('Calculated statistics:', statistics); // Debug log
        return statistics;
    } catch (error) {
        console.error('Error getting PO statistics:', error);
        throw error;
    }
}


}