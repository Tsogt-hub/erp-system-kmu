import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

export interface Warehouse {
  id: number;
  name: string;
  address?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateWarehouseData {
  name: string;
  address?: string;
}

export class WarehouseModel {
  static async findById(id: number): Promise<Warehouse | null> {
    const result = await query('SELECT * FROM warehouses WHERE id = $1 AND is_active = 1', [id]);
    return getRow(result);
  }

  static async findAll(): Promise<Warehouse[]> {
    const result = await query('SELECT * FROM warehouses WHERE is_active = 1 ORDER BY name ASC');
    return getRows(result);
  }

  static async create(data: CreateWarehouseData): Promise<Warehouse> {
    const result = await query(
      `INSERT INTO warehouses (name, address)
       VALUES ($1, $2)
       RETURNING *`,
      [data.name, data.address || null]
    );
    return getRow(result)!;
  }

  static async update(id: number, data: Partial<CreateWarehouseData>): Promise<Warehouse> {
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
      `UPDATE warehouses SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async delete(id: number): Promise<void> {
    await query('UPDATE warehouses SET is_active = false WHERE id = $1', [id]);
  }
}




