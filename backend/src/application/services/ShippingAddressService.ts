import { PrismaShippingAddressRepository } from '../../infrastructure/persistence/repositories/PrismaShippingAddressRepository';
import { Result, ResultUtils } from '../../shared/types/common.types';
import { AppError } from '../../shared/errors/AppError';

interface CreateShippingAddressDto {
  label: string;
  address: string;
  isDefault?: boolean;
}

interface UpdateShippingAddressDto {
  label?: string;
  address?: string;
  isDefault?: boolean;
}

export class ShippingAddressService {
  constructor(private repository: PrismaShippingAddressRepository) {}

  async createShippingAddress(dto: CreateShippingAddressDto): Promise<Result<any>> {
    try {
      // If this address is being set as default, unset all other defaults
      if (dto.isDefault) {
        await this.repository.unsetAllDefaults();
      }

      const address = await this.repository.create(dto);
      return ResultUtils.ok(address);
    } catch (error) {
      throw new AppError('Failed to create shipping address');
    }
  }

  async updateShippingAddress(id: string, dto: UpdateShippingAddressDto): Promise<Result<any>> {
    try {
      const existingAddress = await this.repository.findById(id);
      if (!existingAddress) {
        return ResultUtils.fail('Shipping address not found');
      }

      // If this address is being set as default, unset all other defaults
      if (dto.isDefault) {
        await this.repository.unsetAllDefaults();
      }

      const address = await this.repository.update(id, dto);
      return ResultUtils.ok(address);
    } catch (error) {
      throw new AppError('Failed to update shipping address');
    }
  }

  async deleteShippingAddress(id: string): Promise<Result<void>> {
    try {
      const address = await this.repository.findById(id);
      if (!address) {
        return ResultUtils.fail('Shipping address not found');
      }

      await this.repository.delete(id);
      return ResultUtils.ok(undefined);
    } catch (error) {
      throw new AppError('Failed to delete shipping address');
    }
  }

  async getShippingAddress(id: string): Promise<Result<any>> {
    try {
      const address = await this.repository.findById(id);
      if (!address) {
        return ResultUtils.fail('Shipping address not found');
      }

      return ResultUtils.ok(address);
    } catch (error) {
      throw new AppError('Failed to fetch shipping address');
    }
  }

  async getAllShippingAddresses(): Promise<Result<any[]>> {
    try {
      const addresses = await this.repository.findAll();
      return ResultUtils.ok(addresses);
    } catch (error) {
      throw new AppError('Failed to fetch shipping addresses');
    }
  }
}
