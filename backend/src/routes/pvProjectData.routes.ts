import { Router } from 'express';
import { pvProjectDataController } from '../controllers/pvProjectData.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Get dropdown options
router.get('/options', pvProjectDataController.getOptions);

// CRUD by project ID
router.get('/project/:projectId', pvProjectDataController.getByProjectId);
router.put('/project/:projectId', pvProjectDataController.upsert);
router.delete('/project/:projectId', pvProjectDataController.delete);

export default router;








