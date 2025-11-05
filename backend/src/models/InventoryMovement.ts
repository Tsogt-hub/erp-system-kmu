import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';
import { InventoryStockModel } from './InventoryStock';

export interface InventoryMovement {
  id: number;
  item_id: number;
  warehouse_id: number;
  quantity: number;
  movement_type: 'IN' | 'OUT';
  reference?: string;
  notes?: string;
  created_by?: number;
  created_at: Date;
  item_name?: string;
  warehouse_name?: string;
  created_user_name?: string;
}

export interface CreateInventoryMovementData {
  item_id: number;
  warehouse_id: number;
  quantity: number;
  movement_type: 'IN' | 'OUT';
  reference?: string;
  notes?: string;
  created_by?: number;
}

export class InventoryMovementModel {
  static async findById(id: number): Promise<InventoryMovement | null> {
    const result = await query(
      `SELECT im.*, i.name as item_name, w.name as warehouse_name,
              u.first_name || ' ' || u.last_name as created_user_name
       FROM inventory_movements im
       JOIN items i ON im.item_id = i.id
       JOIN warehouses w ON im.warehouse_id = w.id
       LEFT JOIN users u ON im.created_by = u.id
       WHERE im.id = $1`,
      [id]
    );
    return getRows(result)[0] || null;
  }

  static async findAll(warehouseId?: number, itemId?: number): Promise<InventoryMovement[]> {
    let queryText = `
      SELECT im.*, i.name as item_name, w.name as warehouse_name,
             u.first_name || ' ' || u.last_name as created_user_name
      FROM inventory_movements im
      JOIN items i ON im.item_id = i.id
      JOIN warehouses w ON im.warehouse_id = w.id
      LEFT JOIN users u ON im.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (warehouseId) {
      queryText += ` AND im.warehouse_id = $${paramCount++}`;
      params.push(warehouseId);
    }

    if (itemId) {
      queryText += ` AND im.item_id = $${paramCount++}`;
      params.push(itemId);
    }

    queryText += ' ORDER BY im.created_at DESC';

    const result = await query(queryText, params);
    return getRows(result);
  }

  static async create(data: CreateInventoryMovementData): Promise<InventoryMovement> {
    // Calculate quantity change (negative for OUT movements)
    const quantityChange = data.movement_type === 'OUT' ? -data.quantity : data.quantity;

    // Update stock
    await InventoryStockModel.updateStock(
      data.item_id,
      data.warehouse_id,
      quantityChange
    );

    // Create movement record
    const result = await query(
      `INSERT INTO inventory_movements (item_id, warehouse_id, quantity, movement_type, reference, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.item_id,
        data.warehouse_id,
        data.quantity,
        data.movement_type,
        data.reference || null,
        data.notes || null,
        data.created_by || null,
      ]
    );
    return getRows(result)[0];
  }
}

