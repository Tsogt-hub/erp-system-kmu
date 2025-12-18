import crypto from 'crypto';
import { DataSourceConfig, dataSources } from '../config/data-sources';
import { BaseConnector } from './base.connector';
import { ConnectorCapability, DataConnector } from './types';
import { ErpDatabaseConnector } from './erp-database.connector';
import { CsvConnector } from './csv.connector';

type ConnectorFactory = (config: DataSourceConfig, capabilities: ConnectorCapability[]) => DataConnector;

const registry: Record<string, ConnectorFactory> = {
  'internal-db': (config) => new ErpDatabaseConnector(config, ['read', 'metadata']),
  'csv-file': (config) => new CsvConnector(config, ['read', 'metadata']),
};

const instances: Map<string, DataConnector> = new Map();

export function registerConnector(type: string, factory: ConnectorFactory) {
  registry[type] = factory;
}

export function getConnectorByName(name: string): DataConnector | undefined {
  return instances.get(name);
}

export async function getOrCreateConnector(name: string): Promise<DataConnector> {
  const existing = instances.get(name);
  if (existing) {
    return existing;
  }

  const config = dataSources.find((ds) => ds.name === name);
  if (!config) {
    throw new Error(`Keine Datenquelle mit dem Namen ${name} registriert`);
  }

  const factory = registry[config.type];
  if (!factory) {
    throw new Error(`Kein Connector für Typ ${config.type} registriert`);
  }

  const connector = factory(config, config.capabilities);
  await connector.initialize();
  instances.set(name, connector);
  return connector;
}

export async function shutdownAllConnectors(): Promise<void> {
  for (const connector of instances.values()) {
    await connector.shutdown();
  }
  instances.clear();
}

export function listRegisteredDataSources(): DataSourceConfig[] {
  return dataSources;
}

export function createSyncContext(source: DataSourceConfig, options?: Record<string, unknown>) {
  return {
    runId: crypto.randomUUID(),
    source,
    options,
  };
}


