// src/models/MasterDataModel.ts
import prisma from '../config/database';
import { ItemCreateInput, VendorCreateInput, VendorStatus, VendorCategory } from '../types/master.types';

export class MasterDataModel {
    // Item Master Methods
    static async createItem(data: ItemCreateInput) {
        return prisma.itemMaster.create({
            data: {
                itemCode: data.itemCode,
                description: data.description,
                category: data.category,
                unit: data.unit,
                isActive: true,
                specifications: {
                    create: data.specifications.map(spec => ({
                        key: spec.key,
                        value: spec.value,
                        mandatory: spec.mandatory || false
                    }))
                }
            },
            include: {
                specifications: true
            }
        });
    }

    static async updateItem(id: string, data: Partial<ItemCreateInput>) {
        return prisma.itemMaster.update({
            where: { id },
            data: {
                ...(data.description && { description: data.description }),
                ...(data.category && { category: data.category }),
                ...(data.unit && { unit: data.unit }),
                ...(data.specifications && {
                    specifications: {
                        deleteMany: {},
                        create: data.specifications.map(spec => ({
                            key: spec.key,
                            value: spec.value,
                            mandatory: spec.mandatory || false
                        }))
                    }
                })
            },
            include: {
                specifications: true
            }
        });
    }

    static async getItems(criteria: {
        category?: string;
        isActive?: boolean;
        searchTerm?: string;
    }) {
        return prisma.itemMaster.findMany({
            where: {
                ...criteria,
                OR: criteria.searchTerm ? [
                    { itemCode: { contains: criteria.searchTerm } },
                    { description: { contains: criteria.searchTerm } }
                ] : undefined
            },
            include: {
                specifications: true
            }
        });
    }

    static async getItemById(id: string) {
        return prisma.itemMaster.findUnique({
            where: { id },
            include: {
                specifications: true
            }
        });
    }

    // Vendor Master Methods
    static async createVendor(data: VendorCreateInput) {
        return prisma.vendor.create({
            data: {
                ...data,
                status: VendorStatus.ACTIVE
            }
        });
    }

    static async updateVendor(id: string, data: Partial<VendorCreateInput>) {
        return prisma.vendor.update({
            where: { id },
            data
        });
    }

    static async getVendors(criteria: {
        category?: VendorCategory;
        status?: VendorStatus;
        isActive?: boolean;
        searchTerm?: string;
    }) {
        return prisma.vendor.findMany({
            where: {
                ...criteria,
                OR: criteria.searchTerm ? [
                    { name: { contains: criteria.searchTerm } },
                    { email: { contains: criteria.searchTerm } }
                ] : undefined
            }
        });
    }

    static async getVendorById(id: string) {
        return prisma.vendor.findUnique({
            where: { id }
        });
    }

    static async updateVendorStatus(id: string, status: VendorStatus, remarks?: string) {
        return prisma.vendor.update({
            where: { id },
            data: {
                status
            }
        });
    }

    static async validateSpecifications(itemId: string, specifications: any[]) {
        const item = await prisma.itemMaster.findUnique({
            where: { id: itemId },
            include: {
                specifications: {
                    where: { mandatory: true }
                }
            }
        });

        if (!item) throw new Error('Item not found');

        const mandatorySpecs = item.specifications.map(spec => spec.key);
        const providedSpecs = specifications.map(spec => spec.key);
        
        const missingSpecs = mandatorySpecs.filter(spec => !providedSpecs.includes(spec));
        
        if (missingSpecs.length > 0) {
            throw new Error(`Missing mandatory specifications: ${missingSpecs.join(', ')}`);
        }

        return true;
    }
}