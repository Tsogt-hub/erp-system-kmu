import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

export interface Item {
  id: number;
  name: string;
  sku?: string;
  description?: string;
  unit: string;
  price: number;
  category?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateItemData {
  name: string;
  sku?: string;
  description?: string;
  unit?: string;
  price?: number;
  category?: string;
}

export class ItemModel {
  static async findById(id: number): Promise<Item | null> {
    const result = await query('SELECT * FROM items WHERE id = $1', [id]);
    return getRow(result);
  }

  static async findBySKU(sku: string): Promise<Item | null> {
    const result = await query('SELECT * FROM items WHERE sku = $1', [sku]);
    return getRow(result);
  }

  static async findAll(): Promise<Item[]> {
    const result = await query('SELECT * FROM items WHERE is_active = 1 ORDER BY name ASC');
    return getRows(result);
  }

  static async search(searchTerm: string): Promise<Item[]> {
    const result = await query(
      `SELECT * FROM items 
       WHERE (name LIKE $1 OR sku LIKE $1 OR description LIKE $1) AND is_active = 1
       ORDER BY name ASC`,
      [`%${searchTerm}%`]
    );
    return getRows(result);
  }

  static async create(data: CreateItemData): Promise<Item> {
    const result = await query(
      `INSERT INTO items (name, sku, description, unit, price, category)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.name,
        data.sku || null,
        data.description || null,
        data.unit || 'Stück',
        data.price || 0,
        data.category || null,
      ]
    );
    return getRow(result)!;
  }

  static async update(id: number, data: Partial<CreateItemData>): Promise<Item> {
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
      `UPDATE items SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async delete(id: number): Promise<void> {
    await query('UPDATE items SET is_active = false WHERE id = $1', [id]);
  }
}

