import { User, UserRole } from '../../domain/entities/User';
import { PrismaUserRepository } from '../../infrastructure/persistence/repositories/PrismaUserRepository';
import { CreateUserDto } from '../dtos/user/CreateUserDto';

export class UserService {
  constructor(private userRepository: PrismaUserRepository) {}

  async getAllUsers(): Promise<User[]> {
    try {
      console.log('getAllUsers');
      return await this.userRepository.findAll();
    } catch (error) {
      throw new Error('Error fetching users');
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw new Error('Error fetching user');
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findByEmail(email);
    } catch (error) {
      throw new Error('Error fetching user by email');
    }
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      // Check if user with email already exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      return await this.userRepository.create(userData);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error creating user');
    }
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    try {
      return await this.userRepository.findByRole(role);
    } catch (error) {
      throw new Error('Error fetching users by role');
    }
  }

  async getUsersByDepartment(department: string): Promise<User[]> {
    try {
      return await this.userRepository.findByDepartment(department);
    } catch (error) {
      throw new Error('Error fetching users by department');
    }
  }

  async validateUserCredentials(email: string, password: string): Promise<boolean> {
    try {
      return await this.userRepository.validatePassword(email, password);
    } catch (error) {
      throw new Error('Error validating user credentials');
    }
  }
}