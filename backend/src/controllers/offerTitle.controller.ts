import { Request, Response, NextFunction } from 'express';
import { OfferTitleService } from '../services/offerTitle.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class OfferTitleController {
  static async getByOfferId(req: Request, res: Response, next: NextFunction) {
    try {
      const offerId = parseInt(req.params.offerId);
      const titles = await OfferTitleService.getByOfferId(offerId);
      res.json(titles);
    } catch (error: any) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const title = await OfferTitleService.getById(id);
      if (!title) {
        return res.status(404).json({ error: 'Offer title not found' });
      }
      res.json(title);
    } catch (error: any) {
      next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const title = await OfferTitleService.create(req.body);
      res.status(201).json(title);
    } catch (error: any) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const title = await OfferTitleService.update(id, req.body);
      res.json(title);
    } catch (error: any) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await OfferTitleService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      next(error);
    }
  }
}

