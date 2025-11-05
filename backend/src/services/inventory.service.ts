import { ItemModel, CreateItemData } from '../models/Item';
import { InventoryStockModel } from '../models/InventoryStock';
import { InventoryMovementModel, CreateInventoryMovementData } from '../models/InventoryMovement';
import { WarehouseModel, CreateWarehouseData } from '../models/Warehouse';

export class InventoryService {
  // Items
  static async getAllItems() {
    return await ItemModel.findAll();
  }

  static async getItemById(id: number) {
    const item = await ItemModel.findById(id);
    if (!item) {
      throw new Error('Item not found');
    }
    return item;
  }

  static async searchItems(searchTerm: string) {
    return await ItemModel.search(searchTerm);
  }

  static async createItem(data: CreateItemData) {
    return await ItemModel.create(data);
  }

  static async updateItem(id: number, data: Partial<CreateItemData>) {
    const item = await ItemModel.findById(id);
    if (!item) {
      throw new Error('Item not found');
    }
    return await ItemModel.update(id, data);
  }

  static async deleteItem(id: number) {
    const item = await ItemModel.findById(id);
    if (!item) {
      throw new Error('Item not found');
    }
    await ItemModel.delete(id);
    return { message: 'Item deleted successfully' };
  }

  // Stock
  static async getStock(warehouseId?: number) {
    return await InventoryStockModel.findAll(warehouseId);
  }

  static async getStockByItemAndWarehouse(itemId: number, warehouseId: number) {
    return await InventoryStockModel.findByItemAndWarehouse(itemId, warehouseId);
  }

  // Movements
  static async getAllMovements(warehouseId?: number, itemId?: number) {
    return await InventoryMovementModel.findAll(warehouseId, itemId);
  }

  static async getMovementById(id: number) {
    const movement = await InventoryMovementModel.findById(id);
    if (!movement) {
      throw new Error('Movement not found');
    }
    return movement;
  }

  static async createMovement(data: CreateInventoryMovementData) {
    // Validate stock for OUT movements
    if (data.movement_type === 'OUT') {
      const stock = await InventoryStockModel.findByItemAndWarehouse(
        data.item_id,
        data.warehouse_id
      );
      if (!stock || stock.quantity < data.quantity) {
        throw new Error('Insufficient stock');
      }
    }

    return await InventoryMovementModel.create(data);
  }

  // Warehouses
  static async getAllWarehouses() {
    return await WarehouseModel.findAll();
  }

  static async getWarehouseById(id: number) {
    const warehouse = await WarehouseModel.findById(id);
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }
    return warehouse;
  }

  static async createWarehouse(data: CreateWarehouseData) {
    return await WarehouseModel.create(data);
  }

  static async updateWarehouse(id: number, data: Partial<CreateWarehouseData>) {
    const warehouse = await WarehouseModel.findById(id);
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }
    return await WarehouseModel.update(id, data);
  }

  static async deleteWarehouse(id: number) {
    const warehouse = await WarehouseModel.findById(id);
    if (!warehouse) {
      throw new Error('Warehouse not found');
    }
    await WarehouseModel.delete(id);
    return { message: 'Warehouse deleted successfully' };
  }
}

