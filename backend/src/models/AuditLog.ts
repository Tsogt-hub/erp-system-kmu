import { query } from '../config/database';

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  resource?: string;
  level: 'info' | 'warning' | 'critical';
  metadata: Record<string, unknown>;
  created_at: Date;
}

export interface CreateAuditLogInput {
  user_id?: number;
  action: string;
  resource?: string;
  level?: 'info' | 'warning' | 'critical';
  metadata?: Record<string, unknown>;
}

export class AuditLogModel {
  static async create(payload: CreateAuditLogInput): Promise<void> {
    await query(
      `INSERT INTO audit_logs (user_id, action, resource, level, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        payload.user_id ?? null,
        payload.action,
        payload.resource ?? null,
        payload.level ?? 'info',
        JSON.stringify(payload.metadata ?? {}),
      ]
    );
  }

  static async list(limit = 200): Promise<AuditLog[]> {
    const result = await query(
      `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    const rows = Array.isArray(result) ? result : result.rows;
    return rows.map(AuditLogModel.mapRow);
  }

  private static mapRow(row: any): AuditLog {
    return {
      id: row.id,
      user_id: row.user_id ?? undefined,
      action: row.action,
      resource: row.resource ?? undefined,
      level: row.level ?? 'info',
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata || '{}') : row.metadata ?? {},
      created_at: new Date(row.created_at),
    };
  }
}


