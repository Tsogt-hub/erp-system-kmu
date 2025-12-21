import { Router } from 'express';
import { entityFileController } from '../controllers/entityFile.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Options
router.get('/options', entityFileController.getOptions);

// By entity
router.get('/entity/:entityType/:entityId', entityFileController.getByEntity);
router.get('/entity/:entityType/:entityId/images', entityFileController.getImages);
router.get('/entity/:entityType/:entityId/documents', entityFileController.getDocuments);
router.get('/entity/:entityType/:entityId/counts', entityFileController.getCounts);

// CRUD
router.get('/:id', entityFileController.getById);
router.post('/', entityFileController.create);
router.put('/:id', entityFileController.update);
router.delete('/:id', entityFileController.delete);

export default router;









