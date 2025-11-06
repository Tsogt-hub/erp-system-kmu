import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserModel } from '../models/User';

export class UserController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const users = await UserModel.findAll();
      res.json(users);
    } catch (error: any) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error: any) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Remove password from update data
      const { password, ...updateData } = req.body;
      const updatedUser = await UserModel.update(id, updateData);
      
      // Don't return password hash
      const { password_hash, ...userResponse } = updatedUser;
      res.json(userResponse);
    } catch (error: any) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.userId;

      if (id === userId) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Soft delete - set is_active to false
      await UserModel.update(id, { is_active: false } as any);
      res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }
}








