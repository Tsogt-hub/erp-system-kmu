import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

// Zahlungsstatus
export const PAYMENT_STATUSES = [
  'open',      // Offen
  'partial',   // Teilbezahlt
  'paid',      // Bezahlt
  'overdue',   // Überfällig
  'reminded',  // Gemahnt
  'cancelled', // Storniert
];

export interface OpenItem {
  id: number;
  document_id: number;
  document_type: string;
  document_number: string;
  customer_id: number;
  customer_name?: string;
  project_id?: number;
  project_name?: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  paid_amount: number;
  open_amount: number;
  status: string;
  dunning_level: number;
  last_dunning_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  open_item_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference?: string;
  notes?: string;
  created_by: number;
  created_at: string;
  created_by_name?: string;
}

export interface CreateOpenItemData {
  document_id: number;
  document_type: string;
  document_number: string;
  customer_id: number;
  project_id?: number;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  notes?: string;
}

export interface CreatePaymentData {
  open_item_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference?: string;
  notes?: string;
  created_by: number;
}

export async function initOpenItemsTables(): Promise<void> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS open_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id INTEGER NOT NULL,
        document_type TEXT NOT NULL,
        document_number TEXT NOT NULL,
        customer_id INTEGER NOT NULL,
        project_id INTEGER,
        invoice_date TEXT NOT NULL,
        due_date TEXT NOT NULL,
        total_amount REAL NOT NULL,
        paid_amount REAL DEFAULT 0,
        open_amount REAL NOT NULL,
        status TEXT DEFAULT 'open',
        dunning_level INTEGER DEFAULT 0,
        last_dunning_date TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES companies(id),
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `, []);

    await query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        open_item_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payment_date TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        reference TEXT,
        notes TEXT,
        created_by INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (open_item_id) REFERENCES open_items(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `, []);

    console.log('✅ Open items tables initialized');
  } catch (error: any) {
    console.log('ℹ️ Open items tables already exist or error:', error.message);
  }
}

export class OpenItemModel {
  static async findById(id: number): Promise<OpenItem | null> {
    const result = await query(
      `SELECT oi.*, c.name as customer_name, p.name as project_name
       FROM open_items oi
       LEFT JOIN companies c ON oi.customer_id = c.id
       LEFT JOIN projects p ON oi.project_id = p.id
       WHERE oi.id = $1`,
      [id]
    );
    return getRow(result);
  }

  static async findAll(status?: string): Promise<OpenItem[]> {
    let queryText = `
      SELECT oi.*, c.name as customer_name, p.name as project_name
      FROM open_items oi
      LEFT JOIN companies c ON oi.customer_id = c.id
      LEFT JOIN projects p ON oi.project_id = p.id
    `;
    const params: any[] = [];

    if (status) {
      queryText += ` WHERE oi.status = $1`;
      params.push(status);
    }

    queryText += ` ORDER BY oi.due_date ASC`;

    const result = await query(queryText, params);
    return getRows(result);
  }

  static async findOpen(): Promise<OpenItem[]> {
    const result = await query(
      `SELECT oi.*, c.name as customer_name, p.name as project_name
       FROM open_items oi
       LEFT JOIN companies c ON oi.customer_id = c.id
       LEFT JOIN projects p ON oi.project_id = p.id
       WHERE oi.status IN ('open', 'partial', 'overdue', 'reminded')
       ORDER BY oi.due_date ASC`,
      []
    );
    return getRows(result);
  }

  static async findOverdue(): Promise<OpenItem[]> {
    const result = await query(
      `SELECT oi.*, c.name as customer_name, p.name as project_name
       FROM open_items oi
       LEFT JOIN companies c ON oi.customer_id = c.id
       LEFT JOIN projects p ON oi.project_id = p.id
       WHERE oi.status IN ('open', 'partial') AND oi.due_date < date('now')
       ORDER BY oi.due_date ASC`,
      []
    );
    return getRows(result);
  }

  static async findByCustomer(customerId: number): Promise<OpenItem[]> {
    const result = await query(
      `SELECT oi.*, c.name as customer_name, p.name as project_name
       FROM open_items oi
       LEFT JOIN companies c ON oi.customer_id = c.id
       LEFT JOIN projects p ON oi.project_id = p.id
       WHERE oi.customer_id = $1
       ORDER BY oi.due_date ASC`,
      [customerId]
    );
    return getRows(result);
  }

  static async create(data: CreateOpenItemData): Promise<OpenItem> {
    const result = await query(
      `INSERT INTO open_items (document_id, document_type, document_number, customer_id, project_id, invoice_date, due_date, total_amount, open_amount, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9)
       RETURNING *`,
      [
        data.document_id,
        data.document_type,
        data.document_number,
        data.customer_id,
        data.project_id || null,
        data.invoice_date,
        data.due_date,
        data.total_amount,
        data.notes || null,
      ]
    );
    return getRow(result)!;
  }

  static async update(id: number, data: Partial<CreateOpenItemData>): Promise<OpenItem> {
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
      `UPDATE open_items SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM open_items WHERE id = $1', [id]);
  }

  // Payments
  static async getPayments(openItemId: number): Promise<Payment[]> {
    const result = await query(
      `SELECT p.*, u.first_name || ' ' || u.last_name as created_by_name
       FROM payments p
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.open_item_id = $1
       ORDER BY p.payment_date DESC`,
      [openItemId]
    );
    return getRows(result);
  }

  static async addPayment(data: CreatePaymentData): Promise<Payment> {
    // Add payment
    const paymentResult = await query(
      `INSERT INTO payments (open_item_id, amount, payment_date, payment_method, reference, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.open_item_id,
        data.amount,
        data.payment_date,
        data.payment_method,
        data.reference || null,
        data.notes || null,
        data.created_by,
      ]
    );
    const payment = getRow(paymentResult)!;

    // Update open item
    await this.recalculateOpenItem(data.open_item_id);

    return payment;
  }

  static async deletePayment(paymentId: number): Promise<void> {
    const payment = await query(`SELECT open_item_id FROM payments WHERE id = $1`, [paymentId]);
    const row = getRow(payment);
    
    await query('DELETE FROM payments WHERE id = $1', [paymentId]);
    
    if (row?.open_item_id) {
      await this.recalculateOpenItem(row.open_item_id);
    }
  }

  static async recalculateOpenItem(openItemId: number): Promise<void> {
    // Calculate total paid
    const sumResult = await query(
      `SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments WHERE open_item_id = $1`,
      [openItemId]
    );
    const totalPaid = getRow(sumResult)?.total_paid || 0;

    // Get open item
    const itemResult = await query(`SELECT total_amount, due_date FROM open_items WHERE id = $1`, [openItemId]);
    const item = getRow(itemResult);
    if (!item) return;

    const openAmount = item.total_amount - totalPaid;
    let status = 'open';
    
    if (openAmount <= 0) {
      status = 'paid';
    } else if (totalPaid > 0) {
      status = 'partial';
    } else if (new Date(item.due_date) < new Date()) {
      status = 'overdue';
    }

    await query(
      `UPDATE open_items SET paid_amount = $1, open_amount = $2, status = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4`,
      [totalPaid, openAmount, status, openItemId]
    );
  }

  static async incrementDunningLevel(id: number): Promise<OpenItem> {
    const result = await query(
      `UPDATE open_items 
       SET dunning_level = dunning_level + 1, 
           last_dunning_date = date('now'),
           status = 'reminded',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return getRow(result)!;
  }

  // Statistics
  static async getStatistics(): Promise<{
    totalOpen: number;
    totalOverdue: number;
    openAmount: number;
    overdueAmount: number;
    paidThisMonth: number;
  }> {
    const result = await query(`
      SELECT 
        COUNT(CASE WHEN status IN ('open', 'partial') THEN 1 END) as total_open,
        COUNT(CASE WHEN status IN ('open', 'partial') AND due_date < date('now') THEN 1 END) as total_overdue,
        COALESCE(SUM(CASE WHEN status IN ('open', 'partial') THEN open_amount ELSE 0 END), 0) as open_amount,
        COALESCE(SUM(CASE WHEN status IN ('open', 'partial') AND due_date < date('now') THEN open_amount ELSE 0 END), 0) as overdue_amount
      FROM open_items
    `, []);
    const stats = getRow(result);

    const paidResult = await query(`
      SELECT COALESCE(SUM(amount), 0) as paid_this_month
      FROM payments
      WHERE payment_date >= date('now', 'start of month')
    `, []);
    const paidStats = getRow(paidResult);

    return {
      totalOpen: stats?.total_open || 0,
      totalOverdue: stats?.total_overdue || 0,
      openAmount: stats?.open_amount || 0,
      overdueAmount: stats?.overdue_amount || 0,
      paidThisMonth: paidStats?.paid_this_month || 0,
    };
  }
}






