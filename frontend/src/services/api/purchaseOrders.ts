import { apiClient } from './client';

export interface PurchaseOrder {
  id: number;
  order_number: string;
  supplier_id: number;
  supplier_name?: string;
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  shipping_cost: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'confirmed' | 'shipped' | 'received' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'partial' | 'paid';
  delivery_address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: number;
  purchase_order_id: number;
  item_id?: number;
  item_name: string;
  sku?: string;
  description?: string;
  quantity: number;
  received_quantity: number;
  unit: string;
  unit_price: number;
  tax_rate: number;
  total_price: number;
}

export interface CreatePurchaseOrderData {
  supplier_id: number;
  order_date: string;
  expected_delivery_date?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  shipping_cost?: number;
  total_amount: number;
  delivery_address?: string;
  notes?: string;
}

export interface PurchaseOrderStats {
  total: number;
  pending: number;
  in_transit: number;
  received: number;
  total_value: number;
  outstanding_value: number;
}

export const purchaseOrdersApi = {
  getAll: async (filters?: { status?: string; supplier_id?: number }): Promise<PurchaseOrder[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.supplier_id) params.append('supplier_id', filters.supplier_id.toString());
    const response = await apiClient.get(`/purchase-orders?${params.toString()}`);
    return response.data.data || response.data;
  },

  getById: async (id: number): Promise<PurchaseOrder> => {
    const response = await apiClient.get(`/purchase-orders/${id}`);
    return response.data.data || response.data;
  },

  getStats: async (): Promise<PurchaseOrderStats> => {
    const response = await apiClient.get('/purchase-orders/stats');
    return response.data.data || response.data;
  },

  create: async (data: CreatePurchaseOrderData): Promise<PurchaseOrder> => {
    const response = await apiClient.post('/purchase-orders', data);
    return response.data.data || response.data;
  },

  update: async (id: number, data: Partial<CreatePurchaseOrderData>): Promise<PurchaseOrder> => {
    const response = await apiClient.put(`/purchase-orders/${id}`, data);
    return response.data.data || response.data;
  },

  updateStatus: async (id: number, status: PurchaseOrder['status']): Promise<PurchaseOrder> => {
    const response = await apiClient.patch(`/purchase-orders/${id}/status`, { status });
    return response.data.data || response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/purchase-orders/${id}`);
  },

  // Items
  getItems: async (orderId: number): Promise<PurchaseOrderItem[]> => {
    const response = await apiClient.get(`/purchase-orders/${orderId}/items`);
    return response.data.data || response.data;
  },

  addItem: async (orderId: number, item: Omit<PurchaseOrderItem, 'id' | 'purchase_order_id'>): Promise<PurchaseOrderItem> => {
    const response = await apiClient.post(`/purchase-orders/${orderId}/items`, item);
    return response.data.data || response.data;
  },

  // Receive items
  receiveItems: async (orderId: number, items: { item_id: number; quantity: number }[]): Promise<void> => {
    await apiClient.post(`/purchase-orders/${orderId}/receive`, { items });
  },
};
