import { apiClient } from './client';

export interface Item {
  id: number;
  name: string;
  sku?: string;
  description?: string;
  unit: string;
  price: number;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryStock {
  id: number;
  item_id: number;
  warehouse_id: number;
  quantity: number;
  updated_at: string;
  item_name?: string;
  sku?: string;
  warehouse_name?: string;
}

export interface InventoryMovement {
  id: number;
  item_id: number;
  warehouse_id: number;
  quantity: number;
  movement_type: 'IN' | 'OUT';
  reference?: string;
  notes?: string;
  created_by?: number;
  created_at: string;
  item_name?: string;
  warehouse_name?: string;
  created_user_name?: string;
}

export interface CreateItemData {
  name: string;
  sku?: string;
  description?: string;
  unit?: string;
  price?: number;
  category?: string;
}

export interface CreateMovementData {
  item_id: number;
  warehouse_id: number;
  quantity: number;
  movement_type: 'IN' | 'OUT';
  reference?: string;
  notes?: string;
}

export interface Warehouse {
  id: number;
  name: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWarehouseData {
  name: string;
  address?: string;
}

export const inventoryApi = {
  // Items
  getItems: async (search?: string): Promise<Item[]> => {
    const params = search ? { search } : {};
    const response = await apiClient.get('/inventory/items', { params });
    return response.data;
  },

  getItemById: async (id: number): Promise<Item> => {
    const response = await apiClient.get(`/inventory/items/${id}`);
    return response.data;
  },

  createItem: async (data: CreateItemData): Promise<Item> => {
    const response = await apiClient.post('/inventory/items', data);
    return response.data;
  },

  updateItem: async (id: number, data: Partial<CreateItemData>): Promise<Item> => {
    const response = await apiClient.put(`/inventory/items/${id}`, data);
    return response.data;
  },

  deleteItem: async (id: number): Promise<void> => {
    await apiClient.delete(`/inventory/items/${id}`);
  },

  // Stock
  getStock: async (warehouseId?: number): Promise<InventoryStock[]> => {
    const params = warehouseId ? { warehouseId } : {};
    const response = await apiClient.get('/inventory/stock', { params });
    return response.data;
  },

  // Movements
  getMovements: async (warehouseId?: number, itemId?: number): Promise<InventoryMovement[]> => {
    const params: any = {};
    if (warehouseId) params.warehouseId = warehouseId;
    if (itemId) params.itemId = itemId;
    const response = await apiClient.get('/inventory/movements', { params });
    return response.data;
  },

  createMovement: async (data: CreateMovementData): Promise<InventoryMovement> => {
    const response = await apiClient.post('/inventory/movements', data);
    return response.data;
  },

  // Import
  importItems: async (file: File): Promise<{ message: string; result: { success: number; errors: Array<{ row: number; error: string }>; total: number } }> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/inventory/items/import`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Fehler beim Import');
    }

    return response.json();
  },

  // Warehouses
  getWarehouses: async (): Promise<Warehouse[]> => {
    const response = await apiClient.get('/inventory/warehouses');
    return response.data;
  },

  getWarehouseById: async (id: number): Promise<Warehouse> => {
    const response = await apiClient.get(`/inventory/warehouses/${id}`);
    return response.data;
  },

  createWarehouse: async (data: CreateWarehouseData): Promise<Warehouse> => {
    const response = await apiClient.post('/inventory/warehouses', data);
    return response.data;
  },

  updateWarehouse: async (id: number, data: Partial<CreateWarehouseData>): Promise<Warehouse> => {
    const response = await apiClient.put(`/inventory/warehouses/${id}`, data);
    return response.data;
  },

  deleteWarehouse: async (id: number): Promise<void> => {
    await apiClient.delete(`/inventory/warehouses/${id}`);
  },
};

