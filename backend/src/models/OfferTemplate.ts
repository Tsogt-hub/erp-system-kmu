import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

export interface OfferTemplate {
  id: number;
  name: string;
  description?: string;
  intro_text?: string;
  footer_text?: string;
  payment_terms?: string;
  valid_days: number;
  tax_rate: number;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  created_user_name?: string;
}

export interface OfferTemplateItem {
  id: number;
  template_id: number;
  item_id?: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  purchase_price?: number;
  discount_percent?: number;
  tax_rate: number;
  position_order: number;
  item_type: string;
  item_name?: string;
  item_sku?: string;
}

export interface CreateOfferTemplateData {
  name: string;
  description?: string;
  intro_text?: string;
  footer_text?: string;
  payment_terms?: string;
  valid_days?: number;
  tax_rate?: number;
  is_active?: boolean;
  created_by: number;
}

export interface CreateOfferTemplateItemData {
  template_id: number;
  item_id?: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  purchase_price?: number;
  discount_percent?: number;
  tax_rate?: number;
  position_order?: number;
  item_type?: string;
}

export async function initOfferTemplatesTable(): Promise<void> {
  try {
    // Templates table
    await query(`
      CREATE TABLE IF NOT EXISTS offer_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        intro_text TEXT,
        footer_text TEXT,
        payment_terms TEXT,
        valid_days INTEGER DEFAULT 21,
        tax_rate REAL DEFAULT 19,
        is_active INTEGER DEFAULT 1,
        created_by INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `, []);

    // Template items table
    await query(`
      CREATE TABLE IF NOT EXISTS offer_template_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_id INTEGER NOT NULL,
        item_id INTEGER,
        description TEXT NOT NULL,
        quantity REAL DEFAULT 1,
        unit TEXT DEFAULT 'Stk',
        unit_price REAL DEFAULT 0,
        purchase_price REAL,
        discount_percent REAL DEFAULT 0,
        tax_rate REAL DEFAULT 19,
        position_order INTEGER DEFAULT 1,
        item_type TEXT DEFAULT 'standard',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES offer_templates(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items(id)
      )
    `, []);

    console.log('✅ Offer templates tables initialized');
  } catch (error: any) {
    console.log('ℹ️ Offer templates tables already exist or error:', error.message);
  }
}

export class OfferTemplateModel {
  static async findById(id: number): Promise<OfferTemplate | null> {
    const result = await query(
      `SELECT t.*, u.first_name || ' ' || u.last_name as created_user_name
       FROM offer_templates t
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.id = $1`,
      [id]
    );
    return getRow(result);
  }

  static async findAll(activeOnly: boolean = true): Promise<OfferTemplate[]> {
    let queryText = `
      SELECT t.*, u.first_name || ' ' || u.last_name as created_user_name
      FROM offer_templates t
      LEFT JOIN users u ON t.created_by = u.id
    `;
    if (activeOnly) {
      queryText += ` WHERE t.is_active = 1`;
    }
    queryText += ` ORDER BY t.name ASC`;
    
    const result = await query(queryText, []);
    return getRows(result);
  }

  static async create(data: CreateOfferTemplateData): Promise<OfferTemplate> {
    const result = await query(
      `INSERT INTO offer_templates (name, description, intro_text, footer_text, payment_terms, valid_days, tax_rate, is_active, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.name,
        data.description || null,
        data.intro_text || null,
        data.footer_text || null,
        data.payment_terms || null,
        data.valid_days || 21,
        data.tax_rate || 19,
        data.is_active !== false ? 1 : 0,
        data.created_by,
      ]
    );
    return getRow(result)!;
  }

  static async update(id: number, data: Partial<CreateOfferTemplateData>): Promise<OfferTemplate> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'created_by') {
        if (key === 'is_active' && typeof value === 'boolean') {
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
      `UPDATE offer_templates SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM offer_templates WHERE id = $1', [id]);
  }

  // Template Items
  static async getItems(templateId: number): Promise<OfferTemplateItem[]> {
    const result = await query(
      `SELECT ti.*, i.name as item_name, i.sku as item_sku
       FROM offer_template_items ti
       LEFT JOIN items i ON ti.item_id = i.id
       WHERE ti.template_id = $1
       ORDER BY ti.position_order ASC`,
      [templateId]
    );
    return getRows(result);
  }

  static async addItem(data: CreateOfferTemplateItemData): Promise<OfferTemplateItem> {
    let positionOrder = data.position_order;
    if (!positionOrder) {
      const orderResult = await query(
        `SELECT COALESCE(MAX(position_order), 0) + 1 as next_order
         FROM offer_template_items WHERE template_id = $1`,
        [data.template_id]
      );
      const rows = getRows(orderResult);
      positionOrder = rows[0]?.next_order || 1;
    }

    const result = await query(
      `INSERT INTO offer_template_items (template_id, item_id, description, quantity, unit, unit_price, purchase_price, discount_percent, tax_rate, position_order, item_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        data.template_id,
        data.item_id || null,
        data.description,
        data.quantity,
        data.unit,
        data.unit_price,
        data.purchase_price || null,
        data.discount_percent || 0,
        data.tax_rate || 19,
        positionOrder,
        data.item_type || 'standard',
      ]
    );
    return getRow(result)!;
  }

  static async updateItem(id: number, data: Partial<CreateOfferTemplateItemData>): Promise<OfferTemplateItem> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'template_id') {
        fields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    });

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE offer_template_items SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async deleteItem(id: number): Promise<void> {
    await query('DELETE FROM offer_template_items WHERE id = $1', [id]);
  }

  // Create offer from template
  static async createOfferFromTemplate(templateId: number, offerId: number): Promise<void> {
    const items = await this.getItems(templateId);
    
    for (const item of items) {
      await query(
        `INSERT INTO offer_items (offer_id, item_id, description, quantity, unit, unit_price, purchase_price, discount_percent, tax_rate, position_order, item_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          offerId,
          item.item_id,
          item.description,
          item.quantity,
          item.unit,
          item.unit_price,
          item.purchase_price,
          item.discount_percent,
          item.tax_rate,
          item.position_order,
          item.item_type,
        ]
      );
    }
  }
}







