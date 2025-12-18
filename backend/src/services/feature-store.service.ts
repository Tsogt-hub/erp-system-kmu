import { FeatureDefinitionModel, UpsertFeatureDefinitionInput } from '../models/FeatureDefinition';
import { FeatureSnapshotModel, SnapshotInput } from '../models/FeatureSnapshot';
import { query } from '../config/database';
import { TimeEntryModel } from '../models/TimeEntry';
import { SimpleLinearRegression } from 'ml-regression-simple-linear';

interface SnapshotPayload {
  entityId: string;
  timestamp: Date;
  value: Record<string, unknown>;
}

interface ProjectCapacityMetrics {
  entityId: string;
  value: Record<string, unknown>;
}

export class FeatureStoreService {
  static async listDefinitions() {
    return FeatureDefinitionModel.list();
  }

  static async upsertDefinition(payload: UpsertFeatureDefinitionInput) {
    return FeatureDefinitionModel.upsert(payload);
  }

  static async recordSnapshots(
    definitionName: string,
    definition: UpsertFeatureDefinitionInput,
    snapshots: SnapshotPayload[]
  ) {
    const def = await FeatureDefinitionModel.upsert({
      name: definitionName,
      entity: definition.entity,
      description: definition.description,
      version: definition.version,
      config: definition.config,
    });

    const batch: SnapshotInput[] = snapshots.map((snapshot) => ({
      feature_id: def.id,
      entity_id: snapshot.entityId,
      ts: snapshot.timestamp,
      value: snapshot.value,
    }));

    await FeatureSnapshotModel.insertBatch(batch);
    return def;
  }

  static async getLatestFeature(definitionName: string, entityId: string) {
    const def = await FeatureDefinitionModel.findByName(definitionName);
    if (!def) {
      return null;
    }
    return FeatureSnapshotModel.latest(def.id, entityId);
  }

  static async getTimeSeries(definitionName: string, entityId: string, limit = 50) {
    const def = await FeatureDefinitionModel.findByName(definitionName);
    if (!def) {
      return [];
    }
    return FeatureSnapshotModel.timeseries(def.id, entityId, limit);
  }

  /**
   * Aggregiert Projekt- und Zeiterfassungsdaten zu Kapazitäts-Features.
   * Ergebnis: Stundenverbrauch der letzten 7 bzw. 30 Tage, Teamgröße etc.
   */
  static async syncProjectCapacityFeatures() {
    const definition = await FeatureDefinitionModel.upsert({
      name: 'project_capacity_window',
      entity: 'project',
      description: 'Gleitendes Projekt-Kapazitätsfenster (7/30 Tage)',
      config: {
        windows: [7, 30],
      },
    });

    const metrics = await FeatureStoreService.computeProjectCapacityMetrics();
    const timestamp = new Date();
    const batch: SnapshotInput[] = metrics.map((item) => ({
      feature_id: definition.id,
      entity_id: item.entityId,
      ts: timestamp,
      value: item.value,
    }));

    await FeatureSnapshotModel.insertBatch(batch);
    return { count: batch.length };
  }

  static async syncProjectCapacityForecasts() {
    const capacityDefinition = await FeatureDefinitionModel.findByName('project_capacity_window');
    if (!capacityDefinition) {
      throw new Error('Feature definition "project_capacity_window" not found. Run history sync first.');
    }

    const forecastDefinition = await FeatureDefinitionModel.upsert({
      name: 'project_capacity_forecast',
      entity: 'project',
      description: 'Vorhersage der Kapazität (nächste 7 Tage) aus historischen Projektstunden',
      config: {
        model: 'simple-linear-regression',
        horizon_days: 7,
        source_feature: capacityDefinition.id,
      },
    });

    const projectsResult = await query(`SELECT id FROM projects`);
    const projects = toRows(projectsResult);

    const batch: SnapshotInput[] = [];
    const now = new Date();

    for (const project of projects) {
      const projectId = String(project.id);
      const history = await FeatureSnapshotModel.timeseries(capacityDefinition.id, projectId, 30);

      if (!history.length) {
        continue;
      }

      const chronological = [...history].sort(
        (a, b) => a.ts.getTime() - b.ts.getTime()
      );
      const targetSeries = chronological
        .map((snapshot, index) => ({
          x: index,
          y: Number(snapshot.value?.total_hours_7d ?? 0),
          ts: snapshot.ts,
        }))
        .filter((point) => Number.isFinite(point.y));

      if (targetSeries.length === 0) {
        continue;
      }

      const x = targetSeries.map((point) => point.x);
      const y = targetSeries.map((point) => point.y);
      const lastPoint = targetSeries[targetSeries.length - 1];

      let forecast = lastPoint.y;
      let slope = 0;

      if (targetSeries.length >= 2) {
        const regression = new SimpleLinearRegression(x, y);
        slope = regression.slope ?? 0;
        const nextIndex = x[x.length - 1] + 1;
        const predicted = regression.predict(nextIndex);
        forecast = Number.isFinite(predicted) ? predicted : lastPoint.y;
      }

      batch.push({
        feature_id: forecastDefinition.id,
        entity_id: projectId,
        ts: now,
        value: {
          horizon_days: 7,
          last_observation: lastPoint.y,
          forecast_hours_next_7d: roundHours(forecast),
          trend_per_snapshot: Number(roundHours(slope)),
          sample_size: targetSeries.length,
          generated_at: now.toISOString(),
        },
      });
    }

    if (batch.length) {
      await FeatureSnapshotModel.insertBatch(batch);
    }
    return { count: batch.length };
  }

  private static async computeProjectCapacityMetrics(): Promise<ProjectCapacityMetrics[]> {
    const projectsResult = await query(
      `SELECT id, name, status, project_type, pipeline_step, created_at
       FROM projects`
    );
    const projects = toRows(projectsResult);

    const memberResult = await query(
      `SELECT project_id, COUNT(*) as member_count
       FROM project_members
       GROUP BY project_id`
    );
    const memberRows = toRows(memberResult);
    const memberMap = new Map<number, number>();
    memberRows.forEach((row: any) => {
      memberMap.set(Number(row.project_id), Number(row.member_count ?? row.count ?? 0));
    });

    const timeEntryResult = await query(
      `SELECT project_id, start_time, end_time, break_duration
       FROM time_entries`
    );
    const timeEntries = toRows(timeEntryResult);

    const now = new Date();
    const window7Start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const window30Start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const projectEntryMap = new Map<number, { hours7: number; hours30: number; entries7: number; entries30: number }>();

    timeEntries.forEach((entry: any) => {
      const projectId = entry.project_id ? Number(entry.project_id) : null;
      if (!projectId) {
        return;
      }

      const start = new Date(entry.start_time);
      const end = entry.end_time ? new Date(entry.end_time) : null;
      if (!end) {
        return;
      }

      const breakMinutes = Number(entry.break_duration ?? 0) || 0;
      const diffMinutes = Math.max(
        0,
        Math.floor((end.getTime() - start.getTime()) / 60000 - breakMinutes)
      );
      const hours = diffMinutes / 60;

      if (!projectEntryMap.has(projectId)) {
        projectEntryMap.set(projectId, { hours7: 0, hours30: 0, entries7: 0, entries30: 0 });
      }
      const bucket = projectEntryMap.get(projectId)!;

      if (start >= window7Start) {
        bucket.hours7 += hours;
        bucket.entries7 += 1;
      }
      if (start >= window30Start) {
        bucket.hours30 += hours;
        bucket.entries30 += 1;
      }
    });

    return projects.map((project: any) => {
      const projectId = Number(project.id);
      const buckets =
        projectEntryMap.get(projectId) ?? { hours7: 0, hours30: 0, entries7: 0, entries30: 0 };

      const totalHours7 = roundHours(buckets.hours7 ?? 0);
      const totalHours30 = roundHours(buckets.hours30 ?? 0);

      return {
        entityId: String(projectId),
        value: {
          project_name: project.name,
          status: project.status,
          pipeline_step: project.pipeline_step,
          project_type: project.project_type,
          member_count: memberMap.get(projectId) ?? 0,
          total_hours_7d: totalHours7,
          total_hours_30d: totalHours30,
          entry_count_7d: buckets.entries7,
          entry_count_30d: buckets.entries30,
          snapshot_generated_at: new Date().toISOString(),
        },
      };
    });
  }
}

function toRows(result: any): any[] {
  if (!result) {
    return [];
  }
  if (Array.isArray(result)) {
    return result;
  }
  return result.rows ?? [];
}

function roundHours(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(value * 100) / 100;
}



