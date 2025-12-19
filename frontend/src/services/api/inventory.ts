import { apiClient } from './client';

export interface Item {
  id: number;
  name: string;
  sku?: string;
  ean?: string;  // Europäische Artikelnummer (Barcode)
  description?: string;
  unit: string;
  price: number;
  selling_price?: number; // Alias für price (Verkaufspreis/VK)
  purchase_price?: number; // Einkaufspreis (EK)
  vat_rate?: number;  // MwSt-Satz: 0, 7, 19
  category?: string;
  subcategory?: string;
  manufacturer?: string;
  supplier_id?: number;  // Lieferant (FK zu contacts)
  supplier_article_number?: string;  // Lieferanten-Artikelnummer
  cost_center?: string;  // Kostenstelle
  price_calculation_id?: number;  // Preisberechnungsformel
  image_url?: string;
  features?: string[]; // Feature-Liste für Produktbeschreibung
  specifications?: Record<string, string>; // Technische Daten
  is_service: boolean;  // Unterscheidung Artikel vs. Leistung
  time_minutes?: number;  // Zeitaufwand in Minuten (für Leistungen)
  internal_name?: string;  // Interner Suchname (für Leistungen)
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
  ean?: string;
  description?: string;
  unit?: string;
  price?: number;
  purchase_price?: number;
  vat_rate?: number;
  category?: string;
  subcategory?: string;
  manufacturer?: string;
  supplier_id?: number;
  supplier_article_number?: string;
  cost_center?: string;
  price_calculation_id?: number;
  image_url?: string;
  features?: string[];
  specifications?: Record<string, string>;
  is_service?: boolean;
  time_minutes?: number;
  internal_name?: string;
}

// Verkaufspreisberechnung (wie Hero)
export interface PriceCalculation {
  id: number;
  name: string;
  formula: string;
  margin_percent?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

// Artikel-Kategorien für PV-Branche (wie Hero)
export const ITEM_CATEGORIES = [
  { value: 'module', label: 'Solarmodule', subcategories: ['Monokristallin', 'Glas/Glas', 'Bifazial'] },
  { value: 'inverter', label: 'Wechselrichter', subcategories: ['String', 'Hybrid', 'Mikro'] },
  { value: 'storage', label: 'Speicher', subcategories: ['Lithium', 'LFP', 'Hochvolt', 'Niedervolt'] },
  { value: 'optimizer', label: 'Optimierer', subcategories: ['SolarEdge', 'Tigo', 'Huawei'] },
  { value: 'mounting', label: 'Montagesystem', subcategories: ['Aufdach', 'Flachdach', 'Fassade', 'Carport'] },
  { value: 'cable', label: 'Kabel & Stecker', subcategories: ['DC-Kabel', 'AC-Kabel', 'MC4'] },
  { value: 'protection', label: 'Schutzgeräte', subcategories: ['Überspannungsschutz', 'FI-Schalter', 'Sicherung'] },
  { value: 'wallbox', label: 'Wallboxen', subcategories: ['11kW', '22kW', 'Bidirektional'] },
  { value: 'accessory', label: 'Zubehör', subcategories: ['Energiezähler', 'Heizstab', 'Controller'] },
  { value: 'service', label: 'Dienstleistungen', subcategories: ['Montage', 'Elektro', 'Planung', 'Anmeldung'] },
];

export const inventoryApi = {
  // Items
  getItems: async (search?: string, category?: string): Promise<Item[]> => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (category) params.category = category;
    const response = await apiClient.get('/inventory/items', { params });
    return response.data;
  },

  // Alias für getItems mit filter-Objekt
  getAll: async (filters?: { search?: string; category?: string }): Promise<Item[]> => {
    const params: Record<string, string> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.category) params.category = filters.category;
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

  // Artikel-Suche mit Vorschlägen (wie Hero)
  searchItems: async (query: string, limit: number = 20): Promise<Item[]> => {
    const response = await apiClient.get('/inventory/items/search', {
      params: { q: query, limit },
    });
    return response.data;
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

  // Leistungen (Services) - wie Hero SupplyServices
  getServices: async (search?: string): Promise<Item[]> => {
    const params: Record<string, string> = { is_service: 'true' };
    if (search) params.search = search;
    const response = await apiClient.get('/inventory/items', { params });
    return response.data;
  },

  createService: async (data: CreateItemData): Promise<Item> => {
    const response = await apiClient.post('/inventory/items', { ...data, is_service: true });
    return response.data;
  },

  // Verkaufspreise/Preisberechnungen - wie Hero DocumentElements/sales_prices
  getPriceCalculations: async (): Promise<PriceCalculation[]> => {
    const response = await apiClient.get('/inventory/price-calculations');
    return response.data;
  },

  createPriceCalculation: async (data: { name: string; formula: string; margin_percent?: number }): Promise<PriceCalculation> => {
    const response = await apiClient.post('/inventory/price-calculations', data);
    return response.data;
  },

  updatePriceCalculation: async (id: number, data: Partial<{ name: string; formula: string; margin_percent?: number }>): Promise<PriceCalculation> => {
    const response = await apiClient.put(`/inventory/price-calculations/${id}`, data);
    return response.data;
  },

  deletePriceCalculation: async (id: number): Promise<void> => {
    await apiClient.delete(`/inventory/price-calculations/${id}`);
  },
};
