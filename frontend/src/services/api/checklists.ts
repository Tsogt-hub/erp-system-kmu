import { apiClient } from './client';

export interface Checklist {
  id: number;
  name: string;
  description?: string;
  entity_type: 'project' | 'contact' | 'offer' | 'template';
  entity_id?: number;
  is_template: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  items?: ChecklistItem[];
  progress?: number;
}

export interface ChecklistItem {
  id: number;
  checklist_id: number;
  title: string;
  description?: string;
  position_order: number;
  is_completed: boolean;
  completed_at?: string;
  completed_by_user_id?: number;
  due_date?: string;
  assigned_to_user_id?: number;
  created_at: string;
  updated_at: string;
  completed_by_name?: string;
  assigned_to_name?: string;
}

export interface CreateChecklistData {
  name: string;
  description?: string;
  entity_type: 'project' | 'contact' | 'offer' | 'template';
  entity_id?: number;
  is_template?: boolean;
}

export interface CreateChecklistItemData {
  title: string;
  description?: string;
  position_order?: number;
  due_date?: string;
  assigned_to_user_id?: number;
}

export const checklistsApi = {
  // Get by entity
  getByEntity: async (entityType: string, entityId: number): Promise<Checklist[]> => {
    const response = await apiClient.get(`/checklists/entity/${entityType}/${entityId}`);
    return response.data;
  },

  // Templates
  getTemplates: async (): Promise<Checklist[]> => {
    const response = await apiClient.get('/checklists/templates');
    return response.data;
  },

  createFromTemplate: async (templateId: number, entityType: string, entityId: number): Promise<Checklist> => {
    const response = await apiClient.post(`/checklists/templates/${templateId}/create`, {
      entityType,
      entityId,
    });
    return response.data;
  },

  // CRUD
  getById: async (id: number): Promise<Checklist> => {
    const response = await apiClient.get(`/checklists/${id}`);
    return response.data;
  },

  create: async (data: CreateChecklistData): Promise<Checklist> => {
    const response = await apiClient.post('/checklists', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateChecklistData>): Promise<Checklist> => {
    const response = await apiClient.put(`/checklists/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/checklists/${id}`);
  },

  // Items
  addItem: async (checklistId: number, data: CreateChecklistItemData): Promise<ChecklistItem> => {
    const response = await apiClient.post(`/checklists/${checklistId}/items`, data);
    return response.data;
  },

  updateItem: async (itemId: number, data: Partial<CreateChecklistItemData>): Promise<ChecklistItem> => {
    const response = await apiClient.put(`/checklists/items/${itemId}`, data);
    return response.data;
  },

  toggleItem: async (itemId: number): Promise<ChecklistItem> => {
    const response = await apiClient.post(`/checklists/items/${itemId}/toggle`);
    return response.data;
  },

  deleteItem: async (itemId: number): Promise<void> => {
    await apiClient.delete(`/checklists/items/${itemId}`);
  },
};






