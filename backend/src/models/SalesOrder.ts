import { pool } from '../config/database';

export interface SalesOrder {
  id: number;
  order_number: string;
  order_date: Date;
  delivery_date?: Date;
  contact_id: number;
  company_id?: number;
  offer_id?: number;
  project_id?: number;
  status: 'draft' | 'confirmed' | 'in_progress' | 'delivered' | 'completed' | 'cancelled';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  payment_status: 'unpaid' | 'partially_paid' | 'paid';
  delivery_address?: string;
  notes?: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSalesOrderData {
  order_date: Date;
  delivery_date?: Date;
  contact_id: number;
  company_id?: number;
  offer_id?: number;
  project_id?: number;
  status?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount?: number;
  total_amount: number;
  currency?: string;
  delivery_address?: string;
  notes?: string;
  created_by: number;
}

export interface SalesOrderItem {
  id: number;
  order_id: number;
  item_type: 'article' | 'service';
  item_id?: number;
  title: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
  total_price: number;
  delivered_quantity: number;
  position: number;
  created_at: Date;
}

export class SalesOrderModel {
  static async findById(id: number): Promise<SalesOrder | null> {
    const result = await pool.query(
      `SELECT so.*, 
        c.first_name || ' ' || c.last_name as contact_name,
        comp.name as company_name
       FROM sales_orders so
       LEFT JOIN contacts c ON so.contact_id = c.id
       LEFT JOIN companies comp ON so.company_id = comp.id
       WHERE so.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async findAll(filters?: {
    status?: string;
    contact_id?: number;
    project_id?: number;
  }): Promise<SalesOrder[]> {
    let query = `
      SELECT so.*, 
        c.first_name || ' ' || c.last_name as contact_name,
        comp.name as company_name
      FROM sales_orders so
      LEFT JOIN contacts c ON so.contact_id = c.id
      LEFT JOIN companies comp ON so.company_id = comp.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (filters?.status) {
      query += ` AND so.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters?.contact_id) {
      query += ` AND so.contact_id = $${paramCount}`;
      params.push(filters.contact_id);
      paramCount++;
    }

    if (filters?.project_id) {
      query += ` AND so.project_id = $${paramCount}`;
      params.push(filters.project_id);
      paramCount++;
    }

    query += ' ORDER BY so.order_date DESC, so.order_number DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async create(data: CreateSalesOrderData): Promise<SalesOrder> {
    // Generate order number
    const year = new Date(data.order_date).getFullYear();
    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM sales_orders WHERE EXTRACT(YEAR FROM order_date) = $1`,
      [year]
    );
    const count = parseInt(countResult.rows[0].count) + 1;
    const order_number = `AB-${year}-${count.toString().padStart(4, '0')}`;

    const result = await pool.query(
      `INSERT INTO sales_orders (
        order_number, order_date, delivery_date, contact_id, company_id, 
        offer_id, project_id, status, subtotal, tax_rate, tax_amount, 
        discount_amount, total_amount, currency, payment_status, 
        delivery_address, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        order_number,
        data.order_date,
        data.delivery_date || null,
        data.contact_id,
        data.company_id || null,
        data.offer_id || null,
        data.project_id || null,
        data.status || 'draft',
        data.subtotal,
        data.tax_rate,
        data.tax_amount,
        data.discount_amount || 0,
        data.total_amount,
        data.currency || 'EUR',
        'unpaid',
        data.delivery_address || null,
        data.notes || null,
        data.created_by,
      ]
    );
    return result.rows[0];
  }

  static async update(id: number, data: Partial<CreateSalesOrderData>): Promise<SalesOrder | null> {
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

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE sales_orders SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    await pool.query('DELETE FROM sales_order_items WHERE order_id = $1', [id]);
    const result = await pool.query('DELETE FROM sales_orders WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async createFromOffer(offerId: number, createdBy: number): Promise<SalesOrder> {
    const offerResult = await pool.query(
      `SELECT * FROM offers WHERE id = $1`,
      [offerId]
    );
    
    if (offerResult.rows.length === 0) {
      throw new Error('Offer not found');
    }

    const offer = offerResult.rows[0];

    const orderData: CreateSalesOrderData = {
      order_date: new Date(),
      contact_id: offer.contact_id,
      company_id: offer.company_id,
      offer_id: offerId,
      project_id: offer.project_id,
      subtotal: offer.total_amount / (1 + offer.tax_rate / 100),
      tax_rate: offer.tax_rate,
      tax_amount: offer.total_amount - (offer.total_amount / (1 + offer.tax_rate / 100)),
      total_amount: offer.total_amount,
      notes: offer.notes,
      created_by: createdBy,
    };

    const salesOrder = await this.create(orderData);

    // Copy offer items to sales order items
    const offerItems = await pool.query(
      `SELECT * FROM offer_items WHERE offer_id = $1 ORDER BY position_order`,
      [offerId]
    );

    for (const item of offerItems.rows) {
      await pool.query(
        `INSERT INTO sales_order_items (
          order_id, item_type, item_id, title, description, quantity, unit,
          unit_price, discount_percent, tax_rate, total_price, delivered_quantity, position
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          salesOrder.id,
          'article',
          item.item_id,
          item.description,
          item.description,
          item.quantity,
          item.unit,
          item.unit_price,
          item.discount_percent,
          item.tax_rate,
          item.quantity * item.unit_price * (1 - item.discount_percent / 100),
          0,
          item.position_order,
        ]
      );
    }

    return salesOrder;
  }

  static async getOrderItems(orderId: number): Promise<SalesOrderItem[]> {
    const result = await pool.query(
      `SELECT * FROM sales_order_items WHERE order_id = $1 ORDER BY position`,
      [orderId]
    );
    return result.rows;
  }
}

