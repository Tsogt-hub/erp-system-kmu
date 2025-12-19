import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

export interface Checklist {
  id: number;
  name: string;
  description?: string;
  entity_type: 'project' | 'contact' | 'offer' | 'template';
  entity_id?: number;
  is_template: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  items?: ChecklistItem[];
  progress?: number; // Calculated field
}

export interface ChecklistItem {
  id: number;
  checklist_id: number;
  title: string;
  description?: string;
  position_order: number;
  is_completed: boolean;
  completed_at?: string;
  completed_by_user_id?: number;
  due_date?: string;
  assigned_to_user_id?: number;
  created_at: string;
  updated_at: string;
  completed_by_name?: string;
  assigned_to_name?: string;
}

export interface CreateChecklistData {
  name: string;
  description?: string;
  entity_type: 'project' | 'contact' | 'offer' | 'template';
  entity_id?: number;
  is_template?: boolean;
  created_by: number;
}

export interface CreateChecklistItemData {
  checklist_id: number;
  title: string;
  description?: string;
  position_order?: number;
  due_date?: string;
  assigned_to_user_id?: number;
}

export async function initChecklistTables(): Promise<void> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS checklists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        entity_type TEXT NOT NULL,
        entity_id INTEGER,
        is_template INTEGER DEFAULT 0,
        created_by INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `, []);

    await query(`
      CREATE TABLE IF NOT EXISTS checklist_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        checklist_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        position_order INTEGER DEFAULT 1,
        is_completed INTEGER DEFAULT 0,
        completed_at TEXT,
        completed_by_user_id INTEGER,
        due_date TEXT,
        assigned_to_user_id INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE,
        FOREIGN KEY (completed_by_user_id) REFERENCES users(id),
        FOREIGN KEY (assigned_to_user_id) REFERENCES users(id)
      )
    `, []);

    console.log('✅ Checklist tables initialized');
  } catch (error: any) {
    console.log('ℹ️ Checklist tables already exist or error:', error.message);
  }
}

export class ChecklistModel {
  static async findById(id: number): Promise<Checklist | null> {
    const result = await query(
      `SELECT * FROM checklists WHERE id = $1`,
      [id]
    );
    const checklist = getRow(result);
    if (checklist) {
      checklist.items = await this.getItems(id);
      checklist.progress = this.calculateProgress(checklist.items);
    }
    return checklist;
  }

  static async findByEntity(entityType: string, entityId: number): Promise<Checklist[]> {
    const result = await query(
      `SELECT * FROM checklists WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC`,
      [entityType, entityId]
    );
    const checklists = getRows(result);
    for (const checklist of checklists) {
      checklist.items = await this.getItems(checklist.id);
      checklist.progress = this.calculateProgress(checklist.items);
    }
    return checklists;
  }

  static async findTemplates(): Promise<Checklist[]> {
    const result = await query(
      `SELECT * FROM checklists WHERE is_template = 1 ORDER BY name ASC`,
      []
    );
    const checklists = getRows(result);
    for (const checklist of checklists) {
      checklist.items = await this.getItems(checklist.id);
    }
    return checklists;
  }

  static async create(data: CreateChecklistData): Promise<Checklist> {
    const result = await query(
      `INSERT INTO checklists (name, description, entity_type, entity_id, is_template, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.name,
        data.description || null,
        data.entity_type,
        data.entity_id || null,
        data.is_template ? 1 : 0,
        data.created_by,
      ]
    );
    return getRow(result)!;
  }

  static async update(id: number, data: Partial<CreateChecklistData>): Promise<Checklist> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'created_by') {
        if (key === 'is_template' && typeof value === 'boolean') {
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
      `UPDATE checklists SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM checklists WHERE id = $1', [id]);
  }

  // Items
  static async getItems(checklistId: number): Promise<ChecklistItem[]> {
    const result = await query(
      `SELECT ci.*,
        u1.first_name || ' ' || u1.last_name as completed_by_name,
        u2.first_name || ' ' || u2.last_name as assigned_to_name
       FROM checklist_items ci
       LEFT JOIN users u1 ON ci.completed_by_user_id = u1.id
       LEFT JOIN users u2 ON ci.assigned_to_user_id = u2.id
       WHERE ci.checklist_id = $1
       ORDER BY ci.position_order ASC`,
      [checklistId]
    );
    return getRows(result);
  }

  static async addItem(data: CreateChecklistItemData): Promise<ChecklistItem> {
    let positionOrder = data.position_order;
    if (!positionOrder) {
      const orderResult = await query(
        `SELECT COALESCE(MAX(position_order), 0) + 1 as next_order
         FROM checklist_items WHERE checklist_id = $1`,
        [data.checklist_id]
      );
      const rows = getRows(orderResult);
      positionOrder = rows[0]?.next_order || 1;
    }

    const result = await query(
      `INSERT INTO checklist_items (checklist_id, title, description, position_order, due_date, assigned_to_user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.checklist_id,
        data.title,
        data.description || null,
        positionOrder,
        data.due_date || null,
        data.assigned_to_user_id || null,
      ]
    );
    return getRow(result)!;
  }

  static async updateItem(id: number, data: Partial<CreateChecklistItemData>): Promise<ChecklistItem> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'checklist_id') {
        fields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    });

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE checklist_items SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async toggleItem(id: number, userId: number): Promise<ChecklistItem> {
    const item = await query(`SELECT is_completed FROM checklist_items WHERE id = $1`, [id]);
    const currentItem = getRow(item);
    const isCompleted = !currentItem?.is_completed;

    const result = await query(
      `UPDATE checklist_items 
       SET is_completed = $1, 
           completed_at = $2, 
           completed_by_user_id = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [
        isCompleted ? 1 : 0,
        isCompleted ? new Date().toISOString() : null,
        isCompleted ? userId : null,
        id,
      ]
    );
    return getRow(result)!;
  }

  static async deleteItem(id: number): Promise<void> {
    await query('DELETE FROM checklist_items WHERE id = $1', [id]);
  }

  // Create checklist from template
  static async createFromTemplate(templateId: number, entityType: string, entityId: number, userId: number): Promise<Checklist> {
    const template = await this.findById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const newChecklist = await this.create({
      name: template.name,
      description: template.description,
      entity_type: entityType as any,
      entity_id: entityId,
      is_template: false,
      created_by: userId,
    });

    if (template.items) {
      for (const item of template.items) {
        await this.addItem({
          checklist_id: newChecklist.id,
          title: item.title,
          description: item.description,
          position_order: item.position_order,
        });
      }
    }

    return this.findById(newChecklist.id) as Promise<Checklist>;
  }

  private static calculateProgress(items?: ChecklistItem[]): number {
    if (!items || items.length === 0) return 0;
    const completed = items.filter(i => i.is_completed).length;
    return Math.round((completed / items.length) * 100);
  }
}







