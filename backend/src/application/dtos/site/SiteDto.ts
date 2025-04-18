// application/dtos/site/SiteDto.ts
import { SiteStatus } from '../../../domain/entities/constants';
import { LOA } from '../../../domain/entities/LOA';
import { PurchaseOrder } from '../../../domain/entities/PurchaseOrder';

export interface CreateSiteDto {
  name: string;
  code?: string;
  location: string;
  zoneId: string;
  address: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  tags?: string[];
}

export interface UpdateSiteDto {
  name?: string;
  location?: string;
  zoneId?: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  status?: SiteStatus;
  tags?: string[];
}

export interface SiteResponseDto {
  id: string;
  name: string;
  code: string;
  location: string;
  zoneId: string;
  zoneName: string;
  address: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  status: SiteStatus;
  loas: LOA[];
  purchaseOrders: PurchaseOrder[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}