import { PrismaClient } from '@prisma/client';
import { PurchaseOrder } from '../../../domain/entities/PurchaseOrder';
import { PurchaseOrderItem } from '../../../domain/entities/PurchaseOrderItem';
import { POStatus } from '../../../domain/entities/constants';


export class PrismaPurchaseOrderRepository {
  constructor(private prisma: PrismaClient) {}

  private toDomainEntity(prismaOrder: any): PurchaseOrder {
    return {
      id: prismaOrder.id,
      poNumber: prismaOrder.poNumber,
      loa: prismaOrder.loa,
      loaId: prismaOrder.loaId,
      vendor: prismaOrder.vendor,
      vendorId: prismaOrder.vendorId,
      items: prismaOrder.items?.map((item: any) => ({
        id: item.id,
        item: item.item,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        // taxRate: item.taxRate,
        totalAmount: item.totalAmount,
        purchaseOrderId: item.purchaseOrderId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      })) || [],
      requirementDesc: prismaOrder.requirementDesc,
      termsConditions: prismaOrder.termsConditions,
      shipToAddress: prismaOrder.shipToAddress,
      baseAmount: prismaOrder.baseAmount,
      taxAmount: prismaOrder.taxAmount,
      totalAmount: prismaOrder.totalAmount,
      notes: prismaOrder.notes,
      documentUrl: prismaOrder.documentUrl,
      documentHash: prismaOrder.documentHash,
      status: prismaOrder.status as POStatus,
      createdBy: prismaOrder.createdBy,
      createdById: prismaOrder.createdById,
      approver: prismaOrder.approver,
      approverId: prismaOrder.approverId,
      approvalComments: prismaOrder.approvalComments,
      rejectionReason: prismaOrder.rejectionReason,
      approvalHistory: prismaOrder.approvalHistory || [],
      tags: prismaOrder.tags || [],
      createdAt: prismaOrder.createdAt,
      updatedAt: prismaOrder.updatedAt
    };
  }

  private toPrismaEntity(domainOrder: Partial<PurchaseOrder>) {
    const { items, loa, vendor, createdBy, createdById, approver, approvalHistory, ...prismaData } = domainOrder;
    
    // Convert approvalHistory to Prisma-compatible format
    if (approvalHistory) {
      return {
        ...prismaData,
        approvalHistory: {
          set: approvalHistory.map(action => ({
            actionType: action.actionType,
            userId: action.userId,
            timestamp: action.timestamp,
            comments: action.comments,
            previousStatus: action.previousStatus,
            newStatus: action.newStatus
          }))
        }
      };
    }
  
    return prismaData;
  }
  
  async create(data: {
    poNumber: string;
    loaId: string;
    vendorId: string;
    items: Array<{
      itemId: string;
      quantity: number;
      unitPrice: number;
      // taxRate: number;
      totalAmount: number;
    }>;
    baseAmount: number;
    taxAmount: number;
    totalAmount: number;
    requirementDesc: string;
    termsConditions: string;
    shipToAddress: string;
    notes?: string;
    documentUrl?: string;
    documentHash?: string;
    status: POStatus;
    createdById: string;
    approverId?: string;
    approvalComments?: string;
    rejectionReason?: string;
    approvalHistory?: any[];
    tags: string[];
  }): Promise<PurchaseOrder> {
    const { items, ...poData } = data;
    const prismaResult = await this.prisma.purchaseOrder.create({
      data: {
        ...poData,
        approvalHistory: poData.approvalHistory || [],
        items: {
          create: items.map(item => ({
            ...item,
            // taxRate: item.taxRates?.igst + item.taxRates?.sgst + item.taxRates?.ugst
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
        },
        createdBy: true,
        approver: true
      }
    });
  
    return this.toDomainEntity(prismaResult);
  }

  async update(id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const { items, ...updateData } = data;

    // First update the PO data
    const updatedPO = await this.prisma.purchaseOrder.update({
      where: { id },
      data: this.toPrismaEntity(updateData),
      include: {
        loa: true,
        vendor: true,
        items: {
          include: {
            item: true
          }
        },
        createdBy: true,
        approver: true
      }
    });

    // If items were provided, update them
    if (items && items.length > 0) {
      await this.updateItems(id, items.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        // taxRates: {
        //   igst: item.taxRates.igst || 0,
        //   sgst: item.taxRates.sgst || 0,
        //   ugst: item.taxRates.ugst || 0
        // }
      })));
    }

    // Fetch the updated PO with all relations
    const finalPO = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        loa: true,
        vendor: true,
        items: {
          include: {
            item: true
          }
        },
        createdBy: true,
        approver: true
      }
    });

    if (!finalPO) {
      throw new Error('Failed to fetch updated purchase order');
    }

    return this.toDomainEntity(finalPO);
  }
  
  async delete(id: string): Promise<PurchaseOrder> {
    const prismaResult = await this.prisma.purchaseOrder.delete({
      where: { id },
      include: {
        loa: true,
        vendor: true,
        items: {
          include: {
            item: true
          }
        },
        createdBy: true,
        approver: true
      }
    });

    return this.toDomainEntity(prismaResult);
  }

  async findById(id: string): Promise<PurchaseOrder | null> {
    const prismaResult = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        loa: true,
        vendor: true,
        items: {
          include: {
            item: true
          }
        },
        createdBy: true,
        approver: true
      }
    });

    return prismaResult ? this.toDomainEntity(prismaResult) : null;
  }

  async findByPoNumber(poNumber: string): Promise<PurchaseOrder | null> {
    const prismaResult = await this.prisma.purchaseOrder.findUnique({
      where: { poNumber },
      include: {
        loa: true,
        vendor: true,
        items: {
          include: {
            item: true
          }
        },
        createdBy: true,
        approver: true
      }
    });

    return prismaResult ? this.toDomainEntity(prismaResult) : null;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    status?: POStatus;
    vendorId?: string;
    loaId?: string;
    createdById?: string;
    approverId?: string;
    searchTerm?: string;
  }): Promise<PurchaseOrder[]> {
    const { skip, take, status, vendorId, loaId, createdById, approverId, searchTerm } = params;

    const prismaResults = await this.prisma.purchaseOrder.findMany({
      skip,
      take,
      where: {
        AND: [
          status ? { status } : {},
          vendorId ? { vendorId } : {},
          loaId ? { loaId } : {},
          createdById ? { createdById } : {},
          approverId ? { approverId } : {},
          searchTerm ? {
            OR: [
              { poNumber: { contains: searchTerm, mode: 'insensitive' } },
              { requirementDesc: { contains: searchTerm, mode: 'insensitive' } },
              { tags: { has: searchTerm } }
            ]
          } : {}
        ]
      },
      include: {
        loa: true,
        vendor: true,
        items: {
          include: {
            item: true
          }
        },
        createdBy: true,
        approver: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return prismaResults.map(result => this.toDomainEntity(result));
  }

  async count(params: {
    status?: POStatus;
    vendorId?: string;
    loaId?: string;
    createdById?: string;
    approverId?: string;
    searchTerm?: string;
  }): Promise<number> {
    const { status, vendorId, loaId, createdById, approverId, searchTerm } = params;

    return this.prisma.purchaseOrder.count({
      where: {
        AND: [
          status ? { status } : {},
          vendorId ? { vendorId } : {},
          loaId ? { loaId } : {},
          createdById ? { createdById } : {},
          approverId ? { approverId } : {},
          searchTerm ? {
            OR: [
              { poNumber: { contains: searchTerm, mode: 'insensitive' } },
              { requirementDesc: { contains: searchTerm, mode: 'insensitive' } },
              { tags: { has: searchTerm } }
            ]
          } : {}
        ]
      }
    });
  }
  async updateItems(
    purchaseOrderId: string,
    items: Array<{
      itemId: string;
      quantity: number;
      unitPrice: number;
      // taxRates: {
      //   igst: number;
      //   sgst: number;
      //   ugst: number;
      // };
    }>
  ): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        // First delete all existing items
        await tx.purchaseOrderItem.deleteMany({
          where: { purchaseOrderId }
        });

        // Then create new items one by one to ensure proper data creation
        for (const item of items) {
          await tx.purchaseOrderItem.create({
            data: {
              purchaseOrderId,
              itemId: item.itemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              // taxRates: item.taxRates,
              // taxRate: (item.taxRates.igst || 0) + (item.taxRates.sgst || 0) + (item.taxRates.ugst || 0),
              totalAmount: this.calculateItemTotal(item)
            }
          });
        }
      });

      // Log successful update
      console.log(`Successfully updated items for PO: ${purchaseOrderId}`, items);
    } catch (error) {
      console.error('Error updating PO items:', error);
      throw error;
    }
  }
  
  private calculateItemTotal(item: {
    quantity: number;
    unitPrice: number;
  }): number {
    const baseAmount = item.quantity * item.unitPrice;
    // return baseAmount + (baseAmount * (totalTaxRate / 100));
    return baseAmount;
  }
  async getItemsForPo(purchaseOrderId: string): Promise<PurchaseOrderItem[]> {
    const prismaItems = await this.prisma.purchaseOrderItem.findMany({
      where: { purchaseOrderId },
      include: {
        item: true,
        purchaseOrder: {
          include: {
            loa: true,
            vendor: true,
            items: {
              include: {
                item: true
              }
            },
            createdBy: true,
            approver: true
          }
        }
      }
    });
  
    return prismaItems.map(prismaItem => ({
      id: prismaItem.id,
      purchaseOrder: this.toDomainEntity(prismaItem.purchaseOrder),
      purchaseOrderId: prismaItem.purchaseOrderId,
      item: {
        id: prismaItem.item.id,
        name: prismaItem.item.name,
        description: prismaItem.item.description || undefined,
        unitPrice: prismaItem.item.unitPrice || 0,
        uom: prismaItem.item.uom,
        hsnCode: prismaItem.item.hsnCode || undefined,
        createdAt: prismaItem.item.createdAt,
        updatedAt: prismaItem.item.updatedAt
      },
      itemId: prismaItem.itemId,
      quantity: prismaItem.quantity || 0,
      unitPrice: prismaItem.unitPrice || 0,
      totalAmount: prismaItem.totalAmount || 0,
      createdAt: prismaItem.createdAt,
      updatedAt: prismaItem.updatedAt
    }));
  }

  async getTotalValue(purchaseOrderId: string): Promise<number> {
    const items = await this.getItemsForPo(purchaseOrderId);
    return items.reduce((sum, item) => sum + item.totalAmount, 0);
  }

  async findLatestPoNumber(): Promise<string | null> {
    const latestPO = await this.prisma.purchaseOrder.findFirst({
      orderBy: {
        poNumber: 'desc'
      },
      select: {
        poNumber: true
      }
    });
    
    return latestPO?.poNumber || null;
  }
}