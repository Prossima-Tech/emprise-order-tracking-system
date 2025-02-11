// application/services/SiteService.ts
import { PrismaSiteRepository } from '../../infrastructure/persistence/repositories/PrismaSiteRepository';
import { CreateSiteDto, UpdateSiteDto } from '../dtos/site/SiteDto';
import { Result, ResultUtils } from '../../shared/types/common.types';
import { SiteValidator } from '../validators/site.validator';
import { AppError } from '../../shared/errors/AppError';
import { Site } from '../../domain/entities/Site';
import { POStatus } from '@prisma/client';

export class SiteService {
  private validator: SiteValidator;

  constructor(private repository: PrismaSiteRepository) {
    this.validator = new SiteValidator();
  }

  async createSite(dto: CreateSiteDto): Promise<Result<Site>> {
    try {
      // Validate input
      const validationResult = this.validator.validate(dto);
      if (!validationResult.isSuccess || (validationResult.data && validationResult.data.length > 0)) {
        return ResultUtils.fail('Validation failed', validationResult.data);
      }

      // Generate site code if not provided
      if (!dto.code) {
        dto.code = await this.generateSiteCode(dto.zoneId);
      }

      const site = await this.repository.create(dto);
      return ResultUtils.ok(site);
    } catch (error) {
      console.error('Site Creation Error:', error);
      throw new AppError('Failed to create site');
    }
  }

  async updateSite(id: string, dto: UpdateSiteDto): Promise<Result<Site>> {
    try {
      const site = await this.repository.findById(id);
      if (!site) {
        return ResultUtils.fail('Site not found');
      }

      const validationResult = this.validator.validateUpdate(dto);
      if (!validationResult.isSuccess || (validationResult.data && validationResult.data.length > 0)) {
        return ResultUtils.fail('Validation failed', validationResult.data);
      }

      const updatedSite = await this.repository.update(id, dto);
      return ResultUtils.ok(updatedSite);
    } catch (error) {
      console.error('Site Update Error:', error);
      throw new AppError('Failed to update site');
    }
  }

  async deleteSite(id: string): Promise<Result<void>> {
    try {
      const site = await this.repository.findById(id);
      if (!site) {
        return ResultUtils.fail('Site not found');
      }

      await this.repository.delete(id);
      return ResultUtils.ok(undefined);
    } catch (error) {
      console.error('Site Deletion Error:', error);
      throw new AppError('Failed to delete site');
    }
  }

  async getSite(id: string): Promise<Result<Site>> {
    try {
      const site = await this.repository.findById(id);
      if (!site) {
        return ResultUtils.fail('Site not found');
      }

      return ResultUtils.ok(site);
    } catch (error) {
      console.error('Site Fetch Error:', error);
      throw new AppError('Failed to fetch site');
    }
  }

  async getAllSites(params: {
    status?: string;
    zoneId?: string;
    searchTerm?: string;
  }): Promise<Result<{ sites: Site[]; total: number }>> {
    try {
      const [sites, total] = await Promise.all([
        this.repository.findAll(params),
        this.repository.count(params)
      ]);

      return ResultUtils.ok({
        sites: sites.sites,
        total
      });
    } catch (error) {
      console.error('Sites Fetch Error:', error);
      throw new AppError('Failed to fetch sites');
    }
  }

  private async generateSiteCode(zoneId: string): Promise<string> {
    const latestSite = await this.repository.findLatestSiteCode(zoneId);
    
    if (!latestSite) {
      return `${zoneId}/SITE/001`;
    }

    const [zone, , number] = latestSite.split('/');
    if (zone === zoneId) {
      const nextNumber = (parseInt(number) + 1).toString().padStart(3, '0');
      return `${zoneId}/SITE/${nextNumber}`;
    }

    return `${zoneId}/SITE/001`;
  }

  async getSiteDetails(id: string): Promise<Result<any>> {
    try {
      const site = await this.repository.findById(id);
      if (!site) {
        return ResultUtils.fail('Site not found');
      }

      const stats = await this.repository.getSiteStats(id);

      return ResultUtils.ok({
        ...site,
        stats
      });
    } catch (error) {
      console.error('Site Details Error:', error);
      throw new AppError('Failed to fetch site details');
    }
  }


  async getSiteLoas(id: string, params: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Result<any[]>> {
    try {
      const loas = await this.repository.getLoasForSite(id, params);
      return ResultUtils.ok(loas);
    } catch (error) {
      console.error('Site LOAs Error:', error);
      throw new AppError('Failed to fetch site LOAs');
    }
  }

  async getSitePurchaseOrders(id: string, params: {
    status?: POStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Result<any[]>> {
    try {
      const pos = await this.repository.getPurchaseOrdersForSite(id, params);
      return ResultUtils.ok(pos);
    } catch (error) {
      console.error('Site POs Error:', error);
      throw new AppError('Failed to fetch site purchase orders');
    }
  }

}