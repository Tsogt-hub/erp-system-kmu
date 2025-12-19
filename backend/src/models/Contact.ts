import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

// Lead-Quellen wie in Hero
export const LEAD_SOURCES = [
  'E-Mail',
  'Persönlicher Kontakt',
  'Messe',
  'Social Media',
  'Online-Portal',
  'Telefon',
  'Eigene Webseite',
  'Empfehlung',
  'Bestandskunde',
  'Außenwerbung',
  'Netzwerk',
  'Interessent',
  'Flyer / Prospekt',
  'Fahrzeugwerbung',
  'Sonstige',
];

// Erreichbarkeit wie in Hero
export const REACHABILITY_OPTIONS = [
  'Vormittags',
  'Nachmittags',
  'Abends',
  'Ganztags',
  'Nur am Wochenende',
  'ausschließlich per E-Mail',
  'Sonstige',
];

// Anrede-Optionen wie in Hero
export const SALUTATION_OPTIONS = [
  'Herr',
  'Frau',
  'Familie',
  'Eheleute',
  'Dr.',
  'Prof.',
  'Prof. Dr.',
];

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
  city?: string;
  country?: string;
  availability?: string;
  // Neue Hero-Felder
  salutation?: string;
  lead_source?: string;
  website?: string;
  fax?: string;
  birthday?: string;
  is_invoice_recipient?: boolean;
  additional_salutation?: string;
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
  city?: string;
  country?: string;
  availability?: string;
  // Neue Hero-Felder
  salutation?: string;
  lead_source?: string;
  website?: string;
  fax?: string;
  birthday?: string;
  is_invoice_recipient?: boolean;
  additional_salutation?: string;
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
      conditions.push(`(c.is_archived = false OR c.is_archived IS NULL)`);
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
      `INSERT INTO contacts (
        company_id, first_name, last_name, email, phone, mobile, position, notes, 
        category, type, customer_number, address, postal_code, city, country, availability,
        salutation, lead_source, website, fax, birthday, is_invoice_recipient, additional_salutation
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
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
        data.category || 'contact',
        data.type || 'person',
        data.customer_number || null,
        data.address || null,
        data.postal_code || null,
        data.city || null,
        data.country || null,
        data.availability || null,
        data.salutation || null,
        data.lead_source || null,
        data.website || null,
        data.fax || null,
        data.birthday || null,
        data.is_invoice_recipient ? 1 : 0,
        data.additional_salutation || null,
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

