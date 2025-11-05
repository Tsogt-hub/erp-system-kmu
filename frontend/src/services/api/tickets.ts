import { apiClient } from './client';

export interface Ticket {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigned_to?: number;
  created_by: number;
  due_date?: string;
  project_id?: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  assigned_user_name?: string;
  created_user_name?: string;
  project_name?: string;
}

export interface CreateTicketData {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assigned_to?: number;
  due_date?: string;
  project_id?: number;
}

export const ticketsApi = {
  getAll: async (status?: string): Promise<Ticket[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get('/tickets', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Ticket> => {
    const response = await apiClient.get(`/tickets/${id}`);
    return response.data;
  },

  create: async (data: CreateTicketData): Promise<Ticket> => {
    const response = await apiClient.post('/tickets', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateTicketData>): Promise<Ticket> => {
    const response = await apiClient.put(`/tickets/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/tickets/${id}`);
  },
};







