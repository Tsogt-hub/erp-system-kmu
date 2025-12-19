import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

export interface KanbanBoard {
  id: number;
  name: string;
  description?: string;
  board_type: string; // 'sales', 'project', 'custom'
  created_by: number;
  is_default?: boolean;
  settings?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface KanbanColumn {
  id: number;
  board_id: number;
  name: string;
  position: number;
  color?: string;
  wip_limit?: number; // Work in Progress Limit
  created_at: Date;
  updated_at: Date;
}

export interface KanbanCard {
  id: number;
  column_id: number;
  board_id: number;
  title: string;
  description?: string;
  position: number;
  contact_id?: number;
  company_id?: number;
  project_id?: number;
  assigned_to?: number;
  due_date?: Date;
  amount?: number;
  priority?: string; // 'low', 'medium', 'high', 'urgent'
  labels?: string[];
  custom_fields?: Record<string, any>;
  created_by: number;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  contact_name?: string;
  company_name?: string;
  assigned_to_name?: string;
  column_name?: string;
  last_activity_at?: Date;
  activity_count?: number;
}

export interface KanbanActivity {
  id: number;
  card_id: number;
  user_id: number;
  activity_type: string; // 'note', 'email', 'call', 'task', 'meeting', 'status_change', 'created'
  content?: string;
  metadata?: Record<string, any>;
  created_at: Date;
  // Joined fields
  user_name?: string;
}

export interface CreateKanbanBoardData {
  name: string;
  description?: string;
  board_type?: string;
  created_by: number;
  is_default?: boolean;
  settings?: Record<string, any>;
}

export interface CreateKanbanColumnData {
  board_id: number;
  name: string;
  position?: number;
  color?: string;
  wip_limit?: number;
}

export interface CreateKanbanCardData {
  column_id: number;
  board_id: number;
  title: string;
  description?: string;
  position?: number;
  contact_id?: number;
  company_id?: number;
  project_id?: number;
  assigned_to?: number;
  due_date?: Date;
  amount?: number;
  priority?: string;
  labels?: string[];
  custom_fields?: Record<string, any>;
  created_by: number;
}

export interface CreateKanbanActivityData {
  card_id: number;
  user_id: number;
  activity_type: string;
  content?: string;
  metadata?: Record<string, any>;
}

// ============ BOARD MODEL ============
export class KanbanBoardModel {
  static async findAll(userId?: number): Promise<KanbanBoard[]> {
    const result = await query(
      `SELECT * FROM kanban_boards 
       ${userId ? 'WHERE created_by = $1 OR is_default = true' : ''}
       ORDER BY is_default DESC, name ASC`,
      userId ? [userId] : []
    );
    return getRows(result);
  }

  static async findById(id: number): Promise<KanbanBoard | null> {
    const result = await query(
      'SELECT * FROM kanban_boards WHERE id = $1',
      [id]
    );
    return getRow(result);
  }

  static async create(data: CreateKanbanBoardData): Promise<KanbanBoard> {
    const result = await query(
      `INSERT INTO kanban_boards (name, description, board_type, created_by, is_default, settings)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.name,
        data.description || null,
        data.board_type || 'custom',
        data.created_by,
        data.is_default || false,
        data.settings ? JSON.stringify(data.settings) : null
      ]
    );
    return getRow(result)!;
  }

  static async update(id: number, data: Partial<CreateKanbanBoardData>): Promise<KanbanBoard> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.board_type !== undefined) {
      fields.push(`board_type = $${paramCount++}`);
      values.push(data.board_type);
    }
    if (data.settings !== undefined) {
      fields.push(`settings = $${paramCount++}`);
      values.push(JSON.stringify(data.settings));
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE kanban_boards SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM kanban_boards WHERE id = $1', [id]);
  }
}

// ============ COLUMN MODEL ============
export class KanbanColumnModel {
  static async findByBoard(boardId: number): Promise<KanbanColumn[]> {
    const result = await query(
      'SELECT * FROM kanban_columns WHERE board_id = $1 ORDER BY position ASC',
      [boardId]
    );
    return getRows(result);
  }

  static async findById(id: number): Promise<KanbanColumn | null> {
    const result = await query(
      'SELECT * FROM kanban_columns WHERE id = $1',
      [id]
    );
    return getRow(result);
  }

  static async create(data: CreateKanbanColumnData): Promise<KanbanColumn> {
    // Get max position if not provided
    let position = data.position;
    if (position === undefined) {
      const maxResult = await query(
        'SELECT COALESCE(MAX(position), 0) + 1 as next_pos FROM kanban_columns WHERE board_id = $1',
        [data.board_id]
      );
      position = getRow(maxResult)?.next_pos || 1;
    }

    const result = await query(
      `INSERT INTO kanban_columns (board_id, name, position, color, wip_limit)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.board_id, data.name, position, data.color || '#1976D2', data.wip_limit || null]
    );
    return getRow(result)!;
  }

  static async update(id: number, data: Partial<CreateKanbanColumnData>): Promise<KanbanColumn> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.position !== undefined) {
      fields.push(`position = $${paramCount++}`);
      values.push(data.position);
    }
    if (data.color !== undefined) {
      fields.push(`color = $${paramCount++}`);
      values.push(data.color);
    }
    if (data.wip_limit !== undefined) {
      fields.push(`wip_limit = $${paramCount++}`);
      values.push(data.wip_limit);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE kanban_columns SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM kanban_columns WHERE id = $1', [id]);
  }

  static async reorder(boardId: number, columnIds: number[]): Promise<void> {
    for (let i = 0; i < columnIds.length; i++) {
      await query(
        'UPDATE kanban_columns SET position = $1 WHERE id = $2 AND board_id = $3',
        [i + 1, columnIds[i], boardId]
      );
    }
  }
}

// ============ CARD MODEL ============
export class KanbanCardModel {
  static async findByColumn(columnId: number): Promise<KanbanCard[]> {
    const result = await query(
      `SELECT c.*, 
              CONCAT(ct.first_name, ' ', ct.last_name) as contact_name,
              co.name as company_name,
              CONCAT(u.first_name, ' ', u.last_name) as assigned_to_name,
              col.name as column_name,
              (SELECT MAX(created_at) FROM kanban_activities WHERE card_id = c.id) as last_activity_at,
              (SELECT COUNT(*) FROM kanban_activities WHERE card_id = c.id) as activity_count
       FROM kanban_cards c
       LEFT JOIN contacts ct ON c.contact_id = ct.id
       LEFT JOIN companies co ON c.company_id = co.id
       LEFT JOIN users u ON c.assigned_to = u.id
       LEFT JOIN kanban_columns col ON c.column_id = col.id
       WHERE c.column_id = $1
       ORDER BY c.position ASC`,
      [columnId]
    );
    return getRows(result);
  }

  static async findByBoard(boardId: number): Promise<KanbanCard[]> {
    const result = await query(
      `SELECT c.*, 
              CONCAT(ct.first_name, ' ', ct.last_name) as contact_name,
              co.name as company_name,
              CONCAT(u.first_name, ' ', u.last_name) as assigned_to_name,
              col.name as column_name,
              (SELECT MAX(created_at) FROM kanban_activities WHERE card_id = c.id) as last_activity_at,
              (SELECT COUNT(*) FROM kanban_activities WHERE card_id = c.id) as activity_count
       FROM kanban_cards c
       LEFT JOIN contacts ct ON c.contact_id = ct.id
       LEFT JOIN companies co ON c.company_id = co.id
       LEFT JOIN users u ON c.assigned_to = u.id
       LEFT JOIN kanban_columns col ON c.column_id = col.id
       WHERE c.board_id = $1
       ORDER BY col.position ASC, c.position ASC`,
      [boardId]
    );
    return getRows(result);
  }

  static async findById(id: number): Promise<KanbanCard | null> {
    const result = await query(
      `SELECT c.*, 
              CONCAT(ct.first_name, ' ', ct.last_name) as contact_name,
              ct.email as contact_email,
              ct.phone as contact_phone,
              co.name as company_name,
              CONCAT(u.first_name, ' ', u.last_name) as assigned_to_name,
              col.name as column_name,
              b.name as board_name
       FROM kanban_cards c
       LEFT JOIN contacts ct ON c.contact_id = ct.id
       LEFT JOIN companies co ON c.company_id = co.id
       LEFT JOIN users u ON c.assigned_to = u.id
       LEFT JOIN kanban_columns col ON c.column_id = col.id
       LEFT JOIN kanban_boards b ON c.board_id = b.id
       WHERE c.id = $1`,
      [id]
    );
    return getRow(result);
  }

  static async create(data: CreateKanbanCardData): Promise<KanbanCard> {
    // Get max position if not provided
    let position = data.position;
    if (position === undefined) {
      const maxResult = await query(
        'SELECT COALESCE(MAX(position), 0) + 1 as next_pos FROM kanban_cards WHERE column_id = $1',
        [data.column_id]
      );
      position = getRow(maxResult)?.next_pos || 1;
    }

    const result = await query(
      `INSERT INTO kanban_cards (column_id, board_id, title, description, position, contact_id, company_id, project_id, assigned_to, due_date, amount, priority, labels, custom_fields, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        data.column_id,
        data.board_id,
        data.title,
        data.description || null,
        position,
        data.contact_id || null,
        data.company_id || null,
        data.project_id || null,
        data.assigned_to || null,
        data.due_date || null,
        data.amount || null,
        data.priority || 'medium',
        data.labels ? JSON.stringify(data.labels) : null,
        data.custom_fields ? JSON.stringify(data.custom_fields) : null,
        data.created_by
      ]
    );
    return getRow(result)!;
  }

  static async update(id: number, data: Partial<CreateKanbanCardData>): Promise<KanbanCard> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const simpleFields = ['title', 'description', 'position', 'contact_id', 'company_id', 
                          'project_id', 'assigned_to', 'due_date', 'amount', 'priority', 'column_id'];
    
    for (const field of simpleFields) {
      if ((data as any)[field] !== undefined) {
        fields.push(`${field} = $${paramCount++}`);
        values.push((data as any)[field]);
      }
    }

    if (data.labels !== undefined) {
      fields.push(`labels = $${paramCount++}`);
      values.push(JSON.stringify(data.labels));
    }
    if (data.custom_fields !== undefined) {
      fields.push(`custom_fields = $${paramCount++}`);
      values.push(JSON.stringify(data.custom_fields));
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE kanban_cards SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async moveToColumn(cardId: number, newColumnId: number, newPosition: number): Promise<KanbanCard> {
    const result = await query(
      `UPDATE kanban_cards 
       SET column_id = $1, position = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING *`,
      [newColumnId, newPosition, cardId]
    );
    return getRow(result)!;
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM kanban_cards WHERE id = $1', [id]);
  }

  static async reorderInColumn(columnId: number, cardIds: number[]): Promise<void> {
    for (let i = 0; i < cardIds.length; i++) {
      await query(
        'UPDATE kanban_cards SET position = $1 WHERE id = $2 AND column_id = $3',
        [i + 1, cardIds[i], columnId]
      );
    }
  }
}

// ============ ACTIVITY MODEL ============
export class KanbanActivityModel {
  static async findByCard(cardId: number, limit: number = 50): Promise<KanbanActivity[]> {
    const result = await query(
      `SELECT a.*, CONCAT(u.first_name, ' ', u.last_name) as user_name
       FROM kanban_activities a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.card_id = $1
       ORDER BY a.created_at DESC
       LIMIT $2`,
      [cardId, limit]
    );
    return getRows(result);
  }

  static async create(data: CreateKanbanActivityData): Promise<KanbanActivity> {
    const result = await query(
      `INSERT INTO kanban_activities (card_id, user_id, activity_type, content, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.card_id,
        data.user_id,
        data.activity_type,
        data.content || null,
        data.metadata ? JSON.stringify(data.metadata) : null
      ]
    );
    
    // Update card's updated_at
    await query(
      'UPDATE kanban_cards SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [data.card_id]
    );
    
    return getRow(result)!;
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM kanban_activities WHERE id = $1', [id]);
  }
}

