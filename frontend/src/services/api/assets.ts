import { apiClient } from './client';

export interface Asset {
  id: number;
  asset_number: string;
  name: string;
  description?: string;
  category: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_price: number;
  current_value: number;
  depreciation_rate: number;
  warranty_expiry?: string;
  location?: string;
  assigned_to?: number;
  assigned_to_name?: string;
  status: 'available' | 'in_use' | 'maintenance' | 'disposed' | 'reserved';
  condition: 'new' | 'good' | 'fair' | 'poor';
  next_maintenance_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetCategory {
  value: string;
  label: string;
}

export const ASSET_CATEGORIES: AssetCategory[] = [
  { value: 'vehicle', label: 'Fahrzeug' },
  { value: 'machinery', label: 'Maschinen & Geräte' },
  { value: 'it_equipment', label: 'IT-Ausstattung' },
  { value: 'office_furniture', label: 'Büromöbel' },
  { value: 'tools', label: 'Werkzeuge' },
  { value: 'construction_equipment', label: 'Baustellenausrüstung' },
  { value: 'measurement', label: 'Messgeräte' },
  { value: 'safety', label: 'Sicherheitsausrüstung' },
  { value: 'other', label: 'Sonstiges' },
];

export interface CreateAssetData {
  name: string;
  description?: string;
  category: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_price: number;
  current_value?: number;
  depreciation_rate?: number;
  warranty_expiry?: string;
  location?: string;
  assigned_to?: number;
  status?: Asset['status'];
  condition?: Asset['condition'];
  next_maintenance_date?: string;
  notes?: string;
}

export interface AssetStats {
  total: number;
  total_value: number;
  available: number;
  in_use: number;
  maintenance_due: number;
  disposed: number;
}

export interface MaintenanceRecord {
  id: number;
  asset_id: number;
  maintenance_date: string;
  maintenance_type: 'inspection' | 'repair' | 'calibration' | 'service';
  description: string;
  cost: number;
  performed_by?: string;
  next_maintenance_date?: string;
  notes?: string;
  created_at: string;
}

export const assetsApi = {
  getAll: async (filters?: { status?: string; category?: string; assigned_to?: number }): Promise<Asset[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to.toString());
    const response = await apiClient.get(`/assets?${params.toString()}`);
    return response.data.data || response.data;
  },

  getById: async (id: number): Promise<Asset> => {
    const response = await apiClient.get(`/assets/${id}`);
    return response.data.data || response.data;
  },

  getStats: async (): Promise<AssetStats> => {
    const response = await apiClient.get('/assets/stats');
    return response.data.data || response.data;
  },

  create: async (data: CreateAssetData): Promise<Asset> => {
    const response = await apiClient.post('/assets', data);
    return response.data.data || response.data;
  },

  update: async (id: number, data: Partial<CreateAssetData>): Promise<Asset> => {
    const response = await apiClient.put(`/assets/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/assets/${id}`);
  },

  // Assignment
  assign: async (id: number, userId: number): Promise<Asset> => {
    const response = await apiClient.patch(`/assets/${id}/assign`, { user_id: userId });
    return response.data.data || response.data;
  },

  unassign: async (id: number): Promise<Asset> => {
    const response = await apiClient.patch(`/assets/${id}/unassign`);
    return response.data.data || response.data;
  },

  // Maintenance
  getMaintenanceRecords: async (assetId: number): Promise<MaintenanceRecord[]> => {
    const response = await apiClient.get(`/assets/${assetId}/maintenance`);
    return response.data.data || response.data;
  },

  addMaintenanceRecord: async (assetId: number, record: Omit<MaintenanceRecord, 'id' | 'asset_id' | 'created_at'>): Promise<MaintenanceRecord> => {
    const response = await apiClient.post(`/assets/${assetId}/maintenance`, record);
    return response.data.data || response.data;
  },

  // Depreciation calculation
  calculateDepreciation: async (id: number): Promise<{ current_value: number; depreciation_amount: number }> => {
    const response = await apiClient.get(`/assets/${id}/depreciation`);
    return response.data.data || response.data;
  },
};
