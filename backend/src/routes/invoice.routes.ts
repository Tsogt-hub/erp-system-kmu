import { Router } from 'express';
import invoiceController from '../controllers/invoice.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Invoice routes
router.post('/', invoiceController.createInvoice);
router.get('/', invoiceController.getInvoices);
router.get('/stats', invoiceController.getInvoiceStats);
router.get('/overdue', invoiceController.getOverdueInvoices);
router.get('/:id', invoiceController.getInvoiceById);
router.put('/:id', invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

// Invoice items routes
router.post('/:id/items', invoiceController.addInvoiceItem);
router.delete('/:id/items/:itemId', invoiceController.deleteInvoiceItem);

// Payment routes
router.post('/:id/payment', invoiceController.recordPayment);

export default router;

