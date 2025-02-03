import { PrismaClient, Prisma } from '@prisma/client';
import { CreateItemDto, UpdateItemDto } from '../../../application/dtos/item/CreateItemDto';
import { Item } from '../../../domain/entities/Item';

interface PriceHistoryEntry {
  purchaseDate: Date;
  poNumber: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: string;
}

interface PriceHistoryData {
  currentPrice: number;
  priceHistory: PriceHistoryEntry[];
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
}

export class PrismaItemRepository {
    constructor(private prisma: PrismaClient) {}

    private transformToCreateInput(data: CreateItemDto): Prisma.ItemCreateInput {
        return {
            name: data.name,
            description: data.description,
            unitPrice: data.unitPrice,
            uom: data.uom,
            hsnCode: data.hsnCode,
            // taxRates: data.taxRates as Prisma.InputJsonValue
        };
    }

    private transformToUpdateInput(data: UpdateItemDto): Prisma.ItemUpdateInput {
        const updateData: Prisma.ItemUpdateInput = {};
        
        if (data.name !== undefined) {
            updateData.name = data.name;
        }
        if (data.description !== undefined) {
            updateData.description = data.description;
        }
        if (data.unitPrice !== undefined) {
            updateData.unitPrice = data.unitPrice;
        }
        if (data.uom !== undefined) {
            updateData.uom = data.uom;
        }
        if (data.hsnCode !== undefined) {
            updateData.hsnCode = data.hsnCode;
        }
        // if (data.taxRates !== undefined) {
        //     updateData.taxRates = data.taxRates as Prisma.InputJsonValue;
        // }

        return updateData;
    }

    private transformToEntity(prismaItem: any): Item {
        return {
            ...prismaItem,
            // taxRates: prismaItem.taxRates as Item['taxRates']
        };
    }

    async create(data: CreateItemDto): Promise<Item> {
        try {
            console.log(data);
            const prismaItem = await this.prisma.item.create({
                data: this.transformToCreateInput(data),
                include: {
                    vendors: {
                        include: {
                            vendor: true
                        }
                    }
                }
            });
            return this.transformToEntity(prismaItem);
        } catch (error) {
            console.error('Failed to create item:', error);
            throw error;
        }
    }

    async update(id: string, data: UpdateItemDto): Promise<Item> {
        const prismaItem = await this.prisma.item.update({
            where: { id },
            data: this.transformToUpdateInput(data),
            include: {
                vendors: {
                    include: {
                        vendor: true
                    }
                }
            }
        });
        return this.transformToEntity(prismaItem);
    }

    async delete(id: string): Promise<Item> {
        const prismaItem = await this.prisma.item.delete({
            where: { id },
            include: {
                vendors: {
                    include: {
                        vendor: true
                    }
                }
            }
        });
        return this.transformToEntity(prismaItem);
    }

    async findById(id: string): Promise<Item | null> {
        const prismaItem = await this.prisma.item.findUnique({
            where: { id },
            include: {
                vendors: {
                    include: {
                        vendor: true
                    }
                }
            }
        });
        return prismaItem ? this.transformToEntity(prismaItem) : null;
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        searchTerm?: string;
    }): Promise<Item[]> {
        const prismaItems = await this.prisma.item.findMany({
            skip: params.skip,
            take: params.take,
            where: params.searchTerm ? {
                OR: [
                    { name: { contains: params.searchTerm, mode: 'insensitive' } },
                    { description: { contains: params.searchTerm, mode: 'insensitive' } },
                    { hsnCode: { contains: params.searchTerm, mode: 'insensitive' } }
                ]
            } : undefined,
            include: {
                vendors: {
                    include: {
                        vendor: true
                    }
                }
            }
        });
        return prismaItems.map(item => this.transformToEntity(item));
    }

    async count(params: { searchTerm?: string }): Promise<number> {
        return this.prisma.item.count({
            where: params.searchTerm ? {
                OR: [
                    { name: { contains: params.searchTerm, mode: 'insensitive' } },
                    { description: { contains: params.searchTerm, mode: 'insensitive' } },
                    { hsnCode: { contains: params.searchTerm, mode: 'insensitive' } }
                ]
            } : undefined
        });
    }

    async getPriceHistory(itemId: string, vendorId: string): Promise<PriceHistoryData> {
        try {
            // Get current price from VendorItem
            const currentVendorPrice = await this.prisma.vendorItem.findUnique({
                where: {
                    vendorId_itemId: {
                        vendorId,
                        itemId,
                    },
                },
                select: {
                    unitPrice: true,
                },
            });

            // Get purchase history
            const purchaseHistory = await this.prisma.purchaseOrderItem.findMany({
                where: {
                    itemId,
                    purchaseOrder: {
                        vendorId,
                        status: {
                            not: 'DRAFT',
                        },
                    },
                },
                select: {
                    quantity: true,
                    unitPrice: true,
                    totalAmount: true,
                    purchaseOrder: {
                        select: {
                            poNumber: true,
                            status: true,
                            createdAt: true,
                        },
                    },
                },
                orderBy: {
                    purchaseOrder: {
                        createdAt: 'desc',
                    },
                },
                take: 10, // Last 10 purchases
            });

            const priceHistory = purchaseHistory.map(record => ({
                purchaseDate: record.purchaseOrder.createdAt,
                poNumber: record.purchaseOrder.poNumber,
                quantity: record.quantity,
                unitPrice: record.unitPrice || 0,
                totalAmount: record.totalAmount || 0,
                status: record.purchaseOrder.status,
            }));

            // Calculate statistics from valid prices (excluding null/undefined)
            const validPrices = priceHistory
                .map(record => record.unitPrice)
                .filter(price => price !== null && price !== undefined);

            const averagePrice = validPrices.length > 0
                ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length
                : 0;

            const lowestPrice = validPrices.length > 0
                ? Math.min(...validPrices)
                : 0;

            const highestPrice = validPrices.length > 0
                ? Math.max(...validPrices)
                : 0;

            return {
                currentPrice: currentVendorPrice?.unitPrice || 0,
                priceHistory,
                averagePrice,
                lowestPrice,
                highestPrice,
            };
        } catch (error) {
            console.error('Failed to fetch price history:', error);
            throw error;
        }
    }
}