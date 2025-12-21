import { Router } from 'express';
import { documentController } from '../controllers/document.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get document types and statuses
router.get('/types', documentController.getTypes);
router.get('/statuses', documentController.getStatuses);

// Get documents by type
router.get('/type/:type', documentController.getByType);

// Get documents by project
router.get('/project/:projectId', documentController.getByProject);

// Get documents by customer
router.get('/customer/:customerId', documentController.getByCustomer);

// Create document from offer
router.post('/from-offer/:offerId', documentController.createFromOffer);

// Get single document
router.get('/:id', documentController.getById);

// Create document
router.post('/', documentController.create);

// Update document
router.put('/:id', documentController.update);

// Update status
router.patch('/:id/status', documentController.updateStatus);

// Delete document
router.delete('/:id', documentController.delete);

export default router;









