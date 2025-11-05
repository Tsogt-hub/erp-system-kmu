import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CalendarEventService } from '../services/calendarEvent.service';

export class CalendarEventController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, resourceId, resourceType, projectId } = req.query;
      
      const events = await CalendarEventService.getAll(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        resourceId ? parseInt(resourceId as string) : undefined,
        resourceType as string | undefined,
        projectId ? parseInt(projectId as string) : undefined
      );
      
      res.json(events);
    } catch (error: any) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const event = await CalendarEventService.getById(id);
      res.json(event);
    } catch (error: any) {
      next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const event = await CalendarEventService.create({
        ...req.body,
        created_by: userId,
      });
      res.status(201).json(event);
    } catch (error: any) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const event = await CalendarEventService.update(id, req.body);
      res.json(event);
    } catch (error: any) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await CalendarEventService.delete(id);
      res.json({ message: 'Calendar event deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }
}


