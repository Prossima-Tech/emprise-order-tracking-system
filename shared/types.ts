// src/types/index.ts

// User & Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  departmentId: string;
  department?: Department;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  VENDOR = 'VENDOR'
}

export interface Department {
  id: string;
  deptCode: string;
  deptName: string;
  parentDeptId?: string;
  parentDept?: Department;
  childDepts?: Department[];
  users?: User[];
  isActive: boolean;
}

// Master Data Types
export interface ItemMaster {
  id: string;
  itemCode: string;
  description: string;
  category: ItemCategory;
  unit: UnitOfMeasurement;
  specifications: ItemSpecification[];
  isActive: boolean;
  purchaseItems?: PurchaseOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemSpecification {
  id: string;
  itemId: string;
  key: string;
  value: string;
  mandatory: boolean;
  item?: ItemMaster;
}

export enum ItemCategory {
  ELECTRONICS = 'ELECTRONICS',
  MECHANICAL = 'MECHANICAL',
  ELECTRICAL = 'ELECTRICAL',
  CIVIL = 'CIVIL',
  IT_EQUIPMENT = 'IT_EQUIPMENT',
  OFFICE_SUPPLIES = 'OFFICE_SUPPLIES',
  OTHERS = 'OTHERS'
}

export enum UnitOfMeasurement {
  PIECES = 'PCS',
  KILOGRAMS = 'KG',
  METERS = 'MTR',
  LITERS = 'LTR',
  SQUARE_METERS = 'SQM',
  CUBIC_METERS = 'CBM',
  SETS = 'SET',
  BOXES = 'BOX'
}

// Budgetary Offer Types
export interface BudgetaryOffer {
  id: string;
  tenderNo: string;
  amount: number;
  emdAmount: number;
  dueDate: Date;
  status: BudgetaryOfferStatus;
  createdById: string;
  createdBy?: User;
  emdTrackings?: EMDTracking[];
  loas?: LOA[];
  createdAt: Date;
  updatedAt: Date;
}

export enum BudgetaryOfferStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

// EMD Tracking Types
export interface EMDTracking {
  id: string;
  offerId: string;
  offer?: BudgetaryOffer;
  amount: number;
  dueDate: Date;
  returnDate?: Date;
  status: EMDStatus;
  documentPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum EMDStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  RETURNED = 'RETURNED',
  FORFEITED = 'FORFEITED'
}

// LOA Types
export interface LOA {
  id: string;
  loaNo: string;
  offerId: string;
  offer?: BudgetaryOffer;
  value: number;
  scope: string;
  status: LOAStatus;
  managedById: string;
  managedBy?: User;
  amendments?: LOAAmendment[];
  purchaseOrders?: PurchaseOrder[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LOAAmendment {
  id: string;
  loaId: string;
  loa?: LOA;
  amendmentNo: number;
  additionalValue: number;
  reason: string;
  effectiveDate: Date;
  createdAt: Date;
}

export enum LOAStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  ACCEPTED = 'ACCEPTED',
  AMENDED = 'AMENDED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Vendor Types
export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: VendorStatus;
  purchaseOrders?: PurchaseOrder[];
  invoices?: Invoice[];
  createdAt: Date;
  updatedAt: Date;
}

export enum VendorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLACKLISTED = 'BLACKLISTED'
}

// Purchase Order Types
export interface PurchaseOrder {
  id: string;
  poNumber: string;
  loaId: string;
  loa?: LOA;
  vendorId: string;
  vendor?: Vendor;
  value: number;
  deliveryDate: Date;
  status: POStatus;
  invoices?: Invoice[];
  createdAt: Date;
  updatedAt: Date;
  items: any[];
}

export interface PurchaseOrderItem {
  id: string;
  poId: string;
  po?: PurchaseOrder;
  itemId: string;
  item?: ItemMaster;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications: Record<string, string>;
  status: POItemStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum POStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum POItemStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

// Invoice Types
export interface Invoice {
  id: string;
  invoiceNo: string;
  poId: string;
  po?: PurchaseOrder;
  vendorId: string;
  vendor?: Vendor;
  amount: number;
  status: InvoiceStatus;
  dueDate: Date;
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum InvoiceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  REJECTED = 'REJECTED'
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Search and Filter Types
export interface SearchParams {
  keyword?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}