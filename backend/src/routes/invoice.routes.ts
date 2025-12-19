import { Router } from 'express';
import invoiceController from '../controllers/invoice.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Invoice routes
router.post('/', (req, res) => invoiceController.createInvoice(req as any, res));
router.get('/', (req, res) => invoiceController.getInvoices(req, res));
router.get('/stats', (req, res) => invoiceController.getInvoiceStats(req, res));
router.get('/overdue', (req, res) => invoiceController.getOverdueInvoices(req, res));
router.get('/:id', (req, res) => invoiceController.getInvoiceById(req, res));
router.put('/:id', (req, res) => invoiceController.updateInvoice(req, res));
router.delete('/:id', (req, res) => invoiceController.deleteInvoice(req, res));

// Invoice items routes
router.post('/:id/items', (req, res) => invoiceController.addInvoiceItem(req, res));
router.delete('/:id/items/:itemId', (req, res) => invoiceController.deleteInvoiceItem(req, res));

// Payment routes
router.post('/:id/payment', (req, res) => invoiceController.recordPayment(req, res));

export default router;

