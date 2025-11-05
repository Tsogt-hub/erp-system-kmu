import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

export interface Offer {
  id: number;
  offer_number: string;
  project_id?: number;
  customer_id?: number;
  amount: number;
  tax_rate: number;
  status: string;
  valid_until?: Date;
  notes?: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
  customer_name?: string;
  project_name?: string;
  created_user_name?: string;
}

export interface CreateOfferData {
  offer_number?: string;
  project_id?: number;
  customer_id?: number;
  amount: number;
  tax_rate?: number;
  status?: string;
  valid_until?: Date;
  notes?: string;
  created_by: number;
}

export class OfferModel {
  static async findById(id: number): Promise<Offer | null> {
    const result = await query(
      `SELECT o.*, c.name as customer_name, p.name as project_name,
              u.first_name || ' ' || u.last_name as created_user_name
       FROM offers o
       LEFT JOIN companies c ON o.customer_id = c.id
       LEFT JOIN projects p ON o.project_id = p.id
       LEFT JOIN users u ON o.created_by = u.id
       WHERE o.id = $1`,
      [id]
    );
    return getRow(result);
  }

  static async findAll(): Promise<Offer[]> {
    const result = await query(
      `SELECT o.*, c.name as customer_name, p.name as project_name,
              u.first_name || ' ' || u.last_name as created_user_name
       FROM offers o
       LEFT JOIN companies c ON o.customer_id = c.id
       LEFT JOIN projects p ON o.project_id = p.id
       LEFT JOIN users u ON o.created_by = u.id
       ORDER BY o.created_at DESC`
    );
    return getRows(result);
  }

  static async findByStatus(status: string): Promise<Offer[]> {
    const result = await query(
      `SELECT o.*, c.name as customer_name, p.name as project_name,
              u.first_name || ' ' || u.last_name as created_user_name
       FROM offers o
       LEFT JOIN companies c ON o.customer_id = c.id
       LEFT JOIN projects p ON o.project_id = p.id
       LEFT JOIN users u ON o.created_by = u.id
       WHERE o.status = $1
       ORDER BY o.created_at DESC`,
      [status]
    );
    return getRows(result);
  }

  static async generateOfferNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const result = await query(
      `SELECT COUNT(*) as count FROM offers WHERE offer_number LIKE $1`,
      [`ANG-${year}-%`]
    );
    const rows = getRows(result);
    const count = parseInt(rows[0]?.count || '0') + 1;
    return `ANG-${year}-${count.toString().padStart(4, '0')}`;
  }

  static async create(data: CreateOfferData): Promise<Offer> {
    const offerNumber = data.offer_number || await this.generateOfferNumber();
    
    const result = await query(
      `INSERT INTO offers (offer_number, project_id, customer_id, amount, tax_rate, status, valid_until, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        offerNumber,
        data.project_id || null,
        data.customer_id || null,
        data.amount,
        data.tax_rate || 19.00,
        data.status || 'draft',
        data.valid_until || null,
        data.notes || null,
        data.created_by,
      ]
    );
    return getRow(result)!;
  }

  static async update(id: number, data: Partial<CreateOfferData>): Promise<Offer> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'created_by' && key !== 'offer_number') {
        fields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    });

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE offers SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM offers WHERE id = $1', [id]);
  }
}

