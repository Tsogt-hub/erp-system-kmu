import { Router } from 'express';
import { offerTemplateController } from '../controllers/offerTemplate.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Templates
router.get('/', offerTemplateController.getAll);
router.get('/:id', offerTemplateController.getById);
router.post('/', offerTemplateController.create);
router.put('/:id', offerTemplateController.update);
router.delete('/:id', offerTemplateController.delete);

// Template items
router.get('/:id/items', offerTemplateController.getItems);
router.post('/:id/items', offerTemplateController.addItem);
router.put('/items/:itemId', offerTemplateController.updateItem);
router.delete('/items/:itemId', offerTemplateController.deleteItem);

// Create offer from template
router.post('/:id/create-offer', offerTemplateController.createOfferFromTemplate);

export default router;





