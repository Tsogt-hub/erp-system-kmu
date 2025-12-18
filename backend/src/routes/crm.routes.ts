import { Router } from 'express';
import { CRMController } from '../controllers/crm.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Companies
router.get('/companies', CRMController.getAllCompanies);
router.get('/companies/:id', CRMController.getCompanyById);
router.post('/companies', CRMController.createCompany);
router.put('/companies/:id', CRMController.updateCompany);
router.delete('/companies/:id', CRMController.deleteCompany);

// Contacts
router.get('/contacts', CRMController.getAllContacts);
router.get('/contacts/:id', CRMController.getContactById);
router.post('/contacts', CRMController.createContact);
router.put('/contacts/:id', CRMController.updateContact);
router.delete('/contacts/:id', CRMController.deleteContact);

export default router;


















