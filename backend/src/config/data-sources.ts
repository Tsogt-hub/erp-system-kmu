import fs from 'fs';
import path from 'path';

export type DataSourceType = 'internal-db' | 'csv-file' | 'external-api';

export interface DataSourceConfig {
  name: string;
  type: DataSourceType;
  description?: string;
  enabled: boolean;
  tags?: string[];
  schedule?: {
    cadence: 'hourly' | 'daily' | 'weekly' | 'manual';
    timezone?: string;
  };
  options?: Record<string, unknown>;
  capabilities: Array<'read' | 'write' | 'metadata'>;
}

const defaultSources: DataSourceConfig[] = [
  {
    name: 'internal-postgres',
    type: 'internal-db',
    description: 'Primäre ERP-Datenbank (PostgreSQL oder SQLite Fallback)',
    enabled: true,
    tags: ['core', 'erp'],
    schedule: { cadence: 'daily', timezone: 'Europe/Berlin' },
    capabilities: ['read', 'metadata'],
  },
  {
    name: 'planning-board-csv',
    type: 'csv-file',
    description: 'Exportierte Planungsdaten zur Validierung',
    enabled: false,
    tags: ['planning', 'import'],
    schedule: { cadence: 'manual' },
    options: {
      filePath: 'data/imports/planning-board.csv',
    },
    capabilities: ['read', 'metadata'],
  },
];

function loadExternalConfig(): DataSourceConfig[] {
  const configPath =
    process.env.DATA_SOURCES_FILE ??
    path.join(process.cwd(), 'config', 'data-sources.json');

  if (!fs.existsSync(configPath)) {
    return defaultSources;
  }

  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw) as DataSourceConfig[];
    return parsed.map((entry) => ({
      ...entry,
      capabilities: entry.capabilities ?? ['read'],
      enabled: entry.enabled ?? true,
    }));
  } catch (error) {
    console.warn('⚠️  Konnte externe Datenquellen-Konfiguration nicht laden:', error);
    return defaultSources;
  }
}

export const dataSources: DataSourceConfig[] = loadExternalConfig();

export function getDataSourceConfig(name: string): DataSourceConfig | undefined {
  return dataSources.find((source) => source.name === name);
}


