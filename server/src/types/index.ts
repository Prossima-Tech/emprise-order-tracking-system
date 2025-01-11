// src/types/index.ts
// This file defines all TypeScript interfaces and types used across the application

import { Decimal } from "@prisma/client/runtime/library";

// User related types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  passwordHash: string;
  departmentId: string;
  department: Department;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  VENDOR // EMD Tracking types
  = "VENDOR",
}

export interface Department {
  id: string;
  name: string;
  // Add other department properties
}

export interface BudgetaryOffer {
  id: string;
  fromAuthority: string;
  toAuthority: string;
  subject: string;
  workItems: WorkItem[];
  emdDetails: EMDDetails;
  termsAndConditions: string;
  status: BudgetaryOfferStatus;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
// src/types.ts


export enum BudgetaryOfferStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface WorkItem {
  description: string;
  basicRate: number;
  unit: string;
  taxRate: number;
}

export interface EMDDetails {
  amount: number;
  paymentMode: 'DD' | 'BG' | 'ONLINE' | 'CASH';
  validityPeriod?: number;
  remarks?: string;
}

export interface BudgetaryOfferCreateInput {
  fromAuthority: string;
  toAuthority: string;
  subject: string;
  workItems: WorkItem[];
  emdDetails: EMDDetails;
  termsAndConditions: string;
}

export interface BudgetaryOfferUpdateInput {
  fromAuthority?: string;
  toAuthority?: string;
  subject?: string;
  workItems?: WorkItem[];
  emdDetails?: EMDDetails;
  termsAndConditions?: string;
}

// EMD Tracking types
export interface EMDTracking {
  id: string;
  offerId: string;
  amount: number;
  paymentMode: string;
  dueDate: Date;
  returnDate?: Date;
  status: EMDStatus;
  documentPath?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum EMDStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  RETURNED = 'RETURNED',
  FORFEITED = 'FORFEITED',
}

// Invoice types
export interface Invoice {
  id: string;
  invoiceNo: string;
  poId: string;
  vendorId: string;
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
  REJECTED = 'REJECTED',
}

// API Response types
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

type StatusRecord = Record<EMDStatus, number>;

// Request extension to include user information
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}