import { apiClient } from './client';

export interface CalendarEventEmployee {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  resource_id: number;
  resource_type: string;
  resource_name?: string;
  project_id?: number;
  project_name?: string;
  created_by?: number;
  created_user_name?: string;
  recurrence_rule?: string;
  color?: string;
  status?: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  travel_time?: number;
  notes?: string;
  employees?: CalendarEventEmployee[];
  created_at: string;
  updated_at: string;
}

export interface CreateCalendarEventData {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  resource_id: number;
  resource_type: string;
  project_id?: number;
  recurrence_rule?: string;
  color?: string;
  status?: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  travel_time?: number;
  notes?: string;
  employee_ids?: number[];
}

export interface CalendarEventFilters {
  startDate?: string;
  endDate?: string;
  resourceId?: number;
  resourceType?: string;
  projectId?: number;
}

export const calendarEventsApi = {
  getAll: async (filters?: CalendarEventFilters): Promise<CalendarEvent[]> => {
    const params: any = {};
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.resourceId) params.resourceId = filters.resourceId;
    if (filters?.resourceType) params.resourceType = filters.resourceType;
    if (filters?.projectId) params.projectId = filters.projectId;
    
    const response = await apiClient.get('/calendar-events', { params });
    return response.data;
  },

  getById: async (id: number): Promise<CalendarEvent> => {
    const response = await apiClient.get(`/calendar-events/${id}`);
    return response.data;
  },

  create: async (data: CreateCalendarEventData): Promise<CalendarEvent> => {
    const response = await apiClient.post('/calendar-events', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateCalendarEventData>): Promise<CalendarEvent> => {
    const response = await apiClient.put(`/calendar-events/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/calendar-events/${id}`);
  },
};

