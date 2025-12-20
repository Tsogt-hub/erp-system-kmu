import { apiClient } from './client';

// Adresstypen
export const ADDRESS_TYPES = [
  { value: 'billing', label: 'Rechnungsadresse', icon: '💰' },
  { value: 'delivery', label: 'Lieferadresse', icon: '🚚' },
  { value: 'installation', label: 'Installationsadresse', icon: '🔧' },
  { value: 'project', label: 'Projektadresse', icon: '📍' },
  { value: 'other', label: 'Sonstige', icon: '📬' },
];

export interface ObjectAddress {
  id: number;
  entity_type: 'contact' | 'company' | 'project';
  entity_id: number;
  address_type: string;
  label?: string;
  street: string;
  house_number?: string;
  address_line_2?: string;
  postal_code: string;
  city: string;
  state?: string;
  country: string;
  is_default: boolean;
  notes?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateObjectAddressData {
  entity_type: 'contact' | 'company' | 'project';
  entity_id: number;
  address_type: string;
  label?: string;
  street: string;
  house_number?: string;
  address_line_2?: string;
  postal_code: string;
  city: string;
  state?: string;
  country?: string;
  is_default?: boolean;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export const objectAddressesApi = {
  getByEntity: async (entityType: string, entityId: number): Promise<ObjectAddress[]> => {
    const response = await apiClient.get(`/object-addresses/entity/${entityType}/${entityId}`);
    return response.data;
  },

  getDefault: async (entityType: string, entityId: number, addressType?: string): Promise<ObjectAddress | null> => {
    const response = await apiClient.get(`/object-addresses/entity/${entityType}/${entityId}/default`, {
      params: addressType ? { addressType } : {},
    });
    return response.data;
  },

  getById: async (id: number): Promise<ObjectAddress> => {
    const response = await apiClient.get(`/object-addresses/${id}`);
    return response.data;
  },

  create: async (data: CreateObjectAddressData): Promise<ObjectAddress> => {
    const response = await apiClient.post('/object-addresses', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateObjectAddressData>): Promise<ObjectAddress> => {
    const response = await apiClient.put(`/object-addresses/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/object-addresses/${id}`);
  },

  getTypes: async (): Promise<string[]> => {
    const response = await apiClient.get('/object-addresses/types');
    return response.data;
  },
};

// Helper functions
export function getAddressTypeLabel(type: string): string {
  const t = ADDRESS_TYPES.find(at => at.value === type);
  return t?.label || type;
}

export function getAddressTypeIcon(type: string): string {
  const t = ADDRESS_TYPES.find(at => at.value === type);
  return t?.icon || '📬';
}

export function formatAddress(address: ObjectAddress): string {
  const parts = [
    address.street + (address.house_number ? ' ' + address.house_number : ''),
    address.address_line_2,
    `${address.postal_code} ${address.city}`,
    address.state,
    address.country !== 'Deutschland' ? address.country : null,
  ].filter(Boolean);
  return parts.join(', ');
}

export function formatAddressMultiline(address: ObjectAddress): string {
  const lines = [
    address.street + (address.house_number ? ' ' + address.house_number : ''),
    address.address_line_2,
    `${address.postal_code} ${address.city}`,
    address.state,
    address.country !== 'Deutschland' ? address.country : null,
  ].filter(Boolean);
  return lines.join('\n');
}








