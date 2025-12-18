import { query } from '../config/database';

export interface DataQualityRule {
  id: number;
  asset_id: number;
  name: string;
  dimension: 'completeness' | 'accuracy' | 'timeliness' | 'consistency';
  threshold: number;
  severity: 'low' | 'medium' | 'high';
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDataQualityRuleInput {
  asset_id: number;
  name: string;
  dimension: 'completeness' | 'accuracy' | 'timeliness' | 'consistency';
  threshold: number;
  severity?: 'low' | 'medium' | 'high';
  description?: string;
}

export class DataQualityRuleModel {
  static async list(): Promise<DataQualityRule[]> {
    const result = await query(
      `SELECT * FROM data_quality_rules ORDER BY severity DESC, dimension`
    );
    const rows = Array.isArray(result) ? result : result.rows;
    return rows.map(DataQualityRuleModel.mapRow);
  }

  static async findByAsset(assetId: number): Promise<DataQualityRule[]> {
    const result = await query(
      `SELECT * FROM data_quality_rules WHERE asset_id = $1 ORDER BY created_at DESC`,
      [assetId]
    );
    const rows = Array.isArray(result) ? result : result.rows;
    return rows.map(DataQualityRuleModel.mapRow);
  }

  static async create(data: CreateDataQualityRuleInput): Promise<DataQualityRule> {
    const result = await query(
      `INSERT INTO data_quality_rules (
        asset_id, name, dimension, threshold, severity, description
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        data.asset_id,
        data.name,
        data.dimension,
        data.threshold,
        data.severity ?? 'medium',
        data.description ?? null,
      ]
    );
    const rows = Array.isArray(result) ? result : result.rows;
    return DataQualityRuleModel.mapRow(rows[0]);
  }

  private static mapRow(row: any): DataQualityRule {
    return {
      id: row.id,
      asset_id: row.asset_id,
      name: row.name,
      dimension: row.dimension,
      threshold: Number(row.threshold),
      severity: row.severity ?? 'medium',
      description: row.description ?? undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}


