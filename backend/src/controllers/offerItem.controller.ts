import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { OfferItemService } from '../services/offerItem.service';

export class OfferItemController {
  static async getItemsByOfferId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const offerId = parseInt(req.params.offerId);
      const items = await OfferItemService.getItemsByOfferId(offerId);
      res.json(items);
    } catch (error: any) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const item = await OfferItemService.getItemById(id);
      res.json(item);
    } catch (error: any) {
      next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await OfferItemService.createItem(req.body);
      res.status(201).json(item);
    } catch (error: any) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const item = await OfferItemService.updateItem(id, req.body);
      res.json(item);
    } catch (error: any) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await OfferItemService.deleteItem(id);
      res.json({ message: 'Offer item deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }
}






