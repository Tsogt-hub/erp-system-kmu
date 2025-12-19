import { Router } from 'express';
import { openItemController } from '../controllers/openItem.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Statistics and statuses
router.get('/statistics', openItemController.getStatistics);
router.get('/statuses', openItemController.getStatuses);

// Lists
router.get('/', openItemController.getAll);
router.get('/open', openItemController.getOpen);
router.get('/overdue', openItemController.getOverdue);
router.get('/customer/:customerId', openItemController.getByCustomer);

// CRUD
router.get('/:id', openItemController.getById);
router.post('/', openItemController.create);
router.put('/:id', openItemController.update);
router.delete('/:id', openItemController.delete);

// Payments
router.get('/:id/payments', openItemController.getPayments);
router.post('/:id/payments', openItemController.addPayment);
router.delete('/payments/:paymentId', openItemController.deletePayment);

// Dunning
router.post('/:id/dunning', openItemController.incrementDunning);

export default router;






