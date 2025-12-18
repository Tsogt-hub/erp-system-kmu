import { SyncContext, SyncResult } from '../integrations/types';

export type PipelineStageType = 'extract' | 'transform' | 'load';

export interface PipelineStage<TIn = any, TOut = any> {
  name: string;
  type: PipelineStageType;
  description?: string;
  run(context: SyncContext, input: TIn): Promise<TOut>;
}

export interface PipelineDefinition {
  name: string;
  displayName: string;
  description?: string;
  source: string;
  stages: PipelineStage[];
  enabled: boolean;
}

export interface PipelineExecutionResult {
  pipeline: string;
  runId: string;
  startedAt: Date;
  finishedAt: Date;
  status: 'success' | 'warning' | 'failed';
  summary: Record<string, unknown>;
  stageResults: Array<{
    stage: string;
    durationMs: number;
    metadata?: Record<string, unknown>;
  }>;
}


