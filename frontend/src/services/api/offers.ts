import { apiClient } from './client';

export interface Offer {
  id: number;
  offer_number: string;
  project_id?: number;
  customer_id?: number;
  amount: number;
  tax_rate: number;
  status: string;
  valid_until?: string;
  notes?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  project_name?: string;
  created_user_name?: string;
  items?: OfferItem[];
}

export interface OfferItem {
  id: number;
  offer_id: number;
  item_id?: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent?: number;
  tax_rate: number;
  position_order: number;
  created_at: string;
  updated_at: string;
  item_name?: string;
  item_sku?: string;
}

export interface CreateOfferItemData {
  offer_id: number;
  item_id?: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent?: number;
  tax_rate?: number;
}

export interface CreateOfferData {
  project_id?: number;
  customer_id?: number;
  amount: number;
  tax_rate?: number;
  status?: string;
  valid_until?: string;
  notes?: string;
}

export const offersApi = {
  getAll: async (status?: string): Promise<Offer[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get('/offers', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Offer> => {
    const response = await apiClient.get(`/offers/${id}`);
    return response.data;
  },

  create: async (data: CreateOfferData): Promise<Offer> => {
    const response = await apiClient.post('/offers', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateOfferData>): Promise<Offer> => {
    const response = await apiClient.put(`/offers/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/offers/${id}`);
  },

  // Offer Items
  getItems: async (offerId: number): Promise<OfferItem[]> => {
    const response = await apiClient.get(`/offers/${offerId}/items`);
    return response.data;
  },

  createItem: async (data: CreateOfferItemData): Promise<OfferItem> => {
    const response = await apiClient.post('/offers/items', data);
    return response.data;
  },

  updateItem: async (id: number, data: Partial<CreateOfferItemData>): Promise<OfferItem> => {
    const response = await apiClient.put(`/offers/items/${id}`, data);
    return response.data;
  },

  deleteItem: async (id: number): Promise<void> => {
    await apiClient.delete(`/offers/items/${id}`);
  },

  // Offer Texts
  getTexts: async (offerId: number): Promise<OfferText[]> => {
    const response = await apiClient.get(`/offers/${offerId}/texts`);
    return response.data;
  },

  createText: async (data: CreateOfferTextData): Promise<OfferText> => {
    const response = await apiClient.post('/offers/texts', data);
    return response.data;
  },

  updateText: async (id: number, data: Partial<CreateOfferTextData>): Promise<OfferText> => {
    const response = await apiClient.put(`/offers/texts/${id}`, data);
    return response.data;
  },

  deleteText: async (id: number): Promise<void> => {
    await apiClient.delete(`/offers/texts/${id}`);
  },

  // Offer Titles
  getTitles: async (offerId: number): Promise<OfferTitle[]> => {
    const response = await apiClient.get(`/offers/${offerId}/titles`);
    return response.data;
  },

  createTitle: async (data: CreateOfferTitleData): Promise<OfferTitle> => {
    const response = await apiClient.post('/offers/titles', data);
    return response.data;
  },

  updateTitle: async (id: number, data: Partial<CreateOfferTitleData>): Promise<OfferTitle> => {
    const response = await apiClient.put(`/offers/titles/${id}`, data);
    return response.data;
  },

  deleteTitle: async (id: number): Promise<void> => {
    await apiClient.delete(`/offers/titles/${id}`);
  },
};

export interface OfferText {
  id: number;
  offer_id: number;
  title: string;
  description?: string;
  position_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateOfferTextData {
  offer_id: number;
  title: string;
  description?: string;
  position_order?: number;
}

export interface OfferTitle {
  id: number;
  offer_id: number;
  title: string;
  position_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateOfferTitleData {
  offer_id: number;
  title: string;
  position_order?: number;
}

