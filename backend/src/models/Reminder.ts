import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

// Reminder-Typen wie in Hero
export const REMINDER_TYPES = [
  'Wiedervorlage',
  'Anruf',
  'E-Mail',
  'Termin',
  'Nachfassen',
  'Besuch',
  'Aufgabe',
  'Sonstige',
];

// Prioritäten
export const REMINDER_PRIORITIES = [
  'niedrig',
  'normal',
  'hoch',
  'dringend',
];

export interface Reminder {
  id: number;
  title: string;
  description?: string;
  reminder_type: string;
  priority: string;
  due_date: string;
  due_time?: string;
  entity_type: 'project' | 'contact' | 'offer' | 'company';
  entity_id: number;
  assigned_to_user_id?: number;
  created_by_user_id: number;
  is_completed: boolean;
  completed_at?: string;
  completed_by_user_id?: number;
  notify_email: boolean;
  notify_push: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  entity_name?: string;
  assigned_to_name?: string;
  created_by_name?: string;
}

export interface CreateReminderData {
  title: string;
  description?: string;
  reminder_type: string;
  priority?: string;
  due_date: string;
  due_time?: string;
  entity_type: 'project' | 'contact' | 'offer' | 'company';
  entity_id: number;
  assigned_to_user_id?: number;
  created_by_user_id: number;
  notify_email?: boolean;
  notify_push?: boolean;
}

export async function initRemindersTable(): Promise<void> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        reminder_type TEXT NOT NULL DEFAULT 'Wiedervorlage',
        priority TEXT NOT NULL DEFAULT 'normal',
        due_date TEXT NOT NULL,
        due_time TEXT,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        assigned_to_user_id INTEGER,
        created_by_user_id INTEGER NOT NULL,
        is_completed INTEGER DEFAULT 0,
        completed_at TEXT,
        completed_by_user_id INTEGER,
        notify_email INTEGER DEFAULT 1,
        notify_push INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to_user_id) REFERENCES users(id),
        FOREIGN KEY (created_by_user_id) REFERENCES users(id),
        FOREIGN KEY (completed_by_user_id) REFERENCES users(id)
      )
    `, []);
    console.log('✅ Reminders table initialized');
  } catch (error: any) {
    console.log('ℹ️ Reminders table already exists or error:', error.message);
  }
}

export class ReminderModel {
  static async findById(id: number): Promise<Reminder | null> {
    const result = await query(
      `SELECT r.*,
        u1.first_name || ' ' || u1.last_name as assigned_to_name,
        u2.first_name || ' ' || u2.last_name as created_by_name
       FROM reminders r
       LEFT JOIN users u1 ON r.assigned_to_user_id = u1.id
       LEFT JOIN users u2 ON r.created_by_user_id = u2.id
       WHERE r.id = $1`,
      [id]
    );
    return getRow(result);
  }

  static async findByEntity(entityType: string, entityId: number, includeCompleted: boolean = false): Promise<Reminder[]> {
    let queryText = `
      SELECT r.*,
        u1.first_name || ' ' || u1.last_name as assigned_to_name,
        u2.first_name || ' ' || u2.last_name as created_by_name
       FROM reminders r
       LEFT JOIN users u1 ON r.assigned_to_user_id = u1.id
       LEFT JOIN users u2 ON r.created_by_user_id = u2.id
       WHERE r.entity_type = $1 AND r.entity_id = $2
    `;
    
    if (!includeCompleted) {
      queryText += ` AND (r.is_completed = 0 OR r.is_completed IS NULL)`;
    }
    
    queryText += ` ORDER BY r.due_date ASC, r.due_time ASC`;
    
    const result = await query(queryText, [entityType, entityId]);
    return getRows(result);
  }

  static async findByUser(userId: number, includeCompleted: boolean = false): Promise<Reminder[]> {
    let queryText = `
      SELECT r.*,
        u1.first_name || ' ' || u1.last_name as assigned_to_name,
        u2.first_name || ' ' || u2.last_name as created_by_name
       FROM reminders r
       LEFT JOIN users u1 ON r.assigned_to_user_id = u1.id
       LEFT JOIN users u2 ON r.created_by_user_id = u2.id
       WHERE r.assigned_to_user_id = $1 OR r.created_by_user_id = $1
    `;
    
    if (!includeCompleted) {
      queryText += ` AND (r.is_completed = 0 OR r.is_completed IS NULL)`;
    }
    
    queryText += ` ORDER BY r.due_date ASC, r.due_time ASC`;
    
    const result = await query(queryText, [userId]);
    return getRows(result);
  }

  static async findDueReminders(daysAhead: number = 7): Promise<Reminder[]> {
    const result = await query(
      `SELECT r.*,
        u1.first_name || ' ' || u1.last_name as assigned_to_name,
        u2.first_name || ' ' || u2.last_name as created_by_name
       FROM reminders r
       LEFT JOIN users u1 ON r.assigned_to_user_id = u1.id
       LEFT JOIN users u2 ON r.created_by_user_id = u2.id
       WHERE (r.is_completed = 0 OR r.is_completed IS NULL)
         AND r.due_date <= date('now', '+' || $1 || ' days')
       ORDER BY r.due_date ASC, r.due_time ASC`,
      [daysAhead]
    );
    return getRows(result);
  }

  static async findOverdue(): Promise<Reminder[]> {
    const result = await query(
      `SELECT r.*,
        u1.first_name || ' ' || u1.last_name as assigned_to_name,
        u2.first_name || ' ' || u2.last_name as created_by_name
       FROM reminders r
       LEFT JOIN users u1 ON r.assigned_to_user_id = u1.id
       LEFT JOIN users u2 ON r.created_by_user_id = u2.id
       WHERE (r.is_completed = 0 OR r.is_completed IS NULL)
         AND r.due_date < date('now')
       ORDER BY r.due_date ASC, r.due_time ASC`,
      []
    );
    return getRows(result);
  }

  static async create(data: CreateReminderData): Promise<Reminder> {
    const result = await query(
      `INSERT INTO reminders (
        title, description, reminder_type, priority, due_date, due_time,
        entity_type, entity_id, assigned_to_user_id, created_by_user_id,
        notify_email, notify_push
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        data.title,
        data.description || null,
        data.reminder_type,
        data.priority || 'normal',
        data.due_date,
        data.due_time || null,
        data.entity_type,
        data.entity_id,
        data.assigned_to_user_id || data.created_by_user_id,
        data.created_by_user_id,
        data.notify_email !== false ? 1 : 0,
        data.notify_push !== false ? 1 : 0,
      ]
    );
    return getRow(result)!;
  }

  static async update(id: number, data: Partial<CreateReminderData>): Promise<Reminder> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'notify_email' || key === 'notify_push') {
          fields.push(`${key} = $${paramCount++}`);
          values.push(value ? 1 : 0);
        } else {
          fields.push(`${key} = $${paramCount++}`);
          values.push(value);
        }
      }
    });

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE reminders SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async complete(id: number, userId: number): Promise<Reminder> {
    const result = await query(
      `UPDATE reminders 
       SET is_completed = 1, completed_at = CURRENT_TIMESTAMP, completed_by_user_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [userId, id]
    );
    return getRow(result)!;
  }

  static async uncomplete(id: number): Promise<Reminder> {
    const result = await query(
      `UPDATE reminders 
       SET is_completed = 0, completed_at = NULL, completed_by_user_id = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return getRow(result)!;
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM reminders WHERE id = $1', [id]);
  }
}







