import { NotificationModel, CreateNotificationData } from '../models/Notification';
import { logger } from '../utils/logger';

export class NotificationService {
  static async createNotification(data: CreateNotificationData) {
    try {
      const notification = await NotificationModel.create(data);
      logger.info(`📬 Benachrichtigung erstellt für User ${data.user_id}: ${data.title}`);
      return notification;
    } catch (error: any) {
      logger.error('❌ Fehler beim Erstellen der Benachrichtigung:', error.message);
      throw error;
    }
  }

  static async notifyProjectMemberAdded(userId: number, projectId: number, projectName: string, addedBy: string) {
    return await this.createNotification({
      user_id: userId,
      type: 'project_member_added',
      title: 'Zu Projekt hinzugefügt',
      message: `Sie wurden von ${addedBy} zum Projekt "${projectName}" hinzugefügt.`,
      related_id: projectId,
      related_type: 'project',
    });
  }

  static async getNotifications(userId: number, unreadOnly: boolean = false) {
    return await NotificationModel.findByUser(userId, unreadOnly);
  }

  static async markAsRead(notificationId: number) {
    return await NotificationModel.markAsRead(notificationId);
  }

  static async markAllAsRead(userId: number) {
    await NotificationModel.markAllAsRead(userId);
  }

  static async getUnreadCount(userId: number) {
    return await NotificationModel.getUnreadCount(userId);
  }

  static async deleteNotification(notificationId: number) {
    await NotificationModel.delete(notificationId);
  }
}





