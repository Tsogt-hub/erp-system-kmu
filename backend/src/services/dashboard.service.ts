import { query } from '../config/database';
import { ProjectModel } from '../models/Project';
import { TimeEntryModel } from '../models/TimeEntry';
import { TicketModel } from '../models/Ticket';
import { CompanyModel } from '../models/Company';

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

export class DashboardService {
  static async getStats(userId?: number): Promise<DashboardStats> {
    // Projects stats
    const allProjects = await ProjectModel.findAll(userId);
    const projects = {
      total: allProjects.length,
      active: allProjects.filter(p => p.status === 'active').length,
      completed: allProjects.filter(p => p.status === 'completed').length,
    };

    // Time entries stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const allEntries = await TimeEntryModel.findAll(userId);
    const todayEntries = await TimeEntryModel.findByDateRange(today, endOfToday, userId);
    const weekEntries = await TimeEntryModel.findByDateRange(weekStart, weekEnd, userId);

    const calculateHours = (entries: any[]) => {
      return entries.reduce((total, entry) => {
        if (entry.end_time) {
          const start = new Date(entry.start_time).getTime();
          const end = new Date(entry.end_time).getTime();
          const minutes = (end - start) / 1000 / 60 - (entry.break_duration || 0);
          return total + minutes / 60;
        }
        return total;
      }, 0);
    };

    const timeEntries = {
      totalHours: calculateHours(allEntries),
      todayHours: calculateHours(todayEntries),
      thisWeekHours: calculateHours(weekEntries),
    };

    // Tickets stats
    const allTickets = await TicketModel.findAll(userId);
    const tickets = {
      total: allTickets.length,
      open: allTickets.filter(t => t.status === 'open').length,
      inProgress: allTickets.filter(t => t.status === 'in_progress').length,
      resolved: allTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
    };

    // Customers stats
    const allCompanies = await CompanyModel.findAll();
    const customers = {
      total: allCompanies.length,
    };

    // Recent projects
    const recentProjects = allProjects
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    // Recent tickets
    const recentTickets = allTickets
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    return {
      projects,
      timeEntries,
      tickets,
      customers,
      recentProjects,
      recentTickets,
    };
  }
}






