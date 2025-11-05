import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  related_id?: number;
  related_type?: string;
  is_read: boolean;
  created_at: Date;
}

export interface CreateNotificationData {
  user_id: number;
  type: string;
  title: string;
  message: string;
  related_id?: number;
  related_type?: string;
}

export class NotificationModel {
  static async findById(id: number): Promise<Notification | null> {
    const result = await query('SELECT * FROM notifications WHERE id = $1', [id]);
    return getRow(result);
  }

  static async findByUser(userId: number, unreadOnly: boolean = false): Promise<Notification[]> {
    let queryText = 'SELECT * FROM notifications WHERE user_id = $1';
    const params: any[] = [userId];
    
    if (unreadOnly) {
      queryText += ' AND is_read = $2';
      params.push(0); // SQLite uses 0/1 for booleans
    }
    
    queryText += ' ORDER BY created_at DESC';
    
    const result = await query(queryText, params);
    return getRows(result);
  }

  static async create(data: CreateNotificationData): Promise<Notification> {
    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message, related_id, related_type, is_read)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.user_id,
        data.type,
        data.title,
        data.message,
        data.related_id || null,
        data.related_type || null,
        false,
      ]
    );
    return getRow(result)!;
  }

  static async markAsRead(id: number): Promise<Notification> {
    const result = await query(
      'UPDATE notifications SET is_read = $1 WHERE id = $2 RETURNING *',
      [true, id]
    );
    return getRow(result)!;
  }

  static async markAllAsRead(userId: number): Promise<void> {
    await query(
      'UPDATE notifications SET is_read = $1 WHERE user_id = $2',
      [true, userId]
    );
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM notifications WHERE id = $1', [id]);
  }

  static async getUnreadCount(userId: number): Promise<number> {
    const result = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = $2',
      [userId, 0] // SQLite uses 0/1 for booleans
    );
    const row = getRow(result);
    return row ? parseInt((row as any).count || '0') : 0;
  }
}




