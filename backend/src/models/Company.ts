import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

export interface Company {
  id: number;
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  tax_id?: string;
  website?: string;
  notes?: string;
  category?: string;
  type?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCompanyData {
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  tax_id?: string;
  website?: string;
  notes?: string;
}

export class CompanyModel {
  static async findById(id: number): Promise<Company | null> {
    const result = await query('SELECT * FROM companies WHERE id = $1', [id]);
    return getRow(result);
  }

  static async findAll(): Promise<Company[]> {
    const result = await query(
      'SELECT * FROM companies ORDER BY name ASC'
    );
    return getRows(result);
  }

  static async search(searchTerm: string): Promise<Company[]> {
    const result = await query(
      `SELECT * FROM companies 
       WHERE name LIKE $1 OR email LIKE $1 OR phone LIKE $1
       ORDER BY name ASC`,
      [`%${searchTerm}%`]
    );
    return getRows(result);
  }

  static async create(data: CreateCompanyData): Promise<Company> {
    const result = await query(
      `INSERT INTO companies (name, address, city, postal_code, country, phone, email, tax_id, website, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.name,
        data.address || null,
        data.city || null,
        data.postal_code || null,
        data.country || null,
        data.phone || null,
        data.email || null,
        data.tax_id || null,
        data.website || null,
        data.notes || null,
      ]
    );
    return getRow(result)!;
  }

  static async update(id: number, data: Partial<CreateCompanyData>): Promise<Company> {
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
      `UPDATE companies SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM companies WHERE id = $1', [id]);
  }
}

