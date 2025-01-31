import { Request, Response } from 'express';
import { UserService } from '../../../application/services/UserService';

export class UserController {
  constructor(private userService: UserService) {}

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      // Remove sensitive information like passwords before sending
      const sanitizedUsers = users.map(({ password, ...user }) => user);
      res.status(200).json(sanitizedUsers);
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Error fetching users',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.userService.getUserById(req.params.id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      const { password, ...sanitizedUser } = user;
      res.status(200).json(sanitizedUser);
    } catch (error) {
      console.error('Error in getUserById:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Error fetching user',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };
}