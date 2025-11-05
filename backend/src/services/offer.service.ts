import { OfferModel, CreateOfferData } from '../models/Offer';
import { OfferItemModel } from '../models/OfferItem';

export class OfferService {
  static async getAllOffers() {
    return await OfferModel.findAll();
  }

  static async getOfferById(id: number) {
    const offer = await OfferModel.findById(id);
    if (!offer) {
      throw new Error('Offer not found');
    }
    // Load items
    const items = await OfferItemModel.findByOfferId(id);
    return { ...offer, items };
  }

  static async getOffersByStatus(status: string) {
    return await OfferModel.findByStatus(status);
  }

  static async createOffer(data: CreateOfferData) {
    return await OfferModel.create(data);
  }

  static async updateOffer(id: number, data: Partial<CreateOfferData>) {
    const offer = await OfferModel.findById(id);
    if (!offer) {
      throw new Error('Offer not found');
    }
    return await OfferModel.update(id, data);
  }

  static async deleteOffer(id: number) {
    const offer = await OfferModel.findById(id);
    if (!offer) {
      throw new Error('Offer not found');
    }
    await OfferModel.delete(id);
    return { message: 'Offer deleted successfully' };
  }
}

