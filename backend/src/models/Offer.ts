import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

export type OfferStatus = 'draft' | 'finalized' | 'sent' | 'accepted' | 'rejected';

export interface Offer {
  id: number;
  offer_number: string;
  project_id?: number;
  customer_id?: number;
  contact_id?: number;
  amount: number;
  tax_rate: number;
  status: OfferStatus;
  valid_until?: Date;
  notes?: string;
  intro_text?: string;
  footer_text?: string;
  payment_terms?: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
  finalized_at?: Date;
  customer_name?: string;
  contact_name?: string;
  project_name?: string;
  created_user_name?: string;
}

export interface CreateOfferData {
  offer_number?: string;
  project_id?: number;
  customer_id?: number;
  contact_id?: number;
  amount: number;
  tax_rate?: number;
  status?: OfferStatus;
  valid_until?: Date;
  notes?: string;
  intro_text?: string;
  footer_text?: string;
  payment_terms?: string;
  created_by: number;
}

export class OfferModel {
  static async findById(id: number): Promise<Offer | null> {
    const result = await query(
      `SELECT o.*, c.name as customer_name, p.name as project_name,
              u.first_name || ' ' || u.last_name as created_user_name,
              con.first_name || ' ' || con.last_name as contact_name
       FROM offers o
       LEFT JOIN companies c ON o.customer_id = c.id
       LEFT JOIN contacts con ON o.contact_id = con.id
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
              u.first_name || ' ' || u.last_name as created_user_name,
              con.first_name || ' ' || con.last_name as contact_name
       FROM offers o
       LEFT JOIN companies c ON o.customer_id = c.id
       LEFT JOIN contacts con ON o.contact_id = con.id
       LEFT JOIN projects p ON o.project_id = p.id
       LEFT JOIN users u ON o.created_by = u.id
       ORDER BY o.created_at DESC`
    );
    return getRows(result);
  }

  static async findByStatus(status: string): Promise<Offer[]> {
    const result = await query(
      `SELECT o.*, c.name as customer_name, p.name as project_name,
              u.first_name || ' ' || u.last_name as created_user_name,
              con.first_name || ' ' || con.last_name as contact_name
       FROM offers o
       LEFT JOIN companies c ON o.customer_id = c.id
       LEFT JOIN contacts con ON o.contact_id = con.id
       LEFT JOIN projects p ON o.project_id = p.id
       LEFT JOIN users u ON o.created_by = u.id
       WHERE o.status = $1
       ORDER BY o.created_at DESC`,
      [status]
    );
    return getRows(result);
  }

  static async findByProject(projectId: number): Promise<Offer[]> {
    const result = await query(
      `SELECT o.*, c.name as customer_name, p.name as project_name,
              u.first_name || ' ' || u.last_name as created_user_name,
              con.first_name || ' ' || con.last_name as contact_name
       FROM offers o
       LEFT JOIN companies c ON o.customer_id = c.id
       LEFT JOIN contacts con ON o.contact_id = con.id
       LEFT JOIN projects p ON o.project_id = p.id
       LEFT JOIN users u ON o.created_by = u.id
       WHERE o.project_id = $1
       ORDER BY o.created_at DESC`,
      [projectId]
    );
    return getRows(result);
  }

  static async generateDraftNumber(): Promise<string> {
    // Entwürfe bekommen kürzere temporäre Nummern (Jahr + Zufallsnummer)
    const year = new Date().getFullYear();
    const randomPart = Math.floor(Math.random() * 9000) + 1000; // 4-stellige Zahl
    return `ENTW-${year}-${randomPart}`;
  }

  static async generateOfferNumber(): Promise<string> {
    // Offizielle Angebotsnummer nur bei Finalisierung
    const result = await query(
      `SELECT MAX(CAST(SUBSTR(offer_number, 5) AS INTEGER)) as max_num 
       FROM offers 
       WHERE offer_number LIKE 'ANG-%' AND status != 'draft'`
    );
    const rows = getRows(result);
    const nextNum = (parseInt(rows[0]?.max_num || '0') || 0) + 1;
    return `ANG-${nextNum}`;
  }

  static async finalize(id: number): Promise<Offer> {
    // Offizielle Nummer vergeben und Status auf finalized setzen
    const newNumber = await this.generateOfferNumber();
    const result = await query(
      `UPDATE offers 
       SET offer_number = $1, 
           status = 'finalized', 
           finalized_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND status = 'draft'
       RETURNING *`,
      [newNumber, id]
    );
    const offer = getRow(result);
    if (!offer) {
      throw new Error('Angebot nicht gefunden oder bereits finalisiert');
    }
    return offer;
  }

  static async create(data: CreateOfferData): Promise<Offer> {
    // Für neue Angebote: Entwurfsnummer verwenden
    const offerNumber = data.offer_number || await this.generateDraftNumber();
    
    const result = await query(
      `INSERT INTO offers (offer_number, project_id, customer_id, contact_id, amount, tax_rate, status, valid_until, notes, intro_text, footer_text, payment_terms, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        offerNumber,
        data.project_id || null,
        data.customer_id || null,
        data.contact_id || null,
        data.amount,
        data.tax_rate || 19.00,
        data.status || 'draft',
        data.valid_until || null,
        data.notes || null,
        data.intro_text || 'Vielen Dank für Ihr Interesse. Gerne unterbreiten wir Ihnen folgendes Angebot:',
        data.footer_text || null,
        data.payment_terms || 'Zahlbar innerhalb von 14 Tagen nach Rechnungserhalt ohne Abzug.',
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

