import { apiClient } from './client';

export interface Project {
  id: number;
  name: string;
  reference: string;
  customer_id?: number;
  customer_name?: string;
  status: string;
  project_type?: string;
  pipeline_step?: string;
  source?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectData {
  name: string;
  reference?: string;
  customer_id?: number;
  status?: string;
  project_type?: string;
  pipeline_step?: string;
  source?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const response = await apiClient.get('/projects');
    return response.data;
  },

  getById: async (id: number): Promise<Project> => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  create: async (data: CreateProjectData): Promise<Project> => {
    const response = await apiClient.post('/projects', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateProjectData>): Promise<Project> => {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },

  getMembers: async (id: number): Promise<Array<{ id: number; user_id: number; role: string; first_name: string; last_name: string; email: string }>> => {
    const response = await apiClient.get(`/projects/${id}/members`);
    return response.data;
  },

  addMember: async (id: number, user_id: number, role: string = 'member'): Promise<void> => {
    await apiClient.post(`/projects/${id}/members`, { user_id, role });
  },

  removeMember: async (id: number, user_id: number): Promise<void> => {
    await apiClient.delete(`/projects/${id}/members`, { data: { user_id } });
  },
};

