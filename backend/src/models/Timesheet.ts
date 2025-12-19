import { pool } from '../config/database';

export interface Timesheet {
  id: number;
  user_id: number;
  project_id?: number;
  task_id?: number;
  date: Date;
  start_time: string;
  end_time: string;
  hours: number;
  description?: string;
  billable: boolean;
  hourly_rate?: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_at: Date;
  updated_at: Date;
}

export interface CreateTimesheetData {
  user_id: number;
  project_id?: number;
  task_id?: number;
  date: Date;
  start_time: string;
  end_time: string;
  hours: number;
  description?: string;
  billable?: boolean;
  hourly_rate?: number;
  status?: string;
}

export class TimesheetModel {
  static async findById(id: number): Promise<Timesheet | null> {
    const result = await pool.query(
      `SELECT t.*, 
        u.first_name || ' ' || u.last_name as user_name,
        p.name as project_name
       FROM timesheets t
       LEFT JOIN users u ON t.user_id = u.id
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async findAll(filters?: {
    user_id?: number;
    project_id?: number;
    from_date?: Date;
    to_date?: Date;
    status?: string;
  }): Promise<Timesheet[]> {
    let query = `
      SELECT t.*, 
        u.first_name || ' ' || u.last_name as user_name,
        p.name as project_name
      FROM timesheets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (filters?.user_id) {
      query += ` AND t.user_id = $${paramCount}`;
      params.push(filters.user_id);
      paramCount++;
    }

    if (filters?.project_id) {
      query += ` AND t.project_id = $${paramCount}`;
      params.push(filters.project_id);
      paramCount++;
    }

    if (filters?.from_date) {
      query += ` AND t.date >= $${paramCount}`;
      params.push(filters.from_date);
      paramCount++;
    }

    if (filters?.to_date) {
      query += ` AND t.date <= $${paramCount}`;
      params.push(filters.to_date);
      paramCount++;
    }

    if (filters?.status) {
      query += ` AND t.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    query += ' ORDER BY t.date DESC, t.start_time DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async create(data: CreateTimesheetData): Promise<Timesheet> {
    const result = await pool.query(
      `INSERT INTO timesheets (
        user_id, project_id, task_id, date, start_time, end_time, hours,
        description, billable, hourly_rate, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        data.user_id,
        data.project_id || null,
        data.task_id || null,
        data.date,
        data.start_time,
        data.end_time,
        data.hours,
        data.description || null,
        data.billable !== undefined ? data.billable : true,
        data.hourly_rate || null,
        data.status || 'draft',
      ]
    );
    return result.rows[0];
  }

  static async update(id: number, data: Partial<CreateTimesheetData>): Promise<Timesheet | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return this.findById(id);

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE timesheets SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM timesheets WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async getTimesheetStats(userId?: number, projectId?: number) {
    let query = `
      SELECT 
        COUNT(*) as total_entries,
        SUM(hours) as total_hours,
        SUM(CASE WHEN billable = true THEN hours ELSE 0 END) as billable_hours,
        SUM(CASE WHEN billable = true THEN hours * COALESCE(hourly_rate, 0) ELSE 0 END) as total_revenue
      FROM timesheets
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (userId) {
      query += ` AND user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    if (projectId) {
      query += ` AND project_id = $${paramCount}`;
      params.push(projectId);
      paramCount++;
    }

    const result = await pool.query(query, params);
    return result.rows[0];
  }
}

