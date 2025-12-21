import { apiClient } from './client';

export interface LogEntry {
  id: number;
  entity_type: 'contact' | 'company' | 'project' | 'offer' | 'invoice' | 'task';
  entity_id: number;
  action: string;
  description: string;
  user_id: number;
  user_name?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface CreateLogEntryData {
  entity_type: 'contact' | 'company' | 'project' | 'offer' | 'invoice' | 'task';
  entity_id: number;
  action: string;
  description: string;
  user_id?: number;
  metadata?: Record<string, any>;
}

// Vordefinierte Aktionen
export const LOG_ACTIONS = {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  STATUS_CHANGED: 'status_changed',
  NOTE_ADDED: 'note_added',
  DOCUMENT_CREATED: 'document_created',
  DOCUMENT_SENT: 'document_sent',
  FILE_UPLOADED: 'file_uploaded',
  ASSIGNED: 'assigned',
  REMINDER_SET: 'reminder_set',
  CALL_LOGGED: 'call_logged',
  EMAIL_SENT: 'email_sent',
  MEETING_SCHEDULED: 'meeting_scheduled',
} as const;

// Action Labels für Anzeige
export const LOG_ACTION_LABELS: Record<string, string> = {
  created: 'Erstellt',
  updated: 'Aktualisiert',
  deleted: 'Gelöscht',
  status_changed: 'Status geändert',
  note_added: 'Notiz hinzugefügt',
  document_created: 'Dokument erstellt',
  document_sent: 'Dokument versendet',
  file_uploaded: 'Datei hochgeladen',
  assigned: 'Zugewiesen',
  reminder_set: 'Erinnerung gesetzt',
  call_logged: 'Anruf protokolliert',
  email_sent: 'E-Mail gesendet',
  meeting_scheduled: 'Termin geplant',
};

// Action Icons für Anzeige
export const LOG_ACTION_ICONS: Record<string, string> = {
  created: '✨',
  updated: '✏️',
  deleted: '🗑️',
  status_changed: '🔄',
  note_added: '📝',
  document_created: '📄',
  document_sent: '📧',
  file_uploaded: '📎',
  assigned: '👤',
  reminder_set: '⏰',
  call_logged: '📞',
  email_sent: '✉️',
  meeting_scheduled: '📅',
};

// Action Colors für Anzeige
export const LOG_ACTION_COLORS: Record<string, string> = {
  created: '#4caf50',
  updated: '#2196f3',
  deleted: '#f44336',
  status_changed: '#ff9800',
  note_added: '#9c27b0',
  document_created: '#00bcd4',
  document_sent: '#3f51b5',
  file_uploaded: '#607d8b',
  assigned: '#795548',
  reminder_set: '#ffc107',
  call_logged: '#009688',
  email_sent: '#673ab7',
  meeting_scheduled: '#e91e63',
};

export const logEntriesApi = {
  // Alle Log-Einträge abrufen
  getAll: async (params?: {
    limit?: number;
    offset?: number;
    user_id?: number;
    entity_type?: string;
  }): Promise<LogEntry[]> => {
    const response = await apiClient.get('/log-entries', { params });
    return response.data;
  },

  // Log-Einträge für eine Entität abrufen
  getByEntity: async (
    entityType: string,
    entityId: number,
    params?: { limit?: number; offset?: number; action?: string }
  ): Promise<LogEntry[]> => {
    const response = await apiClient.get(`/log-entries/entity/${entityType}/${entityId}`, { params });
    return response.data;
  },

  // Einzelnen Log-Eintrag abrufen
  getById: async (id: number): Promise<LogEntry> => {
    const response = await apiClient.get(`/log-entries/${id}`);
    return response.data;
  },

  // Log-Eintrag erstellen
  create: async (data: CreateLogEntryData): Promise<LogEntry> => {
    const response = await apiClient.post('/log-entries', data);
    return response.data;
  },

  // Log-Eintrag löschen
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/log-entries/${id}`);
  },

  // Anzahl der Log-Einträge
  getCount: async (entityType?: string, entityId?: number): Promise<number> => {
    const params: Record<string, any> = {};
    if (entityType) params.entityType = entityType;
    if (entityId) params.entityId = entityId;
    const response = await apiClient.get('/log-entries/count', { params });
    return response.data.count;
  },

  // Action Labels abrufen
  getActionLabels: async (): Promise<Record<string, string>> => {
    const response = await apiClient.get('/log-entries/actions');
    return response.data;
  },
};









