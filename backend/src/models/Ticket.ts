import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

export interface Ticket {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigned_to?: number;
  created_by: number;
  due_date?: Date;
  project_id?: number;
  is_completed: boolean;
  created_at: Date;
  updated_at: Date;
  assigned_user_name?: string;
  created_user_name?: string;
  project_name?: string;
}

export interface CreateTicketData {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assigned_to?: number;
  created_by: number;
  due_date?: Date;
  project_id?: number;
}

export class TicketModel {
  static async findById(id: number): Promise<Ticket | null> {
    const result = await query(
      `SELECT t.*, 
              u1.first_name || ' ' || u1.last_name as assigned_user_name,
              u2.first_name || ' ' || u2.last_name as created_user_name,
              p.name as project_name
       FROM tickets t
       LEFT JOIN users u1 ON t.assigned_to = u1.id
       LEFT JOIN users u2 ON t.created_by = u2.id
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1`,
      [id]
    );
    return getRow(result);
  }

  static async findAll(userId?: number): Promise<Ticket[]> {
    let queryText = `
      SELECT t.*,
             u1.first_name || ' ' || u1.last_name as assigned_user_name,
             u2.first_name || ' ' || u2.last_name as created_user_name,
             p.name as project_name
      FROM tickets t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      LEFT JOIN projects p ON t.project_id = p.id
    `;
    const params: any[] = [];

    if (userId) {
      queryText += ' WHERE t.assigned_to = $1 OR t.created_by = $1';
      params.push(userId);
    }

    queryText += ' ORDER BY t.created_at DESC';

    const result = await query(queryText, params);
    return getRows(result);
  }

  static async findByStatus(status: string, userId?: number): Promise<Ticket[]> {
    let queryText = `
      SELECT t.*,
             u1.first_name || ' ' || u1.last_name as assigned_user_name,
             u2.first_name || ' ' || u2.last_name as created_user_name,
             p.name as project_name
      FROM tickets t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.status = $1
    `;
    const params: any[] = [status];

    if (userId) {
      queryText += ' AND (t.assigned_to = $2 OR t.created_by = $2)';
      params.push(userId);
    }

    queryText += ' ORDER BY t.created_at DESC';

    const result = await query(queryText, params);
    return getRows(result);
  }

  static async create(data: CreateTicketData): Promise<Ticket> {
    const result = await query(
      `INSERT INTO tickets (title, description, status, priority, assigned_to, created_by, due_date, project_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.title,
        data.description || null,
        data.status || 'open',
        data.priority || 'medium',
        data.assigned_to || null,
        data.created_by,
        data.due_date || null,
        data.project_id || null,
      ]
    );
    return getRow(result)!;
  }

  static async update(id: number, data: Partial<CreateTicketData>): Promise<Ticket> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'created_by') {
        fields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    });

    // Update is_completed based on status
    if (data.status === 'closed' || data.status === 'resolved') {
      fields.push(`is_completed = true`);
    } else if (data.status && data.status !== 'closed' && data.status !== 'resolved') {
      fields.push(`is_completed = false`);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE tickets SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM tickets WHERE id = $1', [id]);
  }
}

