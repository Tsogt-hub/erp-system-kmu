import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { OfferService } from '../services/offer.service';

export class OfferController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const offers = status
        ? await OfferService.getOffersByStatus(status as string)
        : await OfferService.getAllOffers();
      res.json(offers);
    } catch (error: any) {
      next(error);
    }
  }

  static async getByProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.projectId);
      const offers = await OfferService.getOffersByProject(projectId);
      res.json(offers);
    } catch (error: any) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const offer = await OfferService.getOfferById(id);
      res.json(offer);
    } catch (error: any) {
      next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const offer = await OfferService.createOffer({
        ...req.body,
        created_by: userId,
      });
      res.status(201).json(offer);
    } catch (error: any) {
      next(error);
    }
  }

  static async createForProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const projectId = parseInt(req.params.projectId);
      const offer = await OfferService.createForProject(projectId, userId);
      res.status(201).json(offer);
    } catch (error: any) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const offer = await OfferService.updateOffer(id, req.body);
      res.json(offer);
    } catch (error: any) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await OfferService.deleteOffer(id);
      res.json({ message: 'Offer deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }

  // PDF-Vorschau als Base64 generieren
  static async previewPdf(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const base64Pdf = await OfferService.generatePreviewPdf(id);
      res.json({ pdf: base64Pdf });
    } catch (error: any) {
      next(error);
    }
  }

  // PDF herunterladen
  static async downloadPdf(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const pdfBuffer = await OfferService.generatePdf(id);
      const offer = await OfferService.getOfferById(id);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${offer.offer_number}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      next(error);
    }
  }

  // Angebot finalisieren (offizielle Nummer vergeben)
  static async finalize(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const offer = await OfferService.finalize(id);
      res.json(offer);
    } catch (error: any) {
      next(error);
    }
  }
}


















