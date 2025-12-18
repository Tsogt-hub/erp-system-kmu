import { query } from '../config/database';

export interface DataAsset {
  id: number;
  name: string;
  domain: string;
  owner: string;
  description?: string;
  source?: string;
  tags: string[];
  sensitivity: 'public' | 'internal' | 'confidential';
  retention_policy?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDataAssetInput {
  name: string;
  domain: string;
  owner: string;
  description?: string;
  source?: string;
  tags?: string[];
  sensitivity?: 'public' | 'internal' | 'confidential';
  retention_policy?: string;
}

export class DataAssetModel {
  static async list(): Promise<DataAsset[]> {
    const result = await query('SELECT * FROM data_assets ORDER BY domain, name');
    const rows = Array.isArray(result) ? result : result.rows;
    return rows.map(DataAssetModel.mapRow);
  }

  static async findById(id: number): Promise<DataAsset | null> {
    const result = await query('SELECT * FROM data_assets WHERE id = $1', [id]);
    const rows = Array.isArray(result) ? result : result.rows;
    return rows[0] ? DataAssetModel.mapRow(rows[0]) : null;
  }

  static async create(data: CreateDataAssetInput): Promise<DataAsset> {
    const result = await query(
      `INSERT INTO data_assets (
        name, domain, owner, description, source, tags, sensitivity, retention_policy
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.name,
        data.domain,
        data.owner,
        data.description ?? null,
        data.source ?? null,
        JSON.stringify(data.tags ?? []),
        data.sensitivity ?? 'internal',
        data.retention_policy ?? null,
      ]
    );
    const rows = Array.isArray(result) ? result : result.rows;
    return DataAssetModel.mapRow(rows[0]);
  }

  private static mapRow(row: any): DataAsset {
    return {
      id: row.id,
      name: row.name,
      domain: row.domain,
      owner: row.owner,
      description: row.description ?? undefined,
      source: row.source ?? undefined,
      tags: Array.isArray(row.tags) ? row.tags : JSON.parse(row.tags ?? '[]'),
      sensitivity: row.sensitivity ?? 'internal',
      retention_policy: row.retention_policy ?? undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}


