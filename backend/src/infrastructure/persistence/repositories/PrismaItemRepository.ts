import { PrismaClient, Prisma } from '@prisma/client';
import { CreateItemDto, UpdateItemDto } from '../../../application/dtos/item/CreateItemDto';
import { Item, TaxRates } from '../../../domain/entities/Item';

export class PrismaItemRepository {
    constructor(private prisma: PrismaClient) {}

    private transformToCreateInput(data: CreateItemDto): Prisma.ItemCreateInput {
        return {
            name: data.name,
            description: data.description,
            unitPrice: data.unitPrice,
            uom: data.uom,
            hsnCode: data.hsnCode,
            taxRates: data.taxRates as Prisma.InputJsonValue
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
        if (data.taxRates !== undefined) {
            updateData.taxRates = data.taxRates as Prisma.InputJsonValue;
        }

        return updateData;
    }

    private transformToEntity(prismaItem: any): Item {
        return {
            ...prismaItem,
            taxRates: prismaItem.taxRates as Item['taxRates']
        };
    }

    async create(data: CreateItemDto): Promise<Item> {
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
}