import { pool } from '../config/database';

export interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: Date;
  due_date: Date;
  contact_id: number;
  company_id?: number;
  offer_id?: number;
  status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  currency: string;
  payment_terms?: string;
  notes?: string;
  footer_text?: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateInvoiceData {
  invoice_date: Date;
  due_date: Date;
  contact_id: number;
  company_id?: number;
  offer_id?: number;
  status?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount?: number;
  total_amount: number;
  currency?: string;
  payment_terms?: string;
  notes?: string;
  footer_text?: string;
  created_by: number;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  item_type: 'article' | 'service' | 'text' | 'title';
  item_id?: number;
  title: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
  total_price: number;
  position: number;
  created_at: Date;
}

export interface CreateInvoiceItemData {
  invoice_id: number;
  item_type: 'article' | 'service' | 'text' | 'title';
  item_id?: number;
  title: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent?: number;
  tax_rate: number;
  total_price: number;
  position: number;
}

export class InvoiceModel {
  static async findById(id: number): Promise<Invoice | null> {
    const result = await pool.query(
      `SELECT i.*, 
        c.first_name || ' ' || c.last_name as contact_name,
        comp.name as company_name
       FROM invoices i
       LEFT JOIN contacts c ON i.contact_id = c.id
       LEFT JOIN companies comp ON i.company_id = comp.id
       WHERE i.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async findAll(filters?: {
    status?: string;
    contact_id?: number;
    company_id?: number;
    from_date?: Date;
    to_date?: Date;
  }): Promise<Invoice[]> {
    let query = `
      SELECT i.*, 
        c.first_name || ' ' || c.last_name as contact_name,
        comp.name as company_name
      FROM invoices i
      LEFT JOIN contacts c ON i.contact_id = c.id
      LEFT JOIN companies comp ON i.company_id = comp.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (filters?.status) {
      query += ` AND i.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters?.contact_id) {
      query += ` AND i.contact_id = $${paramCount}`;
      params.push(filters.contact_id);
      paramCount++;
    }

    if (filters?.company_id) {
      query += ` AND i.company_id = $${paramCount}`;
      params.push(filters.company_id);
      paramCount++;
    }

    if (filters?.from_date) {
      query += ` AND i.invoice_date >= $${paramCount}`;
      params.push(filters.from_date);
      paramCount++;
    }

    if (filters?.to_date) {
      query += ` AND i.invoice_date <= $${paramCount}`;
      params.push(filters.to_date);
      paramCount++;
    }

    query += ' ORDER BY i.invoice_date DESC, i.invoice_number DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async create(data: CreateInvoiceData): Promise<Invoice> {
    // Generate invoice number
    const year = new Date(data.invoice_date).getFullYear();
    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM invoices WHERE EXTRACT(YEAR FROM invoice_date) = $1`,
      [year]
    );
    const count = parseInt(countResult.rows[0].count) + 1;
    const invoice_number = `RE-${year}-${count.toString().padStart(4, '0')}`;

    const result = await pool.query(
      `INSERT INTO invoices (
        invoice_number, invoice_date, due_date, contact_id, company_id, offer_id,
        status, subtotal, tax_rate, tax_amount, discount_amount, total_amount,
        paid_amount, currency, payment_terms, notes, footer_text, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        invoice_number,
        data.invoice_date,
        data.due_date,
        data.contact_id,
        data.company_id || null,
        data.offer_id || null,
        data.status || 'draft',
        data.subtotal,
        data.tax_rate,
        data.tax_amount,
        data.discount_amount || 0,
        data.total_amount,
        0, // paid_amount initially 0
        data.currency || 'EUR',
        data.payment_terms || null,
        data.notes || null,
        data.footer_text || null,
        data.created_by,
      ]
    );
    return result.rows[0];
  }

  static async update(id: number, data: Partial<CreateInvoiceData>): Promise<Invoice | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.invoice_date !== undefined) {
      fields.push(`invoice_date = $${paramCount}`);
      values.push(data.invoice_date);
      paramCount++;
    }

    if (data.due_date !== undefined) {
      fields.push(`due_date = $${paramCount}`);
      values.push(data.due_date);
      paramCount++;
    }

    if (data.status !== undefined) {
      fields.push(`status = $${paramCount}`);
      values.push(data.status);
      paramCount++;
    }

    if (data.subtotal !== undefined) {
      fields.push(`subtotal = $${paramCount}`);
      values.push(data.subtotal);
      paramCount++;
    }

    if (data.tax_amount !== undefined) {
      fields.push(`tax_amount = $${paramCount}`);
      values.push(data.tax_amount);
      paramCount++;
    }

    if (data.discount_amount !== undefined) {
      fields.push(`discount_amount = $${paramCount}`);
      values.push(data.discount_amount);
      paramCount++;
    }

    if (data.total_amount !== undefined) {
      fields.push(`total_amount = $${paramCount}`);
      values.push(data.total_amount);
      paramCount++;
    }

    if (data.payment_terms !== undefined) {
      fields.push(`payment_terms = $${paramCount}`);
      values.push(data.payment_terms);
      paramCount++;
    }

    if (data.notes !== undefined) {
      fields.push(`notes = $${paramCount}`);
      values.push(data.notes);
      paramCount++;
    }

    if (data.footer_text !== undefined) {
      fields.push(`footer_text = $${paramCount}`);
      values.push(data.footer_text);
      paramCount++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE invoices SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  static async updatePayment(id: number, paid_amount: number): Promise<Invoice | null> {
    const invoice = await this.findById(id);
    if (!invoice) return null;

    const newPaidAmount = invoice.paid_amount + paid_amount;
    let newStatus = invoice.status;

    if (newPaidAmount >= invoice.total_amount) {
      newStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'partially_paid';
    }

    const result = await pool.query(
      `UPDATE invoices 
       SET paid_amount = $1, status = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [newPaidAmount, newStatus, id]
    );

    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    // First delete all invoice items
    await pool.query('DELETE FROM invoice_items WHERE invoice_id = $1', [id]);
    
    const result = await pool.query('DELETE FROM invoices WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Invoice Items methods
  static async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    const result = await pool.query(
      `SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY position`,
      [invoiceId]
    );
    return result.rows;
  }

  static async createInvoiceItem(data: CreateInvoiceItemData): Promise<InvoiceItem> {
    const result = await pool.query(
      `INSERT INTO invoice_items (
        invoice_id, item_type, item_id, title, description, quantity, unit,
        unit_price, discount_percent, tax_rate, total_price, position
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        data.invoice_id,
        data.item_type,
        data.item_id || null,
        data.title,
        data.description || null,
        data.quantity,
        data.unit,
        data.unit_price,
        data.discount_percent || 0,
        data.tax_rate,
        data.total_price,
        data.position,
      ]
    );
    return result.rows[0];
  }

  static async deleteInvoiceItem(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM invoice_items WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
