import { ProjectModel } from '../models/Project';
import { PipelineModel, PipelineConfig } from '../models/Pipeline';

export interface PipelineStats {
  pipeline: PipelineConfig;
  stats: {
    step: string;
    count: number;
    overdue?: number;
  }[];
  total: number;
}

export class PipelineService {
  static async getPipelineStats(projectType: string, userId?: number): Promise<PipelineStats> {
    const pipeline = PipelineModel.getPipelineConfig(projectType);
    if (!pipeline) {
      throw new Error(`Pipeline type ${projectType} not found`);
    }

    const stats = await Promise.all(
      pipeline.steps.map(async (step) => {
        const projects = await ProjectModel.findAll(userId, projectType, step.id);
        const overdue = projects.filter((p) => {
          if (!p.end_date) return false;
          const endDate = new Date(p.end_date);
          return endDate < new Date() && p.status !== 'completed' && p.status !== 'archived';
        }).length;

        return {
          step: step.id,
          count: projects.length,
          overdue,
        };
      })
    );

    const total = stats.reduce((sum, s) => sum + s.count, 0);

    return {
      pipeline,
      stats,
      total,
    };
  }

  static async getAllPipelineStats(userId?: number): Promise<PipelineStats[]> {
    const allPipelines = PipelineModel.getAllPipelineConfigs();
    return Promise.all(
      allPipelines.map((pipeline) => this.getPipelineStats(pipeline.id, userId))
    );
  }

  static async getProjectsByPipelineStep(
    projectType: string,
    stepId: string,
    userId?: number
  ) {
    return ProjectModel.findAll(userId, projectType, stepId);
  }

  static async moveProjectToStep(projectId: number, stepId: string): Promise<void> {
    await ProjectModel.updatePipelineStep(projectId, stepId);
  }
}








