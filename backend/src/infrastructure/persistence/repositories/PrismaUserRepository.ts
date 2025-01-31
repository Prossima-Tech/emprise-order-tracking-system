import { PrismaClient, Prisma, UserRole as PrismaUserRole } from '@prisma/client';
import { User, UserRole } from '../../../domain/entities/User';
import { CreateUserDto } from '../../../application/dtos/user/CreateUserDto';
import bcrypt from 'bcrypt';

export class PrismaUserRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    private transformToEntity(prismaUser: any): User {
        return {
            id: prismaUser.id,
            email: prismaUser.email,
            password: prismaUser.password,
            name: prismaUser.name,
            role: prismaUser.role as UserRole,
            department: prismaUser.department,
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt
        };
    }

    private async transformToCreateInput(data: CreateUserDto): Promise<Prisma.UserCreateInput> {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        
        return {
            email: data.email,
            password: hashedPassword,
            name: data.name,
            role: data.role,
            department: data.department,
        };
    }

    async create(data: CreateUserDto): Promise<User> {
        try {
            const createInput = await this.transformToCreateInput(data);
            
            const prismaUser = await this.prisma.user.create({
                data: createInput,
                include: {
                    createdOffers: true,
                    approvedOffers: true,
                    createdPOs: true,
                    approvedPOs: true
                }
            });

            return this.transformToEntity(prismaUser);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new Error('Email already exists');
                }
            }
            throw error;
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            const prismaUser = await this.prisma.user.findUnique({
                where: { email },
                include: {
                    createdOffers: true,
                    approvedOffers: true,
                    createdPOs: true,
                    approvedPOs: true
                }
            });

            return prismaUser ? this.transformToEntity(prismaUser) : null;
        } catch (error) {
            console.error('Error in findByEmail:', error);
            throw new Error('Failed to fetch user by email from database');
        }
    }

    async findById(id: string): Promise<User | null> {
        try {
            const prismaUser = await this.prisma.user.findUnique({
                where: { id },
                include: {
                    createdOffers: true,
                    approvedOffers: true,
                    createdPOs: true,
                    approvedPOs: true
                }
            });

            return prismaUser ? this.transformToEntity(prismaUser) : null;
        } catch (error) {
            console.error('Error in findById:', error);
            throw new Error('Failed to fetch user from database');
        }
    }

    async validatePassword(email: string, password: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return false;
        }

        return bcrypt.compare(password, user.password);
    }

    async findByRole(role: UserRole): Promise<User[]> {
        try {
            const prismaUsers = await this.prisma.user.findMany({
                where: { role },
                include: {
                    createdOffers: true,
                    approvedOffers: true,
                    createdPOs: true,
                    approvedPOs: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return prismaUsers.map(user => this.transformToEntity(user));
        } catch (error) {
            console.error('Error in findByRole:', error);
            throw new Error('Failed to fetch users by role from database');
        }
    }

    async findByDepartment(department: string): Promise<User[]> {
        const prismaUsers = await this.prisma.user.findMany({
            where: { department },
            include: {
                createdOffers: true,
                approvedOffers: true,
                createdPOs: true,
                approvedPOs: true
            }
        });

        return prismaUsers.map(user => this.transformToEntity(user));
    }

    async findAll(): Promise<User[]> {
        try {
            const prismaUsers = await this.prisma.user.findMany({
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return prismaUsers.map(user => this.transformToEntity(user));
        } catch (error) {
            console.error('Error in findAll:', error);
            throw new Error('Failed to fetch users from database');
        }
    }
}