import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { OfferService } from '../services/offer.service';
import { PDFService } from '../services/pdf.service';

export class PDFController {
  static async generateOfferPDF(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const offer = await OfferService.getOfferById(id);

      if (!offer) {
        return res.status(404).json({ error: 'Offer not found' });
      }

      const pdfBuffer = await PDFService.generateOfferPDF(offer);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Angebot-${offer.offer_number}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      next(error);
    }
  }
}






