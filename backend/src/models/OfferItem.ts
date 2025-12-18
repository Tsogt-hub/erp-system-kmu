import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

// Position-Typen wie in Hero
export const OFFER_ITEM_TYPES = [
  'standard',      // Normale Position
  'optional',      // Bedarfsposition (wird nicht in Summe berechnet)
  'alternative',   // Alternative Position (wird nicht in Summe berechnet)
  'header',        // Überschrift/Kategorie (keine Preise)
  'text',          // Freitext (keine Preise)
];

export interface OfferItem {
  id: number;
  offer_id: number;
  item_id?: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  purchase_price?: number;  // Einkaufspreis für Marge
  discount_percent?: number;
  tax_rate: number;
  position_order: number;
  // Neue Hero-Felder
  item_type: string;        // standard, optional, alternative, header, text
  parent_item_id?: number;  // Für Gruppen/Alternativen
  image_url?: string;       // Artikelbild
  notes?: string;           // Interne Notizen
  is_visible: boolean;      // Sichtbar im Angebot
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
  purchase_price?: number;
  discount_percent?: number;
  tax_rate?: number;
  position_order?: number;
  // Neue Hero-Felder
  item_type?: string;
  parent_item_id?: number;
  image_url?: string;
  notes?: string;
  is_visible?: boolean;
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
      `INSERT INTO offer_items (
        offer_id, item_id, description, quantity, unit, unit_price, purchase_price,
        discount_percent, tax_rate, position_order, item_type, parent_item_id,
        image_url, notes, is_visible
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        data.offer_id,
        data.item_id || null,
        data.description,
        data.quantity,
        data.unit,
        data.unit_price,
        data.purchase_price || null,
        data.discount_percent || 0,
        data.tax_rate || 19.00,
        positionOrder,
        data.item_type || 'standard',
        data.parent_item_id || null,
        data.image_url || null,
        data.notes || null,
        data.is_visible !== false ? 1 : 0,
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
        // Handle boolean values for SQLite
        if (key === 'is_visible' && typeof value === 'boolean') {
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
    // Optional und Alternative Positionen werden nicht berechnet
    if (item.item_type === 'optional' || item.item_type === 'alternative' || 
        item.item_type === 'header' || item.item_type === 'text') {
      return 0;
    }
    const subtotal = item.quantity * item.unit_price;
    const discount = item.discount_percent ? (subtotal * item.discount_percent / 100) : 0;
    return subtotal - discount;
  }

  static calculateItemTotalWithTax(item: OfferItem): number {
    const total = this.calculateItemTotal(item);
    return total * (1 + item.tax_rate / 100);
  }

  // Berechnet die Marge für einen Artikel
  static calculateItemMargin(item: OfferItem): { marginAmount: number; marginPercent: number } {
    if (!item.purchase_price || item.purchase_price === 0) {
      return { marginAmount: 0, marginPercent: 0 };
    }
    const sellPrice = item.unit_price;
    const marginAmount = sellPrice - item.purchase_price;
    const marginPercent = (marginAmount / item.purchase_price) * 100;
    return { marginAmount, marginPercent };
  }

  // Berechnet den Rohertrag für eine Position
  static calculateItemProfit(item: OfferItem): number {
    if (!item.purchase_price || item.item_type !== 'standard') {
      return 0;
    }
    const total = this.calculateItemTotal(item);
    const purchaseTotal = item.quantity * item.purchase_price;
    return total - purchaseTotal;
  }
}


















