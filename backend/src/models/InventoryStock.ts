import { query } from '../config/database';
import { getRows, getRow } from '../utils/fix-models';

export interface InventoryStock {
  id: number;
  item_id: number;
  warehouse_id: number;
  quantity: number;
  updated_at: Date;
  item_name?: string;
  warehouse_name?: string;
}

export class InventoryStockModel {
  static async findByItemAndWarehouse(itemId: number, warehouseId: number): Promise<InventoryStock | null> {
    const result = await query(
      `SELECT is.*, i.name as item_name, w.name as warehouse_name
       FROM inventory_stock is
       JOIN items i ON is.item_id = i.id
       JOIN warehouses w ON is.warehouse_id = w.id
       WHERE is.item_id = $1 AND is.warehouse_id = $2`,
      [itemId, warehouseId]
    );
    return getRows(result)[0] || null;
  }

  static async findAll(warehouseId?: number): Promise<InventoryStock[]> {
    let queryText = `
      SELECT is.*, i.name as item_name, i.sku, w.name as warehouse_name
      FROM inventory_stock is
      JOIN items i ON is.item_id = i.id
      JOIN warehouses w ON is.warehouse_id = w.id
      WHERE is.quantity > 0
    `;
    const params: any[] = [];

    if (warehouseId) {
      queryText += ' AND is.warehouse_id = $1';
      params.push(warehouseId);
    }

    queryText += ' ORDER BY i.name ASC';

    const result = await query(queryText, params);
    return getRows(result);
  }

  static async updateStock(itemId: number, warehouseId: number, quantity: number): Promise<InventoryStock> {
    // Check if stock entry exists
    const existing = await this.findByItemAndWarehouse(itemId, warehouseId);

    if (existing) {
      // Update existing stock
      const newQuantity = Math.max(0, existing.quantity + quantity);
      const result = await query(
        `UPDATE inventory_stock 
         SET quantity = $1, updated_at = CURRENT_TIMESTAMP
         WHERE item_id = $2 AND warehouse_id = $3
         RETURNING *`,
        [newQuantity, itemId, warehouseId]
      );
      return getRows(result)[0];
    } else {
      // Create new stock entry
      const newQuantity = Math.max(0, quantity);
      const result = await query(
        `INSERT INTO inventory_stock (item_id, warehouse_id, quantity)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [itemId, warehouseId, newQuantity]
      );
      return getRows(result)[0];
    }
  }
}

