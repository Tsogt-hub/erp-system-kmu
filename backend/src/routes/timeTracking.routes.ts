import { Router } from 'express';
import { TimeTrackingController } from '../controllers/timeTracking.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', TimeTrackingController.getAll);
router.get('/active', TimeTrackingController.getActive);
router.get('/:id', TimeTrackingController.getById);
router.post('/', TimeTrackingController.create);
router.post('/start', TimeTrackingController.start);
router.post('/stop', TimeTrackingController.stop);
router.put('/:id', TimeTrackingController.update);
router.delete('/:id', TimeTrackingController.delete);

export default router;








