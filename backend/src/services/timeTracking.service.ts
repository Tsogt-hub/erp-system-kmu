import { TimeEntryModel, CreateTimeEntryData } from '../models/TimeEntry';

export class TimeTrackingService {
  static async getAllTimeEntries(userId?: number) {
    return await TimeEntryModel.findAll(userId);
  }

  static async getTimeEntryById(id: number) {
    const entry = await TimeEntryModel.findById(id);
    if (!entry) {
      throw new Error('Time entry not found');
    }
    return entry;
  }

  static async getTimeEntriesByProject(projectId: number) {
    return await TimeEntryModel.findByProject(projectId);
  }

  static async getTimeEntriesByDateRange(startDate: Date, endDate: Date, userId?: number) {
    return await TimeEntryModel.findByDateRange(startDate, endDate, userId);
  }

  static async getActiveTimeEntry(userId: number) {
    return await TimeEntryModel.getActiveEntry(userId);
  }

  static async startTimeTracking(userId: number, projectId?: number, description?: string) {
    // Check if there's already an active entry
    const activeEntry = await TimeEntryModel.getActiveEntry(userId);
    if (activeEntry) {
      throw new Error('There is already an active time entry. Please stop it first.');
    }

    const entry = await TimeEntryModel.create({
      user_id: userId,
      project_id: projectId,
      start_time: new Date(),
      description,
      type: 'work',
    });

    return entry;
  }

  static async stopTimeTracking(userId: number) {
    const activeEntry = await TimeEntryModel.getActiveEntry(userId);
    if (!activeEntry) {
      throw new Error('No active time entry found');
    }

    const endTime = new Date();
    const duration = TimeEntryModel.calculateDuration(
      new Date(activeEntry.start_time),
      endTime,
      activeEntry.break_duration
    );

    const updated = await TimeEntryModel.update(activeEntry.id, {
      end_time: endTime,
    });

    return {
      ...updated,
      duration_minutes: duration,
      duration_hours: (duration / 60).toFixed(2),
    };
  }

  static async createTimeEntry(data: CreateTimeEntryData) {
    if (data.end_time && data.start_time) {
      const duration = TimeEntryModel.calculateDuration(
        new Date(data.start_time),
        new Date(data.end_time),
        data.break_duration || 0
      );
      // You could store duration if needed
    }
    return await TimeEntryModel.create(data);
  }

  static async updateTimeEntry(id: number, data: Partial<CreateTimeEntryData>) {
    const entry = await TimeEntryModel.findById(id);
    if (!entry) {
      throw new Error('Time entry not found');
    }

    // Recalculate duration if times are updated
    if (data.end_time && (data.start_time || entry.start_time)) {
      const start = new Date(data.start_time || entry.start_time);
      const end = new Date(data.end_time);
      const breakDuration = data.break_duration !== undefined ? data.break_duration : entry.break_duration;
      const duration = TimeEntryModel.calculateDuration(start, end, breakDuration);
      // You could store duration if needed
    }

    return await TimeEntryModel.update(id, data);
  }

  static async deleteTimeEntry(id: number) {
    const entry = await TimeEntryModel.findById(id);
    if (!entry) {
      throw new Error('Time entry not found');
    }
    await TimeEntryModel.delete(id);
    return { message: 'Time entry deleted successfully' };
  }
}


















