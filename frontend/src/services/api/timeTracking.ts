import { apiClient } from './client';

export interface TimeEntry {
  id: number;
  user_id: number;
  project_id?: number;
  project_name?: string;
  start_time: string;
  end_time?: string;
  break_duration: number;
  description?: string;
  type: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  duration_minutes?: number;
  duration_hours?: string;
}

export interface CreateTimeEntryData {
  project_id?: number;
  start_time: string;
  end_time?: string;
  break_duration?: number;
  description?: string;
  type?: string;
}

export const timeTrackingApi = {
  getAll: async (projectId?: number, startDate?: string, endDate?: string): Promise<TimeEntry[]> => {
    const params: any = {};
    if (projectId) params.projectId = projectId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await apiClient.get('/time-tracking', { params });
    return response.data;
  },

  getById: async (id: number): Promise<TimeEntry> => {
    const response = await apiClient.get(`/time-tracking/${id}`);
    return response.data;
  },

  getActive: async (): Promise<TimeEntry | null> => {
    const response = await apiClient.get('/time-tracking/active');
    return response.data;
  },

  start: async (projectId?: number, description?: string): Promise<TimeEntry> => {
    const response = await apiClient.post('/time-tracking/start', {
      project_id: projectId,
      description,
    });
    return response.data;
  },

  stop: async (): Promise<TimeEntry> => {
    const response = await apiClient.post('/time-tracking/stop');
    return response.data;
  },

  create: async (data: CreateTimeEntryData): Promise<TimeEntry> => {
    const response = await apiClient.post('/time-tracking', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateTimeEntryData>): Promise<TimeEntry> => {
    const response = await apiClient.put(`/time-tracking/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/time-tracking/${id}`);
  },
};


















