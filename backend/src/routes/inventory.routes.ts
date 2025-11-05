import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { ImportController } from '../controllers/import.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Items
router.get('/items', InventoryController.getAllItems);
router.get('/items/:id', InventoryController.getItemById);
router.post('/items', InventoryController.createItem);
router.put('/items/:id', InventoryController.updateItem);
router.delete('/items/:id', InventoryController.deleteItem);

// Import
router.post('/items/import', ImportController.upload, ImportController.importItems);

// Stock
router.get('/stock', InventoryController.getStock);

// Movements
router.get('/movements', InventoryController.getAllMovements);
router.get('/movements/:id', InventoryController.getMovementById);
router.post('/movements', InventoryController.createMovement);

// Warehouses
router.get('/warehouses', InventoryController.getAllWarehouses);
router.get('/warehouses/:id', InventoryController.getWarehouseById);
router.post('/warehouses', InventoryController.createWarehouse);
router.put('/warehouses/:id', InventoryController.updateWarehouse);
router.delete('/warehouses/:id', InventoryController.deleteWarehouse);

export default router;

