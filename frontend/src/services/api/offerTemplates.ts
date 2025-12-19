import { apiClient } from './client';

export interface OfferTemplate {
  id: number;
  name: string;
  description?: string;
  intro_text?: string;
  footer_text?: string;
  payment_terms?: string;
  valid_days: number;
  tax_rate: number;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  created_user_name?: string;
  items?: OfferTemplateItem[];
}

export interface OfferTemplateItem {
  id: number;
  template_id: number;
  item_id?: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  purchase_price?: number;
  discount_percent?: number;
  tax_rate: number;
  position_order: number;
  item_type: string;
  item_name?: string;
  item_sku?: string;
}

export interface CreateOfferTemplateData {
  name: string;
  description?: string;
  intro_text?: string;
  footer_text?: string;
  payment_terms?: string;
  valid_days?: number;
  tax_rate?: number;
  is_active?: boolean;
}

export interface CreateOfferTemplateItemData {
  item_id?: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  purchase_price?: number;
  discount_percent?: number;
  tax_rate?: number;
  position_order?: number;
  item_type?: string;
}

export const offerTemplatesApi = {
  getAll: async (activeOnly: boolean = true): Promise<OfferTemplate[]> => {
    const response = await apiClient.get('/offer-templates', {
      params: { activeOnly },
    });
    return response.data;
  },

  getById: async (id: number): Promise<OfferTemplate> => {
    const response = await apiClient.get(`/offer-templates/${id}`);
    return response.data;
  },

  create: async (data: CreateOfferTemplateData): Promise<OfferTemplate> => {
    const response = await apiClient.post('/offer-templates', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateOfferTemplateData>): Promise<OfferTemplate> => {
    const response = await apiClient.put(`/offer-templates/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/offer-templates/${id}`);
  },

  // Items
  getItems: async (templateId: number): Promise<OfferTemplateItem[]> => {
    const response = await apiClient.get(`/offer-templates/${templateId}/items`);
    return response.data;
  },

  addItem: async (templateId: number, data: CreateOfferTemplateItemData): Promise<OfferTemplateItem> => {
    const response = await apiClient.post(`/offer-templates/${templateId}/items`, data);
    return response.data;
  },

  updateItem: async (itemId: number, data: Partial<CreateOfferTemplateItemData>): Promise<OfferTemplateItem> => {
    const response = await apiClient.put(`/offer-templates/items/${itemId}`, data);
    return response.data;
  },

  deleteItem: async (itemId: number): Promise<void> => {
    await apiClient.delete(`/offer-templates/items/${itemId}`);
  },

  // Create offer from template
  createOfferFromTemplate: async (templateId: number, offerId: number): Promise<void> => {
    await apiClient.post(`/offer-templates/${templateId}/create-offer`, { offerId });
  },
};






