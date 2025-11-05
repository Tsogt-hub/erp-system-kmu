import { Router } from 'express';
import { OfferController } from '../controllers/offer.controller';
import { OfferItemController } from '../controllers/offerItem.controller';
import { OfferTextController } from '../controllers/offerText.controller';
import { OfferTitleController } from '../controllers/offerTitle.controller';
import { PDFController } from '../controllers/pdf.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Offer items routes (must be before /:id route)
router.get('/items/:id', OfferItemController.getById);
router.post('/items', OfferItemController.create);
router.put('/items/:id', OfferItemController.update);
router.delete('/items/:id', OfferItemController.delete);
router.get('/:offerId/items', OfferItemController.getItemsByOfferId);

// Offer texts routes
router.get('/texts/:id', OfferTextController.getById);
router.post('/texts', OfferTextController.create);
router.put('/texts/:id', OfferTextController.update);
router.delete('/texts/:id', OfferTextController.delete);
router.get('/:offerId/texts', OfferTextController.getByOfferId);

// Offer titles routes
router.get('/titles/:id', OfferTitleController.getById);
router.post('/titles', OfferTitleController.create);
router.put('/titles/:id', OfferTitleController.update);
router.delete('/titles/:id', OfferTitleController.delete);
router.get('/:offerId/titles', OfferTitleController.getByOfferId);

// Offer routes
router.get('/', OfferController.getAll);
router.get('/:id', OfferController.getById);
router.get('/:id/pdf', PDFController.generateOfferPDF);
router.post('/', OfferController.create);
router.put('/:id', OfferController.update);
router.delete('/:id', OfferController.delete);

export default router;

