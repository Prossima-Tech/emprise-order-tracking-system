import { Request, Response } from 'express';
import { AuthService } from '../../../application/services/AuthService';
import { LoginDto } from '../../../application/dtos/auth/LoginDto';
import { RegisterUserDto } from '../../../application/dtos/auth/RegisterUserDto';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.register(req.body as RegisterUserDto);
      
      if (!result.isSuccess) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.status(201).json(result.data);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.login(req.body as LoginDto);
      
      if (!result.isSuccess) {
        res.status(401).json({ error: result.error });
        return;
      }

      res.status(200).json(result.data);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}