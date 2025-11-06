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
}








