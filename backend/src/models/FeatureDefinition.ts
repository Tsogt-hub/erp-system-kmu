import { query } from '../config/database';

export interface FeatureDefinition {
  id: number;
  name: string;
  entity: string;
  description?: string;
  version: number;
  config: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface UpsertFeatureDefinitionInput {
  name: string;
  entity: string;
  description?: string;
  version?: number;
  config?: Record<string, unknown>;
}

export class FeatureDefinitionModel {
  static async list(): Promise<FeatureDefinition[]> {
    const result = await query('SELECT * FROM feature_definitions ORDER BY name ASC');
    const rows = Array.isArray(result) ? result : result.rows;
    return rows.map(FeatureDefinitionModel.mapRow);
  }

  static async findByName(name: string): Promise<FeatureDefinition | null> {
    const result = await query('SELECT * FROM feature_definitions WHERE name = $1', [name]);
    const rows = Array.isArray(result) ? result : result.rows;
    if (!rows?.length) {
      return null;
    }
    return FeatureDefinitionModel.mapRow(rows[0]);
  }

  static async upsert(payload: UpsertFeatureDefinitionInput): Promise<FeatureDefinition> {
    const existing = await FeatureDefinitionModel.findByName(payload.name);
    if (existing) {
      const result = await query(
        `UPDATE feature_definitions
         SET entity = $1,
             description = $2,
             version = $3,
             config = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [
          payload.entity,
          payload.description ?? null,
          payload.version ?? existing.version,
          JSON.stringify(payload.config ?? {}),
          existing.id,
        ]
      );
      const rows = Array.isArray(result) ? result : result.rows;
      return FeatureDefinitionModel.mapRow(rows[0]);
    }

    const insert = await query(
      `INSERT INTO feature_definitions (name, entity, description, version, config)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        payload.name,
        payload.entity,
        payload.description ?? null,
        payload.version ?? 1,
        JSON.stringify(payload.config ?? {}),
      ]
    );
    const rows = Array.isArray(insert) ? insert : insert.rows;
    return FeatureDefinitionModel.mapRow(rows[0]);
  }

  private static mapRow(row: any): FeatureDefinition {
    return {
      id: row.id,
      name: row.name,
      entity: row.entity,
      description: row.description ?? undefined,
      version: Number(row.version ?? 1),
      config:
        typeof row.config === 'string'
          ? safeJson(row.config)
          : row.config ?? {},
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}

function safeJson(value: string): Record<string, unknown> {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}



