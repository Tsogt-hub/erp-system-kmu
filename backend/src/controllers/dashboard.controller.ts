import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  static async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const stats = await DashboardService.getStats(userId);
      res.json(stats);
    } catch (error: any) {
      next(error);
    }
  }
}







