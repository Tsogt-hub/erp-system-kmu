import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

export interface TimeEntry {
  id: number;
  user_id: number;
  project_id?: number;
  start_time: Date;
  end_time?: Date;
  break_duration: number;
  description?: string;
  type: string;
  created_at: Date;
  updated_at: Date;
  project_name?: string;
  user_name?: string;
}

export interface CreateTimeEntryData {
  user_id: number;
  project_id?: number;
  start_time: Date;
  end_time?: Date;
  break_duration?: number;
  description?: string;
  type?: string;
}

export class TimeEntryModel {
  static async findById(id: number): Promise<TimeEntry | null> {
    const result = await query(
      `SELECT te.*, p.name as project_name, 
              u.first_name || ' ' || u.last_name as user_name
       FROM time_entries te
       LEFT JOIN projects p ON te.project_id = p.id
       LEFT JOIN users u ON te.user_id = u.id
       WHERE te.id = $1`,
      [id]
    );
    return getRow(result);
  }

  static async findAll(userId?: number): Promise<TimeEntry[]> {
    let queryText = `
      SELECT te.*, p.name as project_name,
             u.first_name || ' ' || u.last_name as user_name
      FROM time_entries te
      LEFT JOIN projects p ON te.project_id = p.id
      LEFT JOIN users u ON te.user_id = u.id
    `;
    const params: any[] = [];

    if (userId) {
      queryText += ' WHERE te.user_id = $1';
      params.push(userId);
    }

    queryText += ' ORDER BY te.start_time DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  static async findByProject(projectId: number): Promise<TimeEntry[]> {
    const result = await query(
      `SELECT te.*, p.name as project_name,
              u.first_name || ' ' || u.last_name as user_name
       FROM time_entries te
       LEFT JOIN projects p ON te.project_id = p.id
       LEFT JOIN users u ON te.user_id = u.id
       WHERE te.project_id = $1
       ORDER BY te.start_time DESC`,
      [projectId]
    );
    return getRows(result);
  }

  static async findByDateRange(startDate: Date, endDate: Date, userId?: number): Promise<TimeEntry[]> {
    let queryText = `
      SELECT te.*, p.name as project_name,
             u.first_name || ' ' || u.last_name as user_name
      FROM time_entries te
      LEFT JOIN projects p ON te.project_id = p.id
      LEFT JOIN users u ON te.user_id = u.id
      WHERE te.start_time >= $1 AND te.start_time <= $2
    `;
    const params: any[] = [startDate, endDate];

    if (userId) {
      queryText += ' AND te.user_id = $3';
      params.push(userId);
    }

    queryText += ' ORDER BY te.start_time DESC';

    const result = await query(queryText, params);
    return getRows(result);
  }

  static async getActiveEntry(userId: number): Promise<TimeEntry | null> {
    const result = await query(
      `SELECT * FROM time_entries 
       WHERE user_id = $1 AND end_time IS NULL 
       ORDER BY start_time DESC 
       LIMIT 1`,
      [userId]
    );
    return getRow(result);
  }

  static async create(data: CreateTimeEntryData): Promise<TimeEntry> {
    const result = await query(
      `INSERT INTO time_entries (user_id, project_id, start_time, end_time, break_duration, description, type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.user_id,
        data.project_id || null,
        data.start_time,
        data.end_time || null,
        data.break_duration || 0,
        data.description || null,
        data.type || 'work',
      ]
    );
    return getRow(result)!;
  }

  static async update(id: number, data: Partial<CreateTimeEntryData>): Promise<TimeEntry> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'user_id') {
        fields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    });

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE time_entries SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM time_entries WHERE id = $1', [id]);
  }

  static async calculateDuration(startTime: Date, endTime: Date, breakDuration: number = 0): number {
    const diff = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor((diff / 1000 / 60) - breakDuration);
    return Math.max(0, minutes);
  }
}

