// src/types/master.types.ts

export interface ItemSpecification {
    id?: string;
    itemId?: string;
    key: string;
    value: string;
    mandatory: boolean;
}

export interface ItemMaster {
    id: string;
    itemCode: string;
    description: string;
    category: string;
    unit: string;
    isActive: boolean;
    specifications: ItemSpecification[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Vendor {
    id: string;
    vendorCode: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    gstin?: string;
    pan?: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    category: VendorCategory[];
    status: VendorStatus;
    remarks?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export enum VendorCategory {
    SUPPLIES = 'SUPPLIES',
    SERVICES = 'SERVICES',
    WORKS = 'WORKS',
    CONSULTING = 'CONSULTING'
}

export enum VendorStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    BLACKLISTED = 'BLACKLISTED'
}

export interface ItemCreateInput {
    itemCode: string;
    description: string;
    category: string;
    unit: string;
    specifications: ItemSpecification[];
}

export interface VendorCreateInput {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    gstin?: string;
    pan?: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    category: string[]; // Changed from VendorCategory[] to string[]
}
