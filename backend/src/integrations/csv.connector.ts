import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { BaseConnector } from './base.connector';
import { ConnectorHealth, SyncContext, SyncResult } from './types';

interface CsvRecord {
  [key: string]: string;
}

export class CsvConnector extends BaseConnector<CsvRecord> {
  protected async onInitialize(): Promise<void> {
    // nichts zu tun
  }

  protected async onShutdown(): Promise<void> {
    // nichts zu tun
  }

  async testConnection(): Promise<ConnectorHealth> {
    const filePath = this.resolveFilePath();
    const exists = fs.existsSync(filePath);
    return {
      status: exists ? 'healthy' : 'unavailable',
      checkedAt: new Date(),
      details: exists ? undefined : `CSV-Datei ${filePath} nicht gefunden`,
    };
  }

  protected async onFetch(context: SyncContext): Promise<SyncResult<CsvRecord>> {
    const filePath = this.resolveFilePath();
    const limit = (context.options?.limit as number) || 1000;

    if (!fs.existsSync(filePath)) {
      throw new Error(`CSV-Datei ${filePath} nicht gefunden`);
    }

    const records: CsvRecord[] = [];

    const parser = fs.createReadStream(filePath).pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
        bom: true,
      })
    );

    for await (const record of parser) {
      records.push(record);
      if (records.length >= limit) {
        break;
      }
    }

    return {
      records,
      metadata: {
        filePath,
        count: records.length,
      },
    };
  }

  protected async onIngest(): Promise<SyncResult> {
    throw new Error('CSV Ingestion ist derzeit nicht implementiert');
  }

  protected async onFetchMetadata(): Promise<Record<string, unknown>> {
    const filePath = this.resolveFilePath();
    const stats = fs.existsSync(filePath) ? fs.statSync(filePath) : null;

    return {
      filePath,
      size: stats?.size ?? 0,
      modifiedAt: stats?.mtime ?? null,
    };
  }

  private resolveFilePath(): string {
    const filePath = this.config.options?.filePath as string | undefined;
    if (!filePath) {
      throw new Error(`CSV Connector ${this.name} benötigt eine 'filePath' Option`);
    }
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    return path.join(process.cwd(), filePath);
  }
}


