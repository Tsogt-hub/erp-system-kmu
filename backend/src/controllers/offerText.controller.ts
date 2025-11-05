import { Request, Response, NextFunction } from 'express';
import { OfferTextService } from '../services/offerText.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class OfferTextController {
  static async getByOfferId(req: Request, res: Response, next: NextFunction) {
    try {
      const offerId = parseInt(req.params.offerId);
      const texts = await OfferTextService.getByOfferId(offerId);
      res.json(texts);
    } catch (error: any) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const text = await OfferTextService.getById(id);
      if (!text) {
        return res.status(404).json({ error: 'Offer text not found' });
      }
      res.json(text);
    } catch (error: any) {
      next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const text = await OfferTextService.create(req.body);
      res.status(201).json(text);
    } catch (error: any) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const text = await OfferTextService.update(id, req.body);
      res.json(text);
    } catch (error: any) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await OfferTextService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      next(error);
    }
  }
}

