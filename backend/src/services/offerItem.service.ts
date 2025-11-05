import { OfferItemModel, CreateOfferItemData } from '../models/OfferItem';
import { OfferModel } from '../models/Offer';

export class OfferItemService {
  static async getItemsByOfferId(offerId: number) {
    return await OfferItemModel.findByOfferId(offerId);
  }

  static async getItemById(id: number) {
    const item = await OfferItemModel.findById(id);
    if (!item) {
      throw new Error('Offer item not found');
    }
    return item;
  }

  static async createItem(data: CreateOfferItemData) {
    const item = await OfferItemModel.create(data);
    // Recalculate offer amount
    await this.recalculateOfferAmount(data.offer_id);
    return item;
  }

  static async updateItem(id: number, data: Partial<CreateOfferItemData>) {
    const item = await OfferItemModel.findById(id);
    if (!item) {
      throw new Error('Offer item not found');
    }
    const updated = await OfferItemModel.update(id, data);
    // Recalculate offer amount
    await this.recalculateOfferAmount(item.offer_id);
    return updated;
  }

  static async deleteItem(id: number) {
    const item = await OfferItemModel.findById(id);
    if (!item) {
      throw new Error('Offer item not found');
    }
    const offerId = item.offer_id;
    await OfferItemModel.delete(id);
    // Recalculate offer amount
    await this.recalculateOfferAmount(offerId);
    return { message: 'Offer item deleted successfully' };
  }

  static async recalculateOfferAmount(offerId: number) {
    const items = await OfferItemModel.findByOfferId(offerId);
    let totalAmount = 0;

    items.forEach((item) => {
      const subtotal = item.quantity * item.unit_price;
      const discount = item.discount_percent ? (subtotal * item.discount_percent / 100) : 0;
      totalAmount += subtotal - discount;
    });

    // Update offer amount
    await OfferModel.update(offerId, { amount: totalAmount });
  }
}





