import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service';

export class AuditController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const logs = await AuditService.list(limit);
      res.json({ data: logs });
    } catch (error) {
      next(error);
    }
  }
}


