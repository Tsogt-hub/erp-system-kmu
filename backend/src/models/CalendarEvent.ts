import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  start_time: Date;
  end_time: Date;
  resource_id: number;
  resource_type: string;
  resource_name?: string;
  project_id?: number;
  project_name?: string;
  created_by?: number;
  created_user_name?: string;
  recurrence_rule?: string; // JSON string for recurrence pattern
  color?: string;
  status?: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  travel_time?: number; // in minutes
  notes?: string;
  employees?: Array<{ id: number; user_id: number; first_name: string; last_name: string; email: string }>;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCalendarEventData {
  title: string;
  description?: string;
  start_time: string | Date;
  end_time: string | Date;
  resource_id: number;
  resource_type: string;
  project_id?: number;
  recurrence_rule?: string;
  color?: string;
  status?: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  travel_time?: number;
  notes?: string;
  employee_ids?: number[];
  created_by?: number;
}

export class CalendarEventModel {
  static async findById(id: number): Promise<CalendarEvent | null> {
    const result = await query(
      `SELECT ce.*, 
              p.name as project_name,
              u.first_name || ' ' || u.last_name as created_user_name
       FROM calendar_events ce
       LEFT JOIN projects p ON ce.project_id = p.id
       LEFT JOIN users u ON ce.created_by = u.id
       WHERE ce.id = $1`,
      [id]
    );
    const event = getRow(result);
    if (event) {
      event.employees = await this.getEventEmployees(id);
    }
    return event;
  }

  static async getEventEmployees(eventId: number): Promise<Array<{ id: number; user_id: number; first_name: string; last_name: string; email: string }>> {
    const result = await query(
      `SELECT cee.id, cee.user_id, u.first_name, u.last_name, u.email
       FROM calendar_event_employees cee
       JOIN users u ON cee.user_id = u.id
       WHERE cee.event_id = $1`,
      [eventId]
    );
    return getRows(result);
  }

  static async setEventEmployees(eventId: number, userIds: number[]): Promise<void> {
    // Lösche bestehende Zuordnungen
    await query('DELETE FROM calendar_event_employees WHERE event_id = $1', [eventId]);
    
    // Füge neue Zuordnungen hinzu
    if (userIds.length > 0) {
      for (const userId of userIds) {
        await query(
          'INSERT INTO calendar_event_employees (event_id, user_id) VALUES ($1, $2)',
          [eventId, userId]
        );
      }
    }
  }

  static async findAll(
    startDate?: Date,
    endDate?: Date,
    resourceId?: number,
    resourceType?: string,
    projectId?: number
  ): Promise<CalendarEvent[]> {
    let queryText = `
      SELECT ce.*,
             p.name as project_name,
             u.first_name || ' ' || u.last_name as created_user_name
      FROM calendar_events ce
      LEFT JOIN projects p ON ce.project_id = p.id
      LEFT JOIN users u ON ce.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (startDate) {
      queryText += ` AND ce.end_time >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      queryText += ` AND ce.start_time <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    if (resourceId) {
      queryText += ` AND ce.resource_id = $${paramCount}`;
      params.push(resourceId);
      paramCount++;
    }

    if (resourceType) {
      queryText += ` AND ce.resource_type = $${paramCount}`;
      params.push(resourceType);
      paramCount++;
    }

    if (projectId) {
      queryText += ` AND ce.project_id = $${paramCount}`;
      params.push(projectId);
      paramCount++;
    }

    queryText += ` ORDER BY ce.start_time ASC`;

    const result = await query(queryText, params);
    const events = getRows(result);
    
    // Lade Mitarbeiter für alle Events
    for (const event of events) {
      event.employees = await this.getEventEmployees(event.id);
    }
    
    return events;
  }

  static async create(data: CreateCalendarEventData): Promise<CalendarEvent> {
    const result = await query(
      `INSERT INTO calendar_events 
       (title, description, start_time, end_time, resource_id, resource_type, project_id, recurrence_rule, color, status, priority, travel_time, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        data.title,
        data.description || null,
        data.start_time,
        data.end_time,
        data.resource_id,
        data.resource_type,
        data.project_id || null,
        data.recurrence_rule || null,
        data.color || null,
        data.status || 'planned',
        data.priority || 'medium',
        data.travel_time || 0,
        data.notes || null,
        data.created_by || null,
      ]
    );
    return getRow(result)!;
  }

  static async update(id: number, data: Partial<CreateCalendarEventData>): Promise<CalendarEvent> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    });

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE calendar_events SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM calendar_events WHERE id = $1', [id]);
  }

  static async findByResource(resourceId: number, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const result = await query(
      `SELECT ce.*,
              p.name as project_name,
              u.first_name || ' ' || u.last_name as created_user_name
       FROM calendar_events ce
       LEFT JOIN projects p ON ce.project_id = p.id
       LEFT JOIN users u ON ce.created_by = u.id
       WHERE ce.resource_id = $1 
         AND ce.end_time >= $2 
         AND ce.start_time <= $3
       ORDER BY ce.start_time ASC`,
      [resourceId, startDate, endDate]
    );
    return getRows(result);
  }
}

