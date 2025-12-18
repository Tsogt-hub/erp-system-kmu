import { logger } from '../utils/logger';
import { DataSourceConfig } from '../config/data-sources';
import { ConnectorCapability, ConnectorHealth, DataConnector, SyncContext, SyncResult } from './types';

export abstract class BaseConnector<T = any> implements DataConnector<T> {
  public readonly name: string;
  public readonly capabilities: ConnectorCapability[];
  public readonly config: DataSourceConfig;
  private initialized = false;

  protected constructor(config: DataSourceConfig, capabilities: ConnectorCapability[]) {
    this.name = config.name;
    this.capabilities = capabilities;
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    await this.onInitialize();
    this.initialized = true;
    logger.info(`[Connector:${this.name}] initialisiert`, { type: this.config.type });
  }

  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }
    await this.onShutdown();
    this.initialized = false;
    logger.info(`[Connector:${this.name}] heruntergefahren`);
  }

  abstract testConnection(): Promise<ConnectorHealth>;

  async fetch(context: SyncContext): Promise<SyncResult<T>> {
    if (!this.capabilities.includes('read')) {
      throw new Error(`Connector ${this.name} unterstützt keine Lese-Operationen`);
    }
    return this.onFetch(context);
  }

  async ingest(context: SyncContext, payload: T[]): Promise<SyncResult> {
    if (!this.capabilities.includes('write')) {
      throw new Error(`Connector ${this.name} unterstützt keine Schreib-Operationen`);
    }
    return this.onIngest(context, payload);
  }

  async fetchMetadata(): Promise<Record<string, unknown>> {
    if (!this.capabilities.includes('metadata')) {
      return {};
    }
    return this.onFetchMetadata();
  }

  protected abstract onInitialize(): Promise<void>;
  protected abstract onShutdown(): Promise<void>;
  protected abstract onFetch(context: SyncContext): Promise<SyncResult<T>>;
  protected abstract onIngest(context: SyncContext, payload: T[]): Promise<SyncResult>;
  protected abstract onFetchMetadata(): Promise<Record<string, unknown>>;
}


