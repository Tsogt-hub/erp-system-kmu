import pool from '../config/database';

export interface PurchaseOrder {
  id: number;
  order_number: string;
  order_date: Date;
  expected_delivery_date?: Date;
  supplier_id: number;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'completed' | 'cancelled';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  payment_terms?: string;
  delivery_address?: string;
  notes?: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePurchaseOrderData {
  order_date: Date;
  expected_delivery_date?: Date;
  supplier_id: number;
  status?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  currency?: string;
  payment_terms?: string;
  delivery_address?: string;
  notes?: string;
  created_by: number;
}

export class PurchaseOrderModel {
  static async findById(id: number): Promise<PurchaseOrder | null> {
    const result = await pool.query(
      `SELECT po.*, comp.name as supplier_name
       FROM purchase_orders po
       LEFT JOIN companies comp ON po.supplier_id = comp.id
       WHERE po.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async findAll(filters?: { status?: string; supplier_id?: number }): Promise<PurchaseOrder[]> {
    let query = `
      SELECT po.*, comp.name as supplier_name
      FROM purchase_orders po
      LEFT JOIN companies comp ON po.supplier_id = comp.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (filters?.status) {
      query += ` AND po.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters?.supplier_id) {
      query += ` AND po.supplier_id = $${paramCount}`;
      params.push(filters.supplier_id);
      paramCount++;
    }

    query += ' ORDER BY po.order_date DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async create(data: CreatePurchaseOrderData): Promise<PurchaseOrder> {
    const year = new Date(data.order_date).getFullYear();
    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM purchase_orders WHERE EXTRACT(YEAR FROM order_date) = $1`,
      [year]
    );
    const count = parseInt(countResult.rows[0].count) + 1;
    const order_number = `BE-${year}-${count.toString().padStart(4, '0')}`;

    const result = await pool.query(
      `INSERT INTO purchase_orders (
        order_number, order_date, expected_delivery_date, supplier_id, status,
        subtotal, tax_rate, tax_amount, total_amount, currency,
        payment_terms, delivery_address, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        order_number,
        data.order_date,
        data.expected_delivery_date || null,
        data.supplier_id,
        data.status || 'draft',
        data.subtotal,
        data.tax_rate,
        data.tax_amount,
        data.total_amount,
        data.currency || 'EUR',
        data.payment_terms || null,
        data.delivery_address || null,
        data.notes || null,
        data.created_by,
      ]
    );
    return result.rows[0];
  }

  static async update(id: number, data: Partial<CreatePurchaseOrderData>): Promise<PurchaseOrder | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return this.findById(id);

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE purchase_orders SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM purchase_orders WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}

