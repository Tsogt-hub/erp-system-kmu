import { query } from '../config/database';

export interface FeatureSnapshot {
  id: number;
  feature_id: number;
  entity_id: string;
  ts: Date;
  value: Record<string, unknown>;
  created_at: Date;
}

export interface SnapshotInput {
  feature_id: number;
  entity_id: string;
  ts: Date;
  value: Record<string, unknown>;
}

export class FeatureSnapshotModel {
  static async insertBatch(items: SnapshotInput[]): Promise<void> {
    if (!items.length) {
      return;
    }

    const values: string[] = [];
    const params: any[] = [];

    items.forEach((item, index) => {
      const offset = index * 4;
      values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`);
      params.push(
        item.feature_id,
        item.entity_id,
        item.ts.toISOString(),
        JSON.stringify(item.value)
      );
    });

    await query(
      `INSERT INTO feature_snapshots (feature_id, entity_id, ts, value)
       VALUES ${values.join(',')}
       ON CONFLICT (feature_id, entity_id, ts) DO UPDATE
         SET value = EXCLUDED.value`,
      params
    );
  }

  static async latest(featureId: number, entityId: string): Promise<FeatureSnapshot | null> {
    const result = await query(
      `SELECT *
       FROM feature_snapshots
       WHERE feature_id = $1 AND entity_id = $2
       ORDER BY ts DESC
       LIMIT 1`,
      [featureId, entityId]
    );
    const rows = Array.isArray(result) ? result : result.rows;
    if (!rows?.length) {
      return null;
    }
    return FeatureSnapshotModel.mapRow(rows[0]);
  }

  static async timeseries(
    featureId: number,
    entityId: string,
    limit = 50
  ): Promise<FeatureSnapshot[]> {
    const result = await query(
      `SELECT *
       FROM feature_snapshots
       WHERE feature_id = $1 AND entity_id = $2
       ORDER BY ts DESC
       LIMIT $3`,
      [featureId, entityId, limit]
    );
    const rows = Array.isArray(result) ? result : result.rows;
    return rows.map(FeatureSnapshotModel.mapRow);
  }

  private static mapRow(row: any): FeatureSnapshot {
    return {
      id: row.id,
      feature_id: row.feature_id,
      entity_id: row.entity_id,
      ts: new Date(row.ts),
      value: typeof row.value === 'string' ? safeJson(row.value) : row.value ?? {},
      created_at: new Date(row.created_at),
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



