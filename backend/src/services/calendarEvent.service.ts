import { CalendarEventModel, CreateCalendarEventData } from '../models/CalendarEvent';

export class CalendarEventService {
  static async getAll(
    startDate?: Date,
    endDate?: Date,
    resourceId?: number,
    resourceType?: string,
    projectId?: number
  ) {
    return await CalendarEventModel.findAll(startDate, endDate, resourceId, resourceType, projectId);
  }

  static async getById(id: number) {
    const event = await CalendarEventModel.findById(id);
    if (!event) {
      throw new Error('Calendar event not found');
    }
    return event;
  }

  static async create(data: CreateCalendarEventData) {
    const { employee_ids, ...eventData } = data;
    const event = await CalendarEventModel.create(eventData);
    
    // Füge Mitarbeiter hinzu, falls vorhanden
    if (employee_ids && employee_ids.length > 0) {
      await CalendarEventModel.setEventEmployees(event.id, employee_ids);
      // Lade Event mit Mitarbeitern neu
      return await CalendarEventModel.findById(event.id)!;
    }
    
    return event;
  }

  static async update(id: number, data: Partial<CreateCalendarEventData>) {
    const event = await CalendarEventModel.findById(id);
    if (!event) {
      throw new Error('Calendar event not found');
    }
    
    const { employee_ids, ...eventData } = data;
    await CalendarEventModel.update(id, eventData);
    
    // Aktualisiere Mitarbeiter, falls vorhanden
    if (employee_ids !== undefined) {
      await CalendarEventModel.setEventEmployees(id, employee_ids);
    }
    
    // Lade Event mit Mitarbeitern neu
    return await CalendarEventModel.findById(id)!;
  }

  static async delete(id: number) {
    const event = await CalendarEventModel.findById(id);
    if (!event) {
      throw new Error('Calendar event not found');
    }
    await CalendarEventModel.delete(id);
    return { message: 'Calendar event deleted successfully' };
  }

  static async getByResource(resourceId: number, startDate: Date, endDate: Date) {
    return await CalendarEventModel.findByResource(resourceId, startDate, endDate);
  }
}


