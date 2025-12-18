import { createSyncContext, getOrCreateConnector } from '../integrations/registry';
import { getDataSourceConfig } from '../config/data-sources';
import { PipelineDefinition, PipelineExecutionResult, PipelineStage } from './types';
import { logger } from '../utils/logger';
import { SyncResult } from '../integrations/types';
import { FeatureStoreService } from '../services/feature-store.service';

const pipelines: PipelineDefinition[] = [
  {
    name: 'daily-core-extract',
    displayName: 'Daily Core Extract',
    description: 'Synchronisiert Projektdaten aus der ERP-Datenbank in die Kurationsschicht',
    source: 'internal-postgres',
    enabled: true,
    stages: [
      {
        name: 'extract-projects',
        type: 'extract',
        async run(context) {
          const connector = await getOrCreateConnector(context.source.name);
          const result = await connector.fetch?.({
            ...context,
            options: { table: 'projects', limit: 500 },
          });
          return result ?? { records: [] };
        },
      },
      {
        name: 'transform-normalize',
        type: 'transform',
        async run(context, input: SyncResult) {
          const projects = input.records?.[0]?.rows ?? [];
          const normalized = projects.map((project: any) => ({
            id: project.id,
            name: project.name,
            status: project.status,
            customer_id: project.customer_id,
            updated_at: project.updated_at,
          }));
          return { ...input, records: normalized };
        },
      },
      {
        name: 'load-metadata',
        type: 'load',
        async run(context, input: SyncResult) {
          // Placeholder für spätere ETL-Loads (z. B. Warehouse Insert)
          logger.info(`[Pipeline:${context.source.name}] ${input.records.length} Projekte vorbereitet`);
          return input;
        },
      },
    ] as PipelineStage[],
  },
  {
    name: 'project-capacity-forecast',
    displayName: 'Project Capacity Forecast',
    description: 'Berechnet historische Kapazitätsfeatures und Forecasts für Projekte',
    source: 'internal-postgres',
    enabled: true,
    stages: [
      {
        name: 'sync-capacity-history',
        type: 'extract',
        async run() {
          const result = await FeatureStoreService.syncProjectCapacityFeatures();
          return { records: [{ stage: 'history', ...result }] };
        },
      },
      {
        name: 'forecast-capacity',
        type: 'load',
        async run(_, input) {
          const result = await FeatureStoreService.syncProjectCapacityForecasts();
          const previous = Array.isArray(input?.records) ? input.records : [];
          return { records: [...previous, { stage: 'forecast', ...result }] };
        },
      },
    ] as PipelineStage[],
  },
];

export function listPipelines(): PipelineDefinition[] {
  return pipelines;
}

export async function runPipeline(name: string, options?: Record<string, unknown>): Promise<PipelineExecutionResult> {
  const pipeline = pipelines.find((p) => p.name === name);
  if (!pipeline) {
    throw new Error(`Pipeline ${name} nicht gefunden`);
  }

  if (!pipeline.enabled) {
    throw new Error(`Pipeline ${name} ist deaktiviert`);
  }

  const source = getDataSourceConfig(pipeline.source);
  if (!source) {
    throw new Error(`Datenquelle ${pipeline.source} nicht registriert`);
  }

  const context = createSyncContext(source, options);
  const stageResults: PipelineExecutionResult['stageResults'] = [];
  let payload: any = { records: [] };

  const startedAt = new Date();

  try {
    for (const stage of pipeline.stages) {
      const stageStart = Date.now();
      payload = await stage.run(context, payload);
      stageResults.push({
        stage: stage.name,
        durationMs: Date.now() - stageStart,
        metadata: { records: Array.isArray(payload.records) ? payload.records.length : undefined },
      });
    }

    return {
      pipeline: pipeline.name,
      runId: context.runId,
      startedAt,
      finishedAt: new Date(),
      status: 'success',
      summary: {
        recordsProcessed: Array.isArray(payload.records) ? payload.records.length : 0,
      },
      stageResults,
    };
  } catch (error: any) {
    logger.error(`Pipeline ${pipeline.name} fehlgeschlagen`, { error: error.message });
    return {
      pipeline: pipeline.name,
      runId: context.runId,
      startedAt,
      finishedAt: new Date(),
      status: 'failed',
      summary: {
        error: error.message,
      },
      stageResults,
    };
  }
}


