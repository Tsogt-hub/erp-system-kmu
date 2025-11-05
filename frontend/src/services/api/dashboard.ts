import { apiClient } from './client';

export interface DashboardStats {
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  timeEntries: {
    totalHours: number;
    todayHours: number;
    thisWeekHours: number;
  };
  tickets: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
  customers: {
    total: number;
  };
  recentProjects: any[];
  recentTickets: any[];
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },
};





