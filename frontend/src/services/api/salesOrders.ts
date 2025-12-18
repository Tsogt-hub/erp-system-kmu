import { apiClient } from './client';

export interface SalesOrder {
  id: number;
  order_number: string;
  contact_id: number;
  contact_name?: string;
  company_id?: number;
  company_name?: string;
  offer_id?: number;
  offer_number?: string;
  order_date: string;
  delivery_date?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: 'draft' | 'confirmed' | 'in_progress' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'partial' | 'paid';
  shipping_address?: string;
  billing_address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SalesOrderItem {
  id: number;
  sales_order_id: number;
  item_id?: number;
  item_name: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
  total_price: number;
}

export interface CreateSalesOrderData {
  contact_id: number;
  company_id?: number;
  offer_id?: number;
  order_date: string;
  delivery_date?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  shipping_address?: string;
  billing_address?: string;
  notes?: string;
}

export interface SalesOrderStats {
  total: number;
  confirmed: number;
  in_progress: number;
  completed: number;
  total_value: number;
}

export const salesOrdersApi = {
  getAll: async (filters?: { status?: string; contact_id?: number }): Promise<SalesOrder[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.contact_id) params.append('contact_id', filters.contact_id.toString());
    const response = await apiClient.get(`/sales-orders?${params.toString()}`);
    return response.data.data || response.data;
  },

  getById: async (id: number): Promise<SalesOrder> => {
    const response = await apiClient.get(`/sales-orders/${id}`);
    return response.data.data || response.data;
  },

  getStats: async (): Promise<SalesOrderStats> => {
    const response = await apiClient.get('/sales-orders/stats');
    return response.data.data || response.data;
  },

  create: async (data: CreateSalesOrderData): Promise<SalesOrder> => {
    const response = await apiClient.post('/sales-orders', data);
    return response.data.data || response.data;
  },

  update: async (id: number, data: Partial<CreateSalesOrderData>): Promise<SalesOrder> => {
    const response = await apiClient.put(`/sales-orders/${id}`, data);
    return response.data.data || response.data;
  },

  updateStatus: async (id: number, status: SalesOrder['status']): Promise<SalesOrder> => {
    const response = await apiClient.patch(`/sales-orders/${id}/status`, { status });
    return response.data.data || response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/sales-orders/${id}`);
  },

  // Items
  getItems: async (orderId: number): Promise<SalesOrderItem[]> => {
    const response = await apiClient.get(`/sales-orders/${orderId}/items`);
    return response.data.data || response.data;
  },

  addItem: async (orderId: number, item: Omit<SalesOrderItem, 'id' | 'sales_order_id'>): Promise<SalesOrderItem> => {
    const response = await apiClient.post(`/sales-orders/${orderId}/items`, item);
    return response.data.data || response.data;
  },

  // Create from offer
  createFromOffer: async (offerId: number): Promise<SalesOrder> => {
    const response = await apiClient.post(`/sales-orders/from-offer/${offerId}`);
    return response.data.data || response.data;
  },
};
