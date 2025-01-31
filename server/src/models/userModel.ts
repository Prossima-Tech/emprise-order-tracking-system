// src/models/userModel.ts

import prisma from '../config/database';
import { UserRole } from '../types';

export class UserModel {
  /**
   * Find users who can be approvers
   */
  static async findApprovers() {
    return prisma.user.findMany({
      where: {
        role: {
          in: [UserRole.ADMIN, UserRole.MANAGER]
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  /**
   * Find all users with filters
   */
  static async findAll(
    filters: {
      role?: UserRole;
      search?: string;
    },
    pagination: {
      page: number;
      limit: number;
    }
  ) {
    const where: any = { isActive: true };

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          department: true,
          createdAt: true
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: {
          name: 'asc'
        }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    };
  }
}