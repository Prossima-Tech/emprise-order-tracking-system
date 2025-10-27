import { PrismaClient } from '@prisma/client';

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

export class PrismaShippingAddressRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateShippingAddressDto) {
    return await this.prisma.shippingAddress.create({
      data: {
        label: data.label,
        address: data.address,
        isDefault: data.isDefault ?? false,
      },
    });
  }

  async update(id: string, data: UpdateShippingAddressDto) {
    return await this.prisma.shippingAddress.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await this.prisma.shippingAddress.delete({
      where: { id },
    });
  }

  async findById(id: string) {
    return await this.prisma.shippingAddress.findUnique({
      where: { id },
    });
  }

  async findAll() {
    return await this.prisma.shippingAddress.findMany({
      orderBy: [
        { isDefault: 'desc' }, // Default addresses first
        { createdAt: 'desc' },  // Then by creation date
      ],
    });
  }

  async unsetAllDefaults() {
    return await this.prisma.shippingAddress.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });
  }
}
