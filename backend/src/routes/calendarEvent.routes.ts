import { Router } from 'express';
import { CalendarEventController } from '../controllers/calendarEvent.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', CalendarEventController.getAll);
router.get('/:id', CalendarEventController.getById);
router.post('/', CalendarEventController.create);
router.put('/:id', CalendarEventController.update);
router.delete('/:id', CalendarEventController.delete);

export default router;


