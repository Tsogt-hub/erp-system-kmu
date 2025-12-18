import { BaseConnector } from './base.connector';
import { ConnectorHealth, SyncContext, SyncResult } from './types';
import { query } from '../config/database';

interface DatabaseSyncPayload {
  table: string;
  rows: any[];
}

export class ErpDatabaseConnector extends BaseConnector<DatabaseSyncPayload> {
  protected async onInitialize(): Promise<void> {
    // keine zusätzliche Initialisierung erforderlich
  }

  protected async onShutdown(): Promise<void> {
    // keine Ressourcen zu schließen
  }

  async testConnection(): Promise<ConnectorHealth> {
    try {
      await query('SELECT NOW()');
      return { status: 'healthy', checkedAt: new Date() };
    } catch (error: any) {
      return { status: 'unavailable', checkedAt: new Date(), details: error.message };
    }
  }

  protected async onFetch(context: SyncContext): Promise<SyncResult<DatabaseSyncPayload>> {
    const { options } = context;
    const table = (options?.table as string) || 'projects';
    const limit = (options?.limit as number) || 100;
    const updatedSince = options?.updatedSince as string | undefined;

    const clauses: string[] = [];
    const params: any[] = [];

    if (updatedSince) {
      clauses.push('updated_at >= $1');
      params.push(updatedSince);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const sql = `SELECT * FROM ${table} ${where} ORDER BY updated_at DESC LIMIT ${limit}`;

    const result = await query(sql, params);
    const rows = Array.isArray(result) ? result : result.rows;

    return {
      records: [{ table, rows }],
      cursor: rows.length ? rows[rows.length - 1].updated_at?.toISOString?.() ?? null : null,
      metadata: { table, count: rows.length },
    };
  }

  protected async onIngest(): Promise<SyncResult> {
    throw new Error('ERP Datenbank Ingestion ist derzeit nicht implementiert');
  }

  protected async onFetchMetadata(): Promise<Record<string, unknown>> {
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const tableList = Array.isArray(tables) ? tables.map((row: any) => row.table_name) : tables.rows.map((row: any) => row.table_name);

    return {
      tables: tableList,
    };
  }
}


