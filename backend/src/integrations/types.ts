import { DataSourceConfig } from '../config/data-sources';

export type ConnectorCapability = 'read' | 'write' | 'metadata';

export interface ConnectorHealth {
  status: 'healthy' | 'degraded' | 'unavailable';
  details?: string;
  checkedAt: Date;
}

export interface SyncContext {
  runId: string;
  source: DataSourceConfig;
  cursor?: string | null;
  options?: Record<string, unknown>;
}

export interface SyncResult<T = any> {
  records: T[];
  cursor?: string | null;
  raw?: unknown;
  errors?: Array<{ message: string; item?: unknown }>;
  metadata?: Record<string, unknown>;
}

export interface DataConnector<T = any> {
  readonly name: string;
  readonly capabilities: ConnectorCapability[];
  readonly config: DataSourceConfig;

  initialize(): Promise<void>;
  testConnection(): Promise<ConnectorHealth>;
  fetch?(context: SyncContext): Promise<SyncResult<T>>;
  ingest?(context: SyncContext, payload: T[]): Promise<SyncResult>;
  fetchMetadata?(): Promise<Record<string, unknown>>;
  shutdown(): Promise<void>;
}


