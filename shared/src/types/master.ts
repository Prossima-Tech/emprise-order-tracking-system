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
    specifications: ItemSpecification[];
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
  
  export interface Vendor {
    id: string;
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
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

  ts
export interface DashboardStats {
  totalItems: number;
  totalVendors: number;
  activeItems: number;
  activeVendors: number;
  itemVendorMatches: number;
  itemPOMatches: number;
  vendorPOMatches: number;
}

export interface MatchingData {
  id: string;
  itemCode?: string;
  itemDescription?: string;
  vendorName?: string;
  poNumber?: string;
  matchType: 'item-vendor' | 'item-po' | 'vendor-po';
  matchDate: string;
}

export interface TrendDataPoint {
  date: string;
  value: number;
  type: 'item-vendor' | 'item-po' | 'vendor-po';
}