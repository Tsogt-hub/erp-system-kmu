import { Router } from 'express';
import { reminderController } from '../controllers/reminder.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get my reminders
router.get('/my', reminderController.getMyReminders);

// Get due reminders (next X days)
router.get('/due', reminderController.getDueReminders);

// Get overdue reminders
router.get('/overdue', reminderController.getOverdueReminders);

// Get reminders by entity
router.get('/entity/:entityType/:entityId', reminderController.getByEntity);

// Get single reminder
router.get('/:id', reminderController.getById);

// Create reminder
router.post('/', reminderController.create);

// Update reminder
router.put('/:id', reminderController.update);

// Complete reminder
router.post('/:id/complete', reminderController.complete);

// Uncomplete reminder
router.post('/:id/uncomplete', reminderController.uncomplete);

// Delete reminder
router.delete('/:id', reminderController.delete);

export default router;









