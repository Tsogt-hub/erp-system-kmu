import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { TimeTrackingService } from '../services/timeTracking.service';

export class TimeTrackingController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { projectId, startDate, endDate } = req.query;

      let entries;
      if (projectId) {
        entries = await TimeTrackingService.getTimeEntriesByProject(parseInt(projectId as string));
      } else if (startDate && endDate) {
        entries = await TimeTrackingService.getTimeEntriesByDateRange(
          new Date(startDate as string),
          new Date(endDate as string),
          userId
        );
      } else {
        entries = await TimeTrackingService.getAllTimeEntries(userId);
      }

      res.json(entries);
    } catch (error: any) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const entry = await TimeTrackingService.getTimeEntryById(id);
      res.json(entry);
    } catch (error: any) {
      next(error);
    }
  }

  static async getActive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const activeEntry = await TimeTrackingService.getActiveTimeEntry(userId);
      res.json(activeEntry || null);
    } catch (error: any) {
      next(error);
    }
  }

  static async start(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { project_id, description } = req.body;
      const entry = await TimeTrackingService.startTimeTracking(
        userId,
        project_id,
        description
      );
      res.status(201).json(entry);
    } catch (error: any) {
      next(error);
    }
  }

  static async stop(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await TimeTrackingService.stopTimeTracking(userId);
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const entry = await TimeTrackingService.createTimeEntry({
        ...req.body,
        user_id: userId,
      });
      res.status(201).json(entry);
    } catch (error: any) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const entry = await TimeTrackingService.updateTimeEntry(id, req.body);
      res.json(entry);
    } catch (error: any) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await TimeTrackingService.deleteTimeEntry(id);
      res.json({ message: 'Time entry deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }
}








