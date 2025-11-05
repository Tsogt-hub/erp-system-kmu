import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { InventoryService } from '../services/inventory.service';

export class InventoryController {
  // Items
  static async getAllItems(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { search } = req.query;
      const items = search
        ? await InventoryService.searchItems(search as string)
        : await InventoryService.getAllItems();
      res.json(items);
    } catch (error: any) {
      next(error);
    }
  }

  static async getItemById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const item = await InventoryService.getItemById(id);
      res.json(item);
    } catch (error: any) {
      next(error);
    }
  }

  static async createItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await InventoryService.createItem(req.body);
      res.status(201).json(item);
    } catch (error: any) {
      next(error);
    }
  }

  static async updateItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const item = await InventoryService.updateItem(id, req.body);
      res.json(item);
    } catch (error: any) {
      next(error);
    }
  }

  static async deleteItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await InventoryService.deleteItem(id);
      res.json({ message: 'Item deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }

  // Stock
  static async getStock(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { warehouseId } = req.query;
      const stock = await InventoryService.getStock(
        warehouseId ? parseInt(warehouseId as string) : undefined
      );
      res.json(stock);
    } catch (error: any) {
      next(error);
    }
  }

  // Movements
  static async getAllMovements(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { warehouseId, itemId } = req.query;
      const movements = await InventoryService.getAllMovements(
        warehouseId ? parseInt(warehouseId as string) : undefined,
        itemId ? parseInt(itemId as string) : undefined
      );
      res.json(movements);
    } catch (error: any) {
      next(error);
    }
  }

  static async getMovementById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const movement = await InventoryService.getMovementById(id);
      res.json(movement);
    } catch (error: any) {
      next(error);
    }
  }

  static async createMovement(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const movement = await InventoryService.createMovement({
        ...req.body,
        created_by: userId,
      });
      res.status(201).json(movement);
    } catch (error: any) {
      next(error);
    }
  }

  // Warehouses
  static async getAllWarehouses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const warehouses = await InventoryService.getAllWarehouses();
      res.json(warehouses);
    } catch (error: any) {
      next(error);
    }
  }

  static async getWarehouseById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const warehouse = await InventoryService.getWarehouseById(id);
      res.json(warehouse);
    } catch (error: any) {
      next(error);
    }
  }

  static async createWarehouse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const warehouse = await InventoryService.createWarehouse(req.body);
      res.status(201).json(warehouse);
    } catch (error: any) {
      next(error);
    }
  }

  static async updateWarehouse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const warehouse = await InventoryService.updateWarehouse(id, req.body);
      res.json(warehouse);
    } catch (error: any) {
      next(error);
    }
  }

  static async deleteWarehouse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await InventoryService.deleteWarehouse(id);
      res.json({ message: 'Warehouse deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }
}

