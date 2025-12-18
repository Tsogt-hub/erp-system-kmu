import { Router } from 'express';
import { objectAddressController } from '../controllers/objectAddress.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Types
router.get('/types', objectAddressController.getTypes);

// By entity
router.get('/entity/:entityType/:entityId', objectAddressController.getByEntity);
router.get('/entity/:entityType/:entityId/default', objectAddressController.getDefault);

// CRUD
router.get('/:id', objectAddressController.getById);
router.post('/', objectAddressController.create);
router.put('/:id', objectAddressController.update);
router.delete('/:id', objectAddressController.delete);

export default router;





