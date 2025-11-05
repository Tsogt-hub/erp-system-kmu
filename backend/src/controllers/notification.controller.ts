import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const unreadOnly = req.query.unreadOnly === 'true';
      const notifications = await NotificationService.getNotifications(userId, unreadOnly);
      res.json(notifications);
    } catch (error: any) {
      next(error);
    }
  }

  static async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const count = await NotificationService.getUnreadCount(userId);
      res.json({ count });
    } catch (error: any) {
      next(error);
    }
  }

  static async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const notification = await NotificationService.markAsRead(id);
      res.json(notification);
    } catch (error: any) {
      next(error);
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await NotificationService.markAllAsRead(userId);
      res.json({ message: 'All notifications marked as read' });
    } catch (error: any) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await NotificationService.deleteNotification(id);
      res.json({ message: 'Notification deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }
}







