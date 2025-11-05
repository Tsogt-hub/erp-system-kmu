import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

export interface OfferText {
  id: number;
  offer_id: number;
  title: string;
  description?: string;
  position_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateOfferTextData {
  offer_id: number;
  title: string;
  description?: string;
  position_order?: number;
}

export class OfferTextModel {
  static async findByOfferId(offerId: number): Promise<OfferText[]> {
    const result = await query(
      `SELECT * FROM offer_texts 
       WHERE offer_id = $1 
       ORDER BY position_order ASC, created_at ASC`,
      [offerId]
    );
    return getRows(result);
  }

  static async findById(id: number): Promise<OfferText | null> {
    const result = await query(
      `SELECT * FROM offer_texts WHERE id = $1`,
      [id]
    );
    return getRow(result);
  }

  static async create(data: CreateOfferTextData): Promise<OfferText> {
    let positionOrder = data.position_order;
    if (!positionOrder) {
      const orderResult = await query(
        `SELECT COALESCE(MAX(position_order), 0) + 1 as next_order
         FROM offer_texts
         WHERE offer_id = $1`,
        [data.offer_id]
      );
      const rows = getRows(orderResult);
      positionOrder = rows[0]?.next_order || 1;
    }

    const result = await query(
      `INSERT INTO offer_texts (offer_id, title, description, position_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        data.offer_id,
        data.title,
        data.description || null,
        positionOrder,
      ]
    );
    return getRow(result)!;
  }

  static async update(id: number, data: Partial<CreateOfferTextData>): Promise<OfferText> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(data.title);
      paramIndex++;
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(data.description || null);
      paramIndex++;
    }
    if (data.position_order !== undefined) {
      updates.push(`position_order = $${paramIndex}`);
      values.push(data.position_order);
      paramIndex++;
    }

    if (updates.length === 0) {
      return (await this.findById(id))!;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE offer_texts 
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );
    return getRow(result)!;
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM offer_texts WHERE id = $1', [id]);
  }
}

