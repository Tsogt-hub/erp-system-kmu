import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, first_name, last_name } = req.body;

      if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const result = await AuthService.register({
        email,
        password,
        first_name,
        last_name,
      });

      res.status(201).json(result);
    } catch (error: any) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await AuthService.login(email, password);

      res.json(result);
    } catch (error: any) {
      next(error);
    }
  }

  static async me(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Fetch user from database
      const { UserModel } = await import('../models/User');
      const { RoleModel } = await import('../models/Role');
      const { getRolePermissions } = await import('../auth/roles');
      const { resolveUserAttributes } = await import('../auth/attributes');

      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const role = await RoleModel.findById(user.role_id);
      const customPermissions = role?.permissions ?? [];
      const derivedPermissions = getRolePermissions(role?.name ?? 'employee');
      const permissions = Array.from(new Set([...customPermissions, ...derivedPermissions]));
      const attributes = await resolveUserAttributes(user.id);

      res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: role?.name ?? 'employee',
        permissions,
        attributes,
      });
    } catch (error: any) {
      next(error);
    }
  }
}












