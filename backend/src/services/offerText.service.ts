import { OfferTextModel, OfferText, CreateOfferTextData } from '../models/OfferText';

export class OfferTextService {
  static async getByOfferId(offerId: number): Promise<OfferText[]> {
    return await OfferTextModel.findByOfferId(offerId);
  }

  static async getById(id: number): Promise<OfferText | null> {
    return await OfferTextModel.findById(id);
  }

  static async create(data: CreateOfferTextData): Promise<OfferText> {
    return await OfferTextModel.create(data);
  }

  static async update(id: number, data: Partial<CreateOfferTextData>): Promise<OfferText> {
    const text = await OfferTextModel.findById(id);
    if (!text) {
      throw new Error('Offer text not found');
    }
    return await OfferTextModel.update(id, data);
  }

  static async delete(id: number): Promise<void> {
    const text = await OfferTextModel.findById(id);
    if (!text) {
      throw new Error('Offer text not found');
    }
    await OfferTextModel.delete(id);
  }
}

