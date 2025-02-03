// application/services/VendorItemService.ts
import { PrismaVendorItemRepository } from '../../infrastructure/persistence/repositories/PrismaVendorItemRepository';
import { Result, ResultUtils } from '../../shared/types/common.types';
import { AppError } from '../../shared/errors/AppError';
import { VendorItem } from '../../domain/entities/VendorItem';

interface AssignItemDto {
  vendorId: string;
  itemId: string;
  unitPrice: number;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

export class VendorItemService {
  constructor(private repository: PrismaVendorItemRepository) {}

  async assignItemToVendor(dto: AssignItemDto): Promise<Result<VendorItem>> {
    try {
      // Check if association already exists
      const existingAssociation = await this.repository.findByVendorAndItem(
        dto.vendorId,
        dto.itemId
      );

      if (existingAssociation) {
        return ResultUtils.fail('This item is already assigned to this vendor');
      }

      // Create new association
      const vendorItem = await this.repository.create({
        vendorId: dto.vendorId,
        itemId: dto.itemId,
        unitPrice: dto.unitPrice
      });

      return ResultUtils.ok(vendorItem);
    } catch (error) {
      console.error('Error in assignItemToVendor:', error);
      throw new AppError('Failed to assign item to vendor');
    }
  }

  async getVendorItems(
    vendorId: string,
    params: PaginationParams
  ): Promise<Result<{ items: VendorItem[]; total: number }>> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 10;
      const skip = (page - 1) * limit;

      const items = await this.repository.findByVendor(vendorId);
      const total = items.length;
      const paginatedItems = items.slice(skip, skip + limit);

      return ResultUtils.ok({
        items: paginatedItems,
        total,
        pages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error('Error in getVendorItems:', error);
      throw new AppError('Failed to fetch vendor items');
    }
  }

  async getItemVendors(
    itemId: string
  ): Promise<Result<{ vendors: VendorItem[]; total: number }>> {
    try {
      const vendors = await this.repository.findByItem(itemId);
      const total = vendors.length;

      return ResultUtils.ok({
        vendors,
        total
      });
    } catch (error) {
      console.error('Error in getItemVendors:', error);
      throw new AppError('Failed to fetch item vendors');
    }
  }

  async updateVendorItemPrice(
    vendorId: string,
    itemId: string,
    newPrice: number
  ): Promise<Result<VendorItem>> {
    try {
      // Check if association exists
      const existingAssociation = await this.repository.findByVendorAndItem(
        vendorId,
        itemId
      );

      if (!existingAssociation) {
        return ResultUtils.fail('Vendor-Item association not found');
      }

      // Validate new price
      if (newPrice <= 0) {
        return ResultUtils.fail('Price must be a positive number');
      }

      // Update price
      const updatedVendorItem = await this.repository.update(
        vendorId,
        itemId,
        { unitPrice: newPrice }
      );

      return ResultUtils.ok(updatedVendorItem);
    } catch (error) {
      console.error('Error in updateVendorItemPrice:', error);
      throw new AppError('Failed to update vendor item price');
    }
  }

  async removeItemFromVendor(
    vendorId: string,
    itemId: string
  ): Promise<Result<void>> {
    try {
      // Check if association exists
      const existingAssociation = await this.repository.findByVendorAndItem(
        vendorId,
        itemId
      );

      if (!existingAssociation) {
        return ResultUtils.fail('Vendor-Item association not found');
      }

      // Remove association
      await this.repository.delete(vendorId, itemId);

      return ResultUtils.ok(undefined);
    } catch (error) {
      console.error('Error in removeItemFromVendor:', error);
      throw new AppError('Failed to remove item from vendor');
    }
  }

  async checkVendorItemExists(
    vendorId: string,
    itemId: string
  ): Promise<Result<boolean>> {
    try {
      const association = await this.repository.findByVendorAndItem(
        vendorId,
        itemId
      );

      return ResultUtils.ok(!!association);
    } catch (error) {
      console.error('Error in checkVendorItemExists:', error);
      throw new AppError('Failed to check vendor-item association');
    }
  }

  async getVendorItemPrice(
    vendorId: string,
    itemId: string
  ): Promise<Result<number>> {
    try {
      const association = await this.repository.findByVendorAndItem(
        vendorId,
        itemId
      );

      if (!association) {
        return ResultUtils.fail('Vendor-Item association not found');
      }

      return ResultUtils.ok(association.unitPrice);
    } catch (error) {
      console.error('Error in getVendorItemPrice:', error);
      throw new AppError('Failed to get vendor item price');
    }
  }

  async compareVendorPrices(
    itemId: string
  ): Promise<Result<Array<{ vendorId: string; vendorName: string; unitPrice: number }>>> {
    try {
      const vendors = await this.repository.findByItem(itemId);
      
      const priceComparison = vendors.map(v => ({
        vendorId: v.vendorId,
        vendorName: v.vendor.name,
        unitPrice: v.unitPrice
      }));

      // Sort by price ascending
      priceComparison.sort((a, b) => a.unitPrice - b.unitPrice);

      return ResultUtils.ok(priceComparison);
    } catch (error) {
      console.error('Error in compareVendorPrices:', error);
      throw new AppError('Failed to compare vendor prices');
    }
  }
}