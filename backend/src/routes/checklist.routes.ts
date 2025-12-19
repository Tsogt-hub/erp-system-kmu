import { Router } from 'express';
import { checklistController } from '../controllers/checklist.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Templates
router.get('/templates', checklistController.getTemplates);
router.post('/templates/:templateId/create', checklistController.createFromTemplate);

// By entity
router.get('/entity/:entityType/:entityId', checklistController.getByEntity);

// CRUD
router.get('/:id', checklistController.getById);
router.post('/', checklistController.create);
router.put('/:id', checklistController.update);
router.delete('/:id', checklistController.delete);

// Items
router.post('/:id/items', checklistController.addItem);
router.put('/items/:itemId', checklistController.updateItem);
router.post('/items/:itemId/toggle', checklistController.toggleItem);
router.delete('/items/:itemId', checklistController.deleteItem);

export default router;







