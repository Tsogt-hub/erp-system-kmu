import { db } from '../config/database.sqlite';

export interface LogEntry {
  id: number;
  entity_type: 'contact' | 'company' | 'project' | 'offer' | 'invoice' | 'task';
  entity_id: number;
  action: string;
  description: string;
  user_id: number;
  user_name?: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

export interface CreateLogEntryData {
  entity_type: 'contact' | 'company' | 'project' | 'offer' | 'invoice' | 'task';
  entity_id: number;
  action: string;
  description: string;
  user_id: number;
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

export class LogEntryModel {
  static async create(data: CreateLogEntryData): Promise<LogEntry> {
    const stmt = db.prepare(`
      INSERT INTO log_entries (entity_type, entity_id, action, description, user_id, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    const result = stmt.run(
      data.entity_type,
      data.entity_id,
      data.action,
      data.description,
      data.user_id,
      data.metadata ? JSON.stringify(data.metadata) : null
    );

    return this.findById(result.lastInsertRowid as number) as Promise<LogEntry>;
  }

  static async findById(id: number): Promise<LogEntry | null> {
    const stmt = db.prepare(`
      SELECT 
        le.*,
        u.first_name || ' ' || u.last_name as user_name
      FROM log_entries le
      LEFT JOIN users u ON le.user_id = u.id
      WHERE le.id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
    };
  }

  static async findByEntity(
    entityType: string,
    entityId: number,
    options?: { limit?: number; offset?: number; action?: string }
  ): Promise<LogEntry[]> {
    let query = `
      SELECT 
        le.*,
        u.first_name || ' ' || u.last_name as user_name
      FROM log_entries le
      LEFT JOIN users u ON le.user_id = u.id
      WHERE le.entity_type = ? AND le.entity_id = ?
    `;

    const params: any[] = [entityType, entityId];

    if (options?.action) {
      query += ' AND le.action = ?';
      params.push(options.action);
    }

    query += ' ORDER BY le.created_at DESC';

    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options?.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }

    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map((row) => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
    }));
  }

  static async findAll(options?: {
    limit?: number;
    offset?: number;
    user_id?: number;
    entity_type?: string;
  }): Promise<LogEntry[]> {
    let query = `
      SELECT 
        le.*,
        u.first_name || ' ' || u.last_name as user_name
      FROM log_entries le
      LEFT JOIN users u ON le.user_id = u.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (options?.user_id) {
      query += ' AND le.user_id = ?';
      params.push(options.user_id);
    }

    if (options?.entity_type) {
      query += ' AND le.entity_type = ?';
      params.push(options.entity_type);
    }

    query += ' ORDER BY le.created_at DESC';

    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options?.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }

    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map((row) => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
    }));
  }

  static async delete(id: number): Promise<boolean> {
    const stmt = db.prepare('DELETE FROM log_entries WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static async deleteByEntity(entityType: string, entityId: number): Promise<number> {
    const stmt = db.prepare('DELETE FROM log_entries WHERE entity_type = ? AND entity_id = ?');
    const result = stmt.run(entityType, entityId);
    return result.changes;
  }

  static async count(entityType?: string, entityId?: number): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM log_entries WHERE 1=1';
    const params: any[] = [];

    if (entityType) {
      query += ' AND entity_type = ?';
      params.push(entityType);
    }

    if (entityId) {
      query += ' AND entity_id = ?';
      params.push(entityId);
    }

    const stmt = db.prepare(query);
    const result = stmt.get(...params) as { count: number };
    return result.count;
  }
}

// Tabelle initialisieren
export function initLogEntriesTable(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS log_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL CHECK(entity_type IN ('contact', 'company', 'project', 'offer', 'invoice', 'task')),
      entity_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      description TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_log_entries_entity ON log_entries(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_log_entries_user ON log_entries(user_id);
    CREATE INDEX IF NOT EXISTS idx_log_entries_created ON log_entries(created_at DESC);
  `);
}






