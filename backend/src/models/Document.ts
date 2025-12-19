import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

// Dokumenttypen wie in Hero
export const DOCUMENT_TYPES = [
  'offer',           // Angebot
  'order_confirmation', // Auftragsbestätigung (AB)
  'invoice',         // Rechnung
  'partial_invoice', // Teilrechnung
  'material_list',   // Materialliste
  'delivery_note',   // Lieferschein
  'reminder',        // Mahnung
  'credit_note',     // Gutschrift
];

// Dokumentstatus
export const DOCUMENT_STATUSES = [
  'draft',           // Entwurf
  'sent',            // Versendet
  'accepted',        // Angenommen
  'rejected',        // Abgelehnt
  'paid',            // Bezahlt
  'overdue',         // Überfällig
  'cancelled',       // Storniert
];

export interface Document {
  id: number;
  document_type: string;
  document_number: string;
  reference_id?: number;       // Referenz zu Angebot/Auftrag
  reference_type?: string;     // 'offer', 'order', etc.
  project_id?: number;
  customer_id?: number;
  contact_id?: number;
  // Beträge
  net_amount: number;
  tax_amount: number;
  gross_amount: number;
  tax_rate: number;
  discount_amount?: number;
  discount_percent?: number;
  // Daten
  document_date: string;
  valid_until?: string;
  delivery_date?: string;
  due_date?: string;
  // Texte
  subject?: string;
  intro_text?: string;
  footer_text?: string;
  payment_terms?: string;
  notes?: string;
  internal_notes?: string;
  // Status
  status: string;
  sent_at?: string;
  paid_at?: string;
  // Meta
  created_by: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  customer_name?: string;
  project_name?: string;
  contact_name?: string;
  created_user_name?: string;
}

export interface CreateDocumentData {
  document_type: string;
  document_number?: string;
  reference_id?: number;
  reference_type?: string;
  project_id?: number;
  customer_id?: number;
  contact_id?: number;
  net_amount: number;
  tax_amount?: number;
  gross_amount?: number;
  tax_rate?: number;
  discount_amount?: number;
  discount_percent?: number;
  document_date?: string;
  valid_until?: string;
  delivery_date?: string;
  due_date?: string;
  subject?: string;
  intro_text?: string;
  footer_text?: string;
  payment_terms?: string;
  notes?: string;
  internal_notes?: string;
  status?: string;
  created_by: number;
}

export async function initDocumentsTable(): Promise<void> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_type TEXT NOT NULL,
        document_number TEXT NOT NULL UNIQUE,
        reference_id INTEGER,
        reference_type TEXT,
        project_id INTEGER,
        customer_id INTEGER,
        contact_id INTEGER,
        net_amount REAL NOT NULL DEFAULT 0,
        tax_amount REAL NOT NULL DEFAULT 0,
        gross_amount REAL NOT NULL DEFAULT 0,
        tax_rate REAL NOT NULL DEFAULT 19,
        discount_amount REAL,
        discount_percent REAL,
        document_date TEXT NOT NULL,
        valid_until TEXT,
        delivery_date TEXT,
        due_date TEXT,
        subject TEXT,
        intro_text TEXT,
        footer_text TEXT,
        payment_terms TEXT,
        notes TEXT,
        internal_notes TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        sent_at TEXT,
        paid_at TEXT,
        created_by INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id),
        FOREIGN KEY (customer_id) REFERENCES companies(id),
        FOREIGN KEY (contact_id) REFERENCES contacts(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `, []);
    console.log('✅ Documents table initialized');
  } catch (error: any) {
    console.log('ℹ️ Documents table already exists or error:', error.message);
  }
}

export class DocumentModel {
  static async findById(id: number): Promise<Document | null> {
    const result = await query(
      `SELECT d.*,
        c.name as customer_name,
        p.name as project_name,
        co.first_name || ' ' || co.last_name as contact_name,
        u.first_name || ' ' || u.last_name as created_user_name
       FROM documents d
       LEFT JOIN companies c ON d.customer_id = c.id
       LEFT JOIN projects p ON d.project_id = p.id
       LEFT JOIN contacts co ON d.contact_id = co.id
       LEFT JOIN users u ON d.created_by = u.id
       WHERE d.id = $1`,
      [id]
    );
    return getRow(result);
  }

  static async findByType(documentType: string): Promise<Document[]> {
    const result = await query(
      `SELECT d.*,
        c.name as customer_name,
        p.name as project_name,
        co.first_name || ' ' || co.last_name as contact_name,
        u.first_name || ' ' || u.last_name as created_user_name
       FROM documents d
       LEFT JOIN companies c ON d.customer_id = c.id
       LEFT JOIN projects p ON d.project_id = p.id
       LEFT JOIN contacts co ON d.contact_id = co.id
       LEFT JOIN users u ON d.created_by = u.id
       WHERE d.document_type = $1
       ORDER BY d.created_at DESC`,
      [documentType]
    );
    return getRows(result);
  }

  static async findByProject(projectId: number): Promise<Document[]> {
    const result = await query(
      `SELECT d.*,
        c.name as customer_name,
        p.name as project_name,
        co.first_name || ' ' || co.last_name as contact_name,
        u.first_name || ' ' || u.last_name as created_user_name
       FROM documents d
       LEFT JOIN companies c ON d.customer_id = c.id
       LEFT JOIN projects p ON d.project_id = p.id
       LEFT JOIN contacts co ON d.contact_id = co.id
       LEFT JOIN users u ON d.created_by = u.id
       WHERE d.project_id = $1
       ORDER BY d.created_at DESC`,
      [projectId]
    );
    return getRows(result);
  }

  static async findByCustomer(customerId: number): Promise<Document[]> {
    const result = await query(
      `SELECT d.*,
        c.name as customer_name,
        p.name as project_name,
        co.first_name || ' ' || co.last_name as contact_name,
        u.first_name || ' ' || u.last_name as created_user_name
       FROM documents d
       LEFT JOIN companies c ON d.customer_id = c.id
       LEFT JOIN projects p ON d.project_id = p.id
       LEFT JOIN contacts co ON d.contact_id = co.id
       LEFT JOIN users u ON d.created_by = u.id
       WHERE d.customer_id = $1
       ORDER BY d.created_at DESC`,
      [customerId]
    );
    return getRows(result);
  }

  static async generateDocumentNumber(documentType: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefixes: Record<string, string> = {
      'offer': 'ANG',
      'order_confirmation': 'AB',
      'invoice': 'RE',
      'partial_invoice': 'TR',
      'material_list': 'ML',
      'delivery_note': 'LS',
      'reminder': 'MA',
      'credit_note': 'GS',
    };
    const prefix = prefixes[documentType] || 'DOK';
    
    const result = await query(
      `SELECT COUNT(*) as count FROM documents WHERE document_number LIKE $1`,
      [`${prefix}-${year}-%`]
    );
    const rows = getRows(result);
    const count = parseInt(rows[0]?.count || '0') + 1;
    return `${prefix}-${year}-${count.toString().padStart(4, '0')}`;
  }

  static async create(data: CreateDocumentData): Promise<Document> {
    const documentNumber = data.document_number || await this.generateDocumentNumber(data.document_type);
    const documentDate = data.document_date || new Date().toISOString().split('T')[0];
    const taxRate = data.tax_rate || 19;
    const taxAmount = data.tax_amount || (data.net_amount * taxRate / 100);
    const grossAmount = data.gross_amount || (data.net_amount + taxAmount);

    const result = await query(
      `INSERT INTO documents (
        document_type, document_number, reference_id, reference_type,
        project_id, customer_id, contact_id,
        net_amount, tax_amount, gross_amount, tax_rate,
        discount_amount, discount_percent,
        document_date, valid_until, delivery_date, due_date,
        subject, intro_text, footer_text, payment_terms,
        notes, internal_notes, status, created_by
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
       RETURNING *`,
      [
        data.document_type,
        documentNumber,
        data.reference_id || null,
        data.reference_type || null,
        data.project_id || null,
        data.customer_id || null,
        data.contact_id || null,
        data.net_amount,
        taxAmount,
        grossAmount,
        taxRate,
        data.discount_amount || null,
        data.discount_percent || null,
        documentDate,
        data.valid_until || null,
        data.delivery_date || null,
        data.due_date || null,
        data.subject || null,
        data.intro_text || null,
        data.footer_text || null,
        data.payment_terms || null,
        data.notes || null,
        data.internal_notes || null,
        data.status || 'draft',
        data.created_by,
      ]
    );
    return getRow(result)!;
  }

  static async update(id: number, data: Partial<CreateDocumentData>): Promise<Document> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'created_by' && key !== 'document_number') {
        fields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    });

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE documents SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async updateStatus(id: number, status: string, additionalData?: { sent_at?: string; paid_at?: string }): Promise<Document> {
    let queryText = `UPDATE documents SET status = $1, updated_at = CURRENT_TIMESTAMP`;
    const params: any[] = [status];
    let paramCount = 2;

    if (additionalData?.sent_at) {
      queryText += `, sent_at = $${paramCount++}`;
      params.push(additionalData.sent_at);
    }
    if (additionalData?.paid_at) {
      queryText += `, paid_at = $${paramCount++}`;
      params.push(additionalData.paid_at);
    }

    queryText += ` WHERE id = $${paramCount} RETURNING *`;
    params.push(id);

    const result = await query(queryText, params);
    return getRow(result)!;
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM documents WHERE id = $1', [id]);
  }

  // Erstellt ein Dokument aus einem Angebot
  static async createFromOffer(offerId: number, documentType: string, userId: number): Promise<Document> {
    // Hole Angebotsdaten
    const offerResult = await query(
      `SELECT o.*, c.name as customer_name, p.name as project_name
       FROM offers o
       LEFT JOIN companies c ON o.customer_id = c.id
       LEFT JOIN projects p ON o.project_id = p.id
       WHERE o.id = $1`,
      [offerId]
    );
    const offer = getRow(offerResult);
    if (!offer) {
      throw new Error('Angebot nicht gefunden');
    }

    // Erstelle neues Dokument
    return this.create({
      document_type: documentType,
      reference_id: offerId,
      reference_type: 'offer',
      project_id: offer.project_id,
      customer_id: offer.customer_id,
      net_amount: offer.amount,
      tax_rate: offer.tax_rate,
      notes: offer.notes,
      created_by: userId,
    });
  }
}







