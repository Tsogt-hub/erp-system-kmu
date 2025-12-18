import { apiClient } from './client';

export interface InventoryMovement {
  id: number;
  item_id: number;
  item_name?: string;
  item_sku?: string;
  warehouse_id?: number;
  warehouse_name?: string;
  movement_type: 'incoming' | 'outgoing' | 'transfer' | 'adjustment';
  quantity: number;
  unit_price?: number;
  total_value?: number;
  reference_type?: 'purchase_order' | 'sales_order' | 'manual' | 'inventory_check' | 'production';
  reference_id?: number;
  reference_number?: string;
  supplier_id?: number;
  supplier_name?: string;
  customer_id?: number;
  customer_name?: string;
  batch_number?: string;
  serial_numbers?: string[];
  reason?: string;
  notes?: string;
  performed_by?: number;
  performed_by_name?: string;
  movement_date: string;
  created_at: string;
}

export interface CreateMovementData {
  item_id: number;
  warehouse_id?: number;
  movement_type: 'incoming' | 'outgoing' | 'transfer' | 'adjustment';
  quantity: number;
  unit_price?: number;
  reference_type?: string;
  reference_id?: number;
  supplier_id?: number;
  customer_id?: number;
  batch_number?: string;
  serial_numbers?: string[];
  reason?: string;
  notes?: string;
  movement_date?: string;
}

export interface InventoryStock {
  item_id: number;
  item_name: string;
  item_sku?: string;
  warehouse_id?: number;
  warehouse_name?: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  reorder_point?: number;
  last_movement_date?: string;
}

export interface MovementStats {
  total_movements: number;
  incoming_count: number;
  outgoing_count: number;
  incoming_value: number;
  outgoing_value: number;
  net_change: number;
}

export const inventoryMovementsApi = {
  getAll: async (filters?: { 
    movement_type?: string; 
    item_id?: number; 
    from_date?: string; 
    to_date?: string;
    warehouse_id?: number;
  }): Promise<InventoryMovement[]> => {
    const params = new URLSearchParams();
    if (filters?.movement_type) params.append('movement_type', filters.movement_type);
    if (filters?.item_id) params.append('item_id', filters.item_id.toString());
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);
    if (filters?.warehouse_id) params.append('warehouse_id', filters.warehouse_id.toString());
    const response = await apiClient.get(`/inventory/movements?${params.toString()}`);
    return response.data.data || response.data;
  },

  getIncoming: async (filters?: { from_date?: string; to_date?: string }): Promise<InventoryMovement[]> => {
    return inventoryMovementsApi.getAll({ ...filters, movement_type: 'incoming' });
  },

  getOutgoing: async (filters?: { from_date?: string; to_date?: string }): Promise<InventoryMovement[]> => {
    return inventoryMovementsApi.getAll({ ...filters, movement_type: 'outgoing' });
  },

  getById: async (id: number): Promise<InventoryMovement> => {
    const response = await apiClient.get(`/inventory/movements/${id}`);
    return response.data.data || response.data;
  },

  getStats: async (filters?: { from_date?: string; to_date?: string }): Promise<MovementStats> => {
    const params = new URLSearchParams();
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);
    const response = await apiClient.get(`/inventory/movements/stats?${params.toString()}`);
    return response.data.data || response.data;
  },

  create: async (data: CreateMovementData): Promise<InventoryMovement> => {
    const response = await apiClient.post('/inventory/movements', data);
    return response.data.data || response.data;
  },

  createIncoming: async (data: Omit<CreateMovementData, 'movement_type'>): Promise<InventoryMovement> => {
    return inventoryMovementsApi.create({ ...data, movement_type: 'incoming' });
  },

  createOutgoing: async (data: Omit<CreateMovementData, 'movement_type'>): Promise<InventoryMovement> => {
    return inventoryMovementsApi.create({ ...data, movement_type: 'outgoing' });
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/inventory/movements/${id}`);
  },

  // Stock levels
  getStock: async (filters?: { warehouse_id?: number; low_stock?: boolean }): Promise<InventoryStock[]> => {
    const params = new URLSearchParams();
    if (filters?.warehouse_id) params.append('warehouse_id', filters.warehouse_id.toString());
    if (filters?.low_stock) params.append('low_stock', 'true');
    const response = await apiClient.get(`/inventory/stock?${params.toString()}`);
    return response.data.data || response.data;
  },

  getItemStock: async (itemId: number): Promise<InventoryStock> => {
    const response = await apiClient.get(`/inventory/stock/${itemId}`);
    return response.data.data || response.data;
  },

  // Batch operations
  batchCreate: async (movements: CreateMovementData[]): Promise<InventoryMovement[]> => {
    const response = await apiClient.post('/inventory/movements/batch', { movements });
    return response.data.data || response.data;
  },
};
