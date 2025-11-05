import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

export interface OfferItem {
  id: number;
  offer_id: number;
  item_id?: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent?: number;
  tax_rate: number;
  position_order: number;
  created_at: Date;
  updated_at: Date;
  item_name?: string;
  item_sku?: string;
}

export interface CreateOfferItemData {
  offer_id: number;
  item_id?: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent?: number;
  tax_rate?: number;
  position_order?: number;
}

export class OfferItemModel {
  static async findByOfferId(offerId: number): Promise<OfferItem[]> {
    const result = await query(
      `SELECT oi.*, i.name as item_name, i.sku as item_sku
       FROM offer_items oi
       LEFT JOIN items i ON oi.item_id = i.id
       WHERE oi.offer_id = $1
       ORDER BY oi.position_order ASC, oi.id ASC`,
      [offerId]
    );
    return getRows(result);
  }

  static async findById(id: number): Promise<OfferItem | null> {
    const result = await query(
      `SELECT oi.*, i.name as item_name, i.sku as item_sku
       FROM offer_items oi
       LEFT JOIN items i ON oi.item_id = i.id
       WHERE oi.id = $1`,
      [id]
    );
    return getRow(result);
  }

  static async create(data: CreateOfferItemData): Promise<OfferItem> {
    // Get next position order if not provided
    let positionOrder = data.position_order;
    if (!positionOrder) {
      const orderResult = await query(
        `SELECT COALESCE(MAX(position_order), 0) + 1 as next_order
         FROM offer_items
         WHERE offer_id = $1`,
        [data.offer_id]
      );
      const rows = getRows(orderResult);
      positionOrder = rows[0]?.next_order || 1;
    }

    const result = await query(
      `INSERT INTO offer_items (offer_id, item_id, description, quantity, unit, unit_price, discount_percent, tax_rate, position_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.offer_id,
        data.item_id || null,
        data.description,
        data.quantity,
        data.unit,
        data.unit_price,
        data.discount_percent || 0,
        data.tax_rate || 19.00,
        positionOrder,
      ]
    );
    return getRow(result)!;
  }

  static async update(id: number, data: Partial<CreateOfferItemData>): Promise<OfferItem> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'offer_id') {
        fields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    });

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE offer_items SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM offer_items WHERE id = $1', [id]);
  }

  static async deleteByOfferId(offerId: number): Promise<void> {
    await query('DELETE FROM offer_items WHERE offer_id = $1', [offerId]);
  }

  static calculateItemTotal(item: OfferItem): number {
    const subtotal = item.quantity * item.unit_price;
    const discount = item.discount_percent ? (subtotal * item.discount_percent / 100) : 0;
    return subtotal - discount;
  }

  static calculateItemTotalWithTax(item: OfferItem): number {
    const total = this.calculateItemTotal(item);
    return total * (1 + item.tax_rate / 100);
  }
}







