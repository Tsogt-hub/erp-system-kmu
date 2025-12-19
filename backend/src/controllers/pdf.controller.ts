import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { OfferService } from '../services/offer.service';
import { pdfService } from '../services/pdf.service';

export class PDFController {
  static async generateOfferPDF(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const offer = await OfferService.getOfferById(id);

      if (!offer) {
        return res.status(404).json({ error: 'Offer not found' });
      }

      // Konvertiere das Angebot in das richtige Format für pdfService
      const pdfBuffer = await pdfService.generateFromHTML(`
        <html>
          <head><meta charset="utf-8"><style>body{font-family:Arial;padding:20px;}</style></head>
          <body>
            <h1>Angebot ${offer.offer_number}</h1>
            <p>Details werden hier angezeigt...</p>
          </body>
        </html>
      `);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Angebot-${offer.offer_number}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      next(error);
    }
  }
}


















