// application/services/CustomerService.ts
import { PrismaClient } from '@prisma/client';
import { Result, ResultUtils } from '../../shared/types/common.types';
import { AppError } from '../../shared/errors/AppError';

export type Customer = {
  id: string;
  name: string;
  headquarters: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateCustomerDto = {
  id: string;
  name: string;
  headquarters: string;
};

export class CustomerService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getAllCustomers(): Promise<Result<Customer[]>> {
    try {
      const customers = await this.prisma.customer.findMany({
        orderBy: { name: 'asc' }
      });
      
      return ResultUtils.ok(customers);
    } catch (error) {
      console.error('Getting Customers Error:', error);
      throw new AppError('Failed to get customers');
    }
  }

  async getCustomerById(id: string): Promise<Result<Customer | null>> {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { id }
      });
      
      if (!customer) {
        return ResultUtils.fail('Customer not found');
      }
      
      return ResultUtils.ok(customer);
    } catch (error) {
      console.error('Getting Customer Error:', error);
      throw new AppError('Failed to get customer');
    }
  }

  async addCustomer(dto: CreateCustomerDto): Promise<Result<Customer>> {
    try {
      // Check if customer already exists
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { id: dto.id }
      });
      
      if (existingCustomer) {
        return ResultUtils.fail('Customer with this ID already exists');
      }
      
      const newCustomer = await this.prisma.customer.create({
        data: {
          id: dto.id,
          name: dto.name,
          headquarters: dto.headquarters
        }
      });
      
      return ResultUtils.ok(newCustomer);
    } catch (error) {
      console.error('Adding Customer Error:', error);
      throw new AppError('Failed to add customer');
    }
  }

  async updateCustomer(id: string, dto: Partial<CreateCustomerDto>): Promise<Result<Customer>> {
    try {
      // Check if customer exists
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { id }
      });
      
      if (!existingCustomer) {
        return ResultUtils.fail('Customer not found');
      }
      
      // Update customer
      const updatedCustomer = await this.prisma.customer.update({
        where: { id },
        data: {
          name: dto.name !== undefined ? dto.name : undefined,
          headquarters: dto.headquarters !== undefined ? dto.headquarters : undefined
        }
      });
      
      return ResultUtils.ok(updatedCustomer);
    } catch (error) {
      console.error('Updating Customer Error:', error);
      throw new AppError('Failed to update customer');
    }
  }

  async deleteCustomer(id: string): Promise<Result<void>> {
    try {
      // Check if customer exists
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { id }
      });
      
      if (!existingCustomer) {
        return ResultUtils.fail('Customer not found');
      }
      
      // Check if the customer is referenced by sites
      const sitesWithCustomer = await this.prisma.site.count({
        where: { zoneId: id }
      });
      
      if (sitesWithCustomer > 0) {
        return ResultUtils.fail('Cannot delete customer that is used by sites');
      }
      
      // Delete customer
      await this.prisma.customer.delete({
        where: { id }
      });
      
      return ResultUtils.ok(undefined);
    } catch (error) {
      console.error('Deleting Customer Error:', error);
      throw new AppError('Failed to delete customer');
    }
  }
} 