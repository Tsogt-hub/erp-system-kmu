import { apiClient } from './client';

// Reminder-Typen wie in Hero
export const REMINDER_TYPES = [
  'Wiedervorlage',
  'Anruf',
  'E-Mail',
  'Termin',
  'Nachfassen',
  'Besuch',
  'Aufgabe',
  'Sonstige',
];

// Prioritäten
export const REMINDER_PRIORITIES = [
  { value: 'niedrig', label: 'Niedrig', color: '#9E9E9E' },
  { value: 'normal', label: 'Normal', color: '#2196F3' },
  { value: 'hoch', label: 'Hoch', color: '#FF9800' },
  { value: 'dringend', label: 'Dringend', color: '#F44336' },
];

// Icons für Reminder-Typen
export const REMINDER_TYPE_ICONS: Record<string, string> = {
  'Wiedervorlage': '🔔',
  'Anruf': '📞',
  'E-Mail': '📧',
  'Termin': '📅',
  'Nachfassen': '👋',
  'Besuch': '🚗',
  'Aufgabe': '✅',
  'Sonstige': '📝',
};

export interface Reminder {
  id: number;
  title: string;
  description?: string;
  reminder_type: string;
  priority: string;
  due_date: string;
  due_time?: string;
  entity_type: 'project' | 'contact' | 'offer' | 'company';
  entity_id: number;
  assigned_to_user_id?: number;
  created_by_user_id: number;
  is_completed: boolean;
  completed_at?: string;
  completed_by_user_id?: number;
  notify_email: boolean;
  notify_push: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  entity_name?: string;
  assigned_to_name?: string;
  created_by_name?: string;
}

export interface CreateReminderData {
  title: string;
  description?: string;
  reminder_type: string;
  priority?: string;
  due_date: string;
  due_time?: string;
  entity_type: 'project' | 'contact' | 'offer' | 'company';
  entity_id: number;
  assigned_to_user_id?: number;
  notify_email?: boolean;
  notify_push?: boolean;
}

export const remindersApi = {
  // Get my reminders
  getMyReminders: async (includeCompleted: boolean = false): Promise<Reminder[]> => {
    const response = await apiClient.get('/reminders/my', {
      params: { includeCompleted },
    });
    return response.data;
  },

  // Get due reminders
  getDueReminders: async (daysAhead: number = 7): Promise<Reminder[]> => {
    const response = await apiClient.get('/reminders/due', {
      params: { days: daysAhead },
    });
    return response.data;
  },

  // Get overdue reminders
  getOverdueReminders: async (): Promise<Reminder[]> => {
    const response = await apiClient.get('/reminders/overdue');
    return response.data;
  },

  // Get reminders by entity
  getByEntity: async (
    entityType: string,
    entityId: number,
    includeCompleted: boolean = false
  ): Promise<Reminder[]> => {
    const response = await apiClient.get(`/reminders/entity/${entityType}/${entityId}`, {
      params: { includeCompleted },
    });
    return response.data;
  },

  // Get single reminder
  getById: async (id: number): Promise<Reminder> => {
    const response = await apiClient.get(`/reminders/${id}`);
    return response.data;
  },

  // Create reminder
  create: async (data: CreateReminderData): Promise<Reminder> => {
    const response = await apiClient.post('/reminders', data);
    return response.data;
  },

  // Update reminder
  update: async (id: number, data: Partial<CreateReminderData>): Promise<Reminder> => {
    const response = await apiClient.put(`/reminders/${id}`, data);
    return response.data;
  },

  // Complete reminder
  complete: async (id: number): Promise<Reminder> => {
    const response = await apiClient.post(`/reminders/${id}/complete`);
    return response.data;
  },

  // Uncomplete reminder
  uncomplete: async (id: number): Promise<Reminder> => {
    const response = await apiClient.post(`/reminders/${id}/uncomplete`);
    return response.data;
  },

  // Delete reminder
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/reminders/${id}`);
  },
};

// Helper function to check if a reminder is overdue
export const isReminderOverdue = (reminder: Reminder): boolean => {
  if (reminder.is_completed) return false;
  const now = new Date();
  const dueDate = new Date(reminder.due_date);
  if (reminder.due_time) {
    const [hours, minutes] = reminder.due_time.split(':');
    dueDate.setHours(parseInt(hours), parseInt(minutes));
  }
  return dueDate < now;
};

// Helper function to format due date/time
export const formatReminderDueDate = (reminder: Reminder): string => {
  const date = new Date(reminder.due_date);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };
  let result = date.toLocaleDateString('de-DE', options);
  if (reminder.due_time) {
    result += ` um ${reminder.due_time}`;
  }
  return result;
};








