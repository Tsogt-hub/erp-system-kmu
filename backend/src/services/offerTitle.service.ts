import { OfferTitleModel, OfferTitle, CreateOfferTitleData } from '../models/OfferTitle';

export class OfferTitleService {
  static async getByOfferId(offerId: number): Promise<OfferTitle[]> {
    return await OfferTitleModel.findByOfferId(offerId);
  }

  static async getById(id: number): Promise<OfferTitle | null> {
    return await OfferTitleModel.findById(id);
  }

  static async create(data: CreateOfferTitleData): Promise<OfferTitle> {
    return await OfferTitleModel.create(data);
  }

  static async update(id: number, data: Partial<CreateOfferTitleData>): Promise<OfferTitle> {
    const title = await OfferTitleModel.findById(id);
    if (!title) {
      throw new Error('Offer title not found');
    }
    return await OfferTitleModel.update(id, data);
  }

  static async delete(id: number): Promise<void> {
    const title = await OfferTitleModel.findById(id);
    if (!title) {
      throw new Error('Offer title not found');
    }
    await OfferTitleModel.delete(id);
  }
}

