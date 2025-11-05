import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

export interface Contact {
  id: number;
  company_id?: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  notes?: string;
  category?: string;
  type?: string;
  is_archived?: boolean;
  customer_number?: string;
  address?: string;
  postal_code?: string;
  availability?: string;
  created_at: Date;
  updated_at: Date;
  company_name?: string;
}

export interface CreateContactData {
  company_id?: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  notes?: string;
  category?: string;
  type?: string;
  is_archived?: boolean;
  customer_number?: string;
  address?: string;
  postal_code?: string;
  availability?: string;
}

export class ContactModel {
  static async findById(id: number): Promise<Contact | null> {
    const result = await query(
      `SELECT c.*, co.name as company_name 
       FROM contacts c 
       LEFT JOIN companies co ON c.company_id = co.id 
       WHERE c.id = $1`,
      [id]
    );
    return getRow(result);
  }

  static async findAll(category?: string, type?: string, includeArchived: boolean = false): Promise<Contact[]> {
    let queryText = `
      SELECT c.*, co.name as company_name 
      FROM contacts c 
      LEFT JOIN companies co ON c.company_id = co.id 
    `;
    const conditions: string[] = [];
    const params: any[] = [];

    if (!includeArchived) {
      conditions.push(`(c.is_archived = 0 OR c.is_archived IS NULL OR c.is_archived = false)`);
    }

    if (category) {
      conditions.push(`c.category = $${params.length + 1}`);
      params.push(category);
    }

    if (type) {
      conditions.push(`c.type = $${params.length + 1}`);
      params.push(type);
    }

    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(' AND ')}`;
    }

    queryText += ` ORDER BY c.last_name, c.first_name ASC`;

    const result = await query(queryText, params);
    return getRows(result);
  }

  static async findByCompany(companyId: number): Promise<Contact[]> {
    const result = await query(
      `SELECT c.*, co.name as company_name 
       FROM contacts c 
       LEFT JOIN companies co ON c.company_id = co.id 
       WHERE c.company_id = $1 
       ORDER BY c.last_name, c.first_name ASC`,
      [companyId]
    );
    return getRows(result);
  }

  static async search(searchTerm: string): Promise<Contact[]> {
    const result = await query(
      `SELECT c.*, co.name as company_name 
       FROM contacts c 
       LEFT JOIN companies co ON c.company_id = co.id 
       WHERE c.first_name LIKE $1 OR c.last_name LIKE $1 OR c.email LIKE $1 OR c.phone LIKE $1
       ORDER BY c.last_name, c.first_name ASC`,
      [`%${searchTerm}%`]
    );
    return getRows(result);
  }

  static async create(data: CreateContactData): Promise<Contact> {
    const result = await query(
      `INSERT INTO contacts (company_id, first_name, last_name, email, phone, mobile, position, notes, category, type, customer_number, address, postal_code, availability)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        data.company_id || null,
        data.first_name,
        data.last_name,
        data.email || null,
        data.phone || null,
        data.mobile || null,
        data.position || null,
        data.notes || null,
        (data as any).category || 'contact',
        (data as any).type || 'person',
        data.customer_number || null,
        data.address || null,
        data.postal_code || null,
        data.availability || null,
      ]
    );
    return getRow(result)!;
  }

  static async update(id: number, data: Partial<CreateContactData>): Promise<Contact> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        // Handle boolean values for SQLite
        if (key === 'is_archived' && typeof value === 'boolean') {
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
      `UPDATE contacts SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM contacts WHERE id = $1', [id]);
  }
}

