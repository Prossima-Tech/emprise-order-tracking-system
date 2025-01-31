import { PrismaItemRepository } from '../../infrastructure/persistence/repositories/PrismaItemRepository';
import { CreateItemDto, UpdateItemDto } from '../dtos/item/CreateItemDto';
import { ItemValidator } from '../validators/item.validator';
import { Result, ResultUtils } from '../../shared/types/common.types';
import { AppError } from '../../shared/errors/AppError';

export class ItemService {
  private validator: ItemValidator;

  constructor(private repository: PrismaItemRepository) {
    this.validator = new ItemValidator();
  }

  async createItem(dto: CreateItemDto): Promise<Result<any>> {
    try {
      const validationResult = this.validator.validate(dto);
      if (!validationResult.isSuccess) {
        return ResultUtils.fail('Validation processing failed');
      }

      if (validationResult.data && validationResult.data.length > 0) {
        return ResultUtils.fail('Validation failed', validationResult.data);
      }

      const item = await this.repository.create(dto);
      return ResultUtils.ok(item);
    } catch (error) {
      throw new AppError('Failed to create item');
    }
  }

  async updateItem(id: string, dto: UpdateItemDto): Promise<Result<any>> {
    try {
      const idValidation = this.validator.validateId(id);
      if (!idValidation.isSuccess) {
        return ResultUtils.fail('Invalid ID format');
      }

      const existingItem = await this.repository.findById(id);
      if (!existingItem) {
        return ResultUtils.fail('Item not found');
      }

      const item = await this.repository.update(id, dto);
      return ResultUtils.ok(item);
    } catch (error) {
      throw new AppError('Failed to update item');
    }
  }

  async deleteItem(id: string): Promise<Result<void>> {
    try {
      const item = await this.repository.findById(id);
      if (!item) {
        return ResultUtils.fail('Item not found');
      }

      await this.repository.delete(id);
      return ResultUtils.ok(undefined);
    } catch (error) {
      throw new AppError('Failed to delete item');
    }
  }

  async getItem(id: string): Promise<Result<any>> {
    try {
      const item = await this.repository.findById(id);
      if (!item) {
        return ResultUtils.fail('Item not found');
      }

      return ResultUtils.ok(item);
    } catch (error) {
      throw new AppError('Failed to fetch item');
    }
  }

  async getAllItems(params: {
    page?: number;
    limit?: number;
    searchTerm?: string;
  }): Promise<Result<{ items: any[]; total: number; pages: number }>> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 10;
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        this.repository.findAll({ skip, take: limit, searchTerm: params.searchTerm }),
        this.repository.count({ searchTerm: params.searchTerm })
      ]);

      return ResultUtils.ok({
        items,
        total,
        pages: Math.ceil(total / limit)
      });
    } catch (error) {
      throw new AppError('Failed to fetch items');
    }
  }
}